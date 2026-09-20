import validator from "validator";
import bcrypt from "bcrypt";
import userModel from "../models/userModel.js";
import jwt from "jsonwebtoken";
import { v2 as cloudinary } from "cloudinary";
import doctorModel from "../models/doctorModel.js";
import appointmentModel from "../models/appointmentModel.js";
import fs from "fs";
import { sendAppointmentRescheduledEmail } from "../config/mailer.js";
import PDFDocument from "pdfkit";
import { isSlotWithinAvailability } from "../utils/availability.js";

const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.json({ success: false, message: "Missing Details" });
    }
    if (!validator.isEmail(email)) {
      return res.json({ success: false, message: "Enter a valid email" });
    }
    if (password.length < 8) {
      return res.json({ success: false, message: "Enter a strong password" });
    }

    const existingUser = await userModel.findOne({ email });
    if (existingUser && existingUser.isVerified) {
      return res.json({ success: false, message: "Email already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    if (existingUser) {
      existingUser.name = name;
      existingUser.password = hashedPassword;
      existingUser.isVerified = true;
      await existingUser.save();
    } else {
      await new userModel({
        name,
        email,
        password: hashedPassword,
        isVerified: true,
      }).save();
    }

    const user = await userModel.findOne({ email });
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
    res.json({ success: true, message: "Account created successfully", token });
  } catch (error) {
    console.error("Registration error:", error);
    res.json({ success: false, message: "Something went wrong on the server" });
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await userModel.findOne({ email });
    const genericFailMessage = "Incorrect email or password";

    if (!user) {
      return res.json({ success: false, message: genericFailMessage });
    }
    const isMatch = await bcrypt.compare(password, user.password);

    if (isMatch) {
      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
      res.json({ success: true, token });
    } else {
      res.json({ success: false, message: genericFailMessage });
    }
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

const getProfile = async (req, res) => {
  try {
    const userId = req.userId;
    const userData = await userModel.findById(userId).select("-password");

    res.json({ success: true, userData });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// API TO UPDATE THE USER PROFILE
const updateProfile = async (req, res) => {
  try {
    // SECURITY FIX: userId now comes from the authenticated token
    // (req.userId, set by the authUser middleware) instead of req.body.
    // Previously it trusted a client-supplied userId in the request body,
    // meaning any logged-in user could update ANY other user's profile
    // just by passing a different id — a real IDOR vulnerability.
    const userId = req.userId;
    const { name, phone, address, dob, gender } = req.body;
    const imageFile = req.file;
    if (!name || !phone || !dob || !gender) {
      return res.json({ success: false, message: "Data Missing" });
    }

    let parsedAddress;
    try {
      parsedAddress = JSON.parse(address);
    } catch {
      return res.json({ success: false, message: "Invalid address format" });
    }

    await userModel.findByIdAndUpdate(userId, {
      name,
      phone,
      address: parsedAddress,
      dob,
      gender,
    });
    if (imageFile) {
      // UPLOAD USER IMAGE TO CLOUDINARY
      const imageUpload = await cloudinary.uploader.upload(imageFile.path, {
        resource_type: "image",
      });

      const imageUrl = imageUpload.secure_url;
      await userModel.findByIdAndUpdate(userId, { img: imageUrl });

      // Clean up the local temp file multer wrote to disk — previously
      // left behind indefinitely, slowly filling up server storage.
      fs.unlink(imageFile.path, (err) => {
        if (err) console.log("Temp file cleanup failed:", err.message);
      });
    }
    res.json({ success: true, message: "Profile Updated" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// LOGIC TO BOOK THE APPOINTMENT WITH DOCTOR
const bookAppointment = async (req, res) => {
  try {
    // SECURITY/CONSISTENCY FIX: previously this manually re-verified a JWT
    // from req.headers.token, duplicating what the authUser middleware
    // (already applied on this route) does. Now it uses req.userId like
    // every other authenticated controller here, so there's one single
    // source of truth for "who is making this request."
    const userId = req.userId;

    const { docId, slotDate, slotTime } = req.body;
    if (!docId || !slotDate || !slotTime) {
      return res.json({
        success: false,
        message: "Missing appointment details",
      });
    }

    const docData = await doctorModel.findById(docId).select("-password");
    if (!docData) {
      return res.json({ success: false, message: "Doctor not found" });
    }

    if (!docData.available) {
      return res.json({ success: false, message: "Doctor Not Available" });
    }

    // NEW: server-side enforcement of the doctor's own working
    // days/hours/blocked dates — never trust that a request only ever
    // comes from the frontend's slot picker, which only shows valid
    // options but can't stop a direct API request for an invalid one.
    if (!isSlotWithinAvailability(docData, slotDate, slotTime)) {
      return res.json({
        success: false,
        message: "This slot is outside the doctor's available hours.",
      });
    }

    let slots_booked = docData.slots_booked;

    if (slots_booked[slotDate]) {
      if (slots_booked[slotDate].includes(slotTime)) {
        return res.json({ success: false, message: "Slot Not Available" });
      } else {
        slots_booked[slotDate].push(slotTime);
      }
    } else {
      slots_booked[slotDate] = [slotTime];
    }

    const userData = await userModel.findById(userId).select("-password");
    if (!userData) {
      // Defensive check: even with the authUser middleware now verifying
      // the account exists before this point, this guards against a
      // deleted-mid-request race and turns what was previously an ugly
      // mongoose validation crash ("userData: Path `userData` is
      // required") into a clean, actionable error message that also
      // signals the frontend to log this user out.
      return res.json({
        success: false,
        message: "Your account could not be found. Please sign in again.",
        sessionExpired: true,
      });
    }

    // Use a plain object snapshot of the doctor (without slots_booked)
    // rather than mutating the mongoose document with `delete`, which
    // doesn't reliably strip fields before the object is embedded/saved.
    const docDataObj = docData.toObject();
    delete docDataObj.slots_booked;

    const appointmentData = {
      userId,
      docId,
      userData,
      docData: docDataObj,
      amount: docData.fee,
      slotTime,
      slotDate,
      date: Date.now(),
    };

    const newAppointment = new appointmentModel(appointmentData);
    await newAppointment.save();

    await doctorModel.findByIdAndUpdate(docId, { slots_booked });

    res.json({ success: true, message: "Appointment Booked" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// GET LIST OF APPOINTMENTS FOR FRONTEND
const listAppointment = async (req, res) => {
  try {
    const userId = req.userId;
    const appointments = await appointmentModel.find({ userId });

    res.json({ success: true, appointments });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// Logic To Cancel the Appointment
const cancelAppointment = async (req, res) => {
  try {
    const { appointmentId } = req.body;
    const userId = req.userId;

    const appointmentData = await appointmentModel.findById(appointmentId);
    if (!appointmentData) {
      return res.json({ success: false, message: "Appointment not found" });
    }

    // Compare as strings explicitly — appointmentData.userId is an
    // ObjectId, userId is a string; using !== directly can behave
    // unpredictably, .toString() makes the comparison unambiguous.
    if (appointmentData.userId.toString() !== userId.toString()) {
      return res.json({ success: false, message: "Unauthorized Action" });
    }

    await appointmentModel.findByIdAndUpdate(appointmentId, {
      cancelled: true,
    });

    const { docId, slotDate, slotTime } = appointmentData;
    const doctorData = await doctorModel.findById(docId);
    let slots_booked = doctorData.slots_booked;

    slots_booked[slotDate] = slots_booked[slotDate].filter(
      (e) => e !== slotTime,
    );

    await doctorModel.findByIdAndUpdate(docId, { slots_booked });

    res.json({ success: true, message: "Appointment Cancelled" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// LOGIC TO RESCHEDULE AN EXISTING APPOINTMENT
// Lets a patient move their appointment to a new day/time without going
// through cancel + rebook. Uses the same atomic slot-reservation pattern
// that bookAppointment should also eventually adopt: the "is this slot
// free?" check and the "reserve it" write happen as a single database
// operation (findOneAndUpdate with a filter condition), so two people
// can't both successfully grab the same slot at the same instant — a
// classic race condition that a plain read-then-write can't prevent.
const rescheduleAppointment = async (req, res) => {
  try {
    const userId = req.userId;
    const { appointmentId, slotDate, slotTime } = req.body;

    if (!appointmentId || !slotDate || !slotTime) {
      return res.json({
        success: false,
        message: "Missing reschedule details",
      });
    }

    const appointment = await appointmentModel.findById(appointmentId);
    if (!appointment) {
      return res.json({ success: false, message: "Appointment not found" });
    }
    if (appointment.userId.toString() !== userId.toString()) {
      return res.json({ success: false, message: "Unauthorized Action" });
    }
    if (appointment.cancelled || appointment.isCompleted) {
      return res.json({
        success: false,
        message: "This appointment can no longer be rescheduled",
      });
    }
    if (
      appointment.slotDate === slotDate &&
      appointment.slotTime === slotTime
    ) {
      return res.json({
        success: false,
        message: "That is already your current appointment time",
      });
    }

    const docId = appointment.docId;

    // NEW: same server-side availability enforcement as bookAppointment —
    // fetch the doctor's current working days/hours/blocked dates and
    // reject the reschedule if the requested slot falls outside them,
    // before attempting to atomically reserve it.
    const doctorForCheck = await doctorModel.findById(docId);
    if (!doctorForCheck) {
      return res.json({ success: false, message: "Doctor not found" });
    }
    if (!isSlotWithinAvailability(doctorForCheck, slotDate, slotTime)) {
      return res.json({
        success: false,
        message: "This slot is outside the doctor's available hours.",
      });
    }

    // Atomically reserve the NEW slot. This fails to match (returns null)
    // if someone else grabbed that exact slot in the meantime, or if the
    // doctor is no longer available — either way, nothing gets
    // double-booked.
    const updatedDoctor = await doctorModel.findOneAndUpdate(
      {
        _id: docId,
        available: true,
        [`slots_booked.${slotDate}`]: { $ne: slotTime },
      },
      { $push: { [`slots_booked.${slotDate}`]: slotTime } },
      { new: true },
    );

    if (!updatedDoctor) {
      return res.json({
        success: false,
        message: "That slot is no longer available. Please choose another.",
      });
    }

    // Only release the OLD slot once the new one is safely secured —
    // never release before reserving, or a failed reservation would leave
    // the patient with no slot held at all.
    await doctorModel.findByIdAndUpdate(docId, {
      $pull: { [`slots_booked.${appointment.slotDate}`]: appointment.slotTime },
    });

    const oldSlotDate = appointment.slotDate;
    const oldSlotTime = appointment.slotTime;

    appointment.slotDate = slotDate;
    appointment.slotTime = slotTime;
    await appointment.save();

    sendAppointmentRescheduledEmail({
      patientEmail: appointment.userData?.email,
      patientName: appointment.userData?.name,
      doctorName: appointment.docData?.name,
      oldSlotDate,
      oldSlotTime,
      newSlotDate: slotDate,
      newSlotTime: slotTime,
    });

    res.json({ success: true, message: "Appointment Rescheduled" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// FEATURE: DOWNLOADABLE APPOINTMENT HISTORY (PDF)
// Generates a clean PDF summary of the patient's full appointment history
// on demand — useful for their own records, or to show a new/different
// doctor a summary of past visits. Uses pdfkit (pure Node, no headless
// browser) since Puppeteer-based PDF generation would be too heavy for
// Render's free tier (large Chromium download, high memory use).
const exportAppointmentHistory = async (req, res) => {
  try {
    const userId = req.userId;
    const userData = await userModel.findById(userId).select("-password");
    if (!userData) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    const appointments = await appointmentModel
      .find({ userId })
      .sort({ date: -1 });

    const doc = new PDFDocument({ margin: 50, size: "A4" });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="MindAI-Appointment-History.pdf"`,
    );

    // Stream the PDF directly to the response as it's generated, rather
    // than building the whole file in memory first — keeps memory usage
    // low regardless of how many appointments a patient has.
    doc.pipe(res);

    // Header
    doc.fontSize(20).fillColor("#1e40af").text("MindAI", { continued: false });
    doc
      .fontSize(14)
      .fillColor("#111827")
      .text("Appointment History", { continued: false });
    doc.moveDown(0.5);
    doc
      .fontSize(10)
      .fillColor("#6b7280")
      .text(`Patient: ${userData.name}`)
      .text(`Email: ${userData.email}`)
      .text(`Generated: ${new Date().toLocaleString()}`);
    doc.moveDown(1);

    doc.strokeColor("#e5e7eb").moveTo(50, doc.y).lineTo(545, doc.y).stroke();
    doc.moveDown(1);

    if (appointments.length === 0) {
      doc.fontSize(11).fillColor("#374151").text("No appointments found.");
    } else {
      appointments.forEach((appt, index) => {
        const status = appt.cancelled
          ? "Cancelled"
          : appt.isCompleted
            ? "Completed"
            : "Upcoming";
        const statusColor = appt.cancelled
          ? "#dc2626"
          : appt.isCompleted
            ? "#16a34a"
            : "#2563eb";

        // Start a fresh page instead of letting a single appointment's
        // details awkwardly split across a page break.
        if (doc.y > 700) {
          doc.addPage();
        }

        doc
          .fontSize(12)
          .fillColor("#111827")
          .text(`${index + 1}. Dr. ${appt.docData?.name || "Unknown"}`);
        doc
          .fontSize(10)
          .fillColor("#6b7280")
          .text(`   Speciality: ${appt.docData?.speciality || "N/A"}`)
          .text(`   Date & Time: ${appt.slotDate}, ${appt.slotTime}`)
          .text(`   Fee: ${appt.amount} rs`);
        doc.fontSize(10).fillColor(statusColor).text(`   Status: ${status}`);
        doc.moveDown(0.8);
      });
    }

    doc.end();
  } catch (error) {
    console.log(error);
    // NOTE: since the PDF stream may have already started sending headers
    // by the time an error occurs mid-generation, guard against trying to
    // send a second response on top of a stream already in progress.
    if (!res.headersSent) {
      res.status(500).json({ success: false, message: error.message });
    } else {
      res.end();
    }
  }
};

export {
  registerUser,
  loginUser,
  getProfile,
  updateProfile,
  bookAppointment,
  listAppointment,
  cancelAppointment,
  rescheduleAppointment,
  exportAppointmentHistory,
};
