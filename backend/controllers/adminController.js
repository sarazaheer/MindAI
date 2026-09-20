import validator from "validator";
import bcrypt from "bcrypt";
import { v2 as cloudinary } from "cloudinary";
import doctorModel from "../models/doctorModel.js";
import jwt from "jsonwebtoken";
import appointmentModel from "../models/appointmentModel.js";
import userModel from "../models/userModel.js";
import { sendAppointmentCancelledEmail } from "../config/mailer.js";

//API FOR ADDING DOCTOR
const addDoctor = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      speciality,
      degree,
      experience,
      about,
      fee,
      address,
    } = req.body;
    const imageFile = req.file;
    //CHECKING FOR ALL DATA TO ADD DOCTOR
    if (
      !name ||
      !email ||
      !password ||
      !speciality ||
      !degree ||
      !experience ||
      !about ||
      !fee ||
      !address
    ) {
      return res.json({ success: false, message: "Missing Details" });
    }

    //VALIDATION EMAIL FORMAT

    if (!validator.isEmail(email)) {
      return res.json({ success: false, message: "Enter Valid Email" });
    }

    // VALIDATING PASSWORD
    if (password.length < 8) {
      return res.json({
        success: false,
        message: "Please Enter a strong Password",
      });
    }

    // Hasing Doctor Password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // UPLOAD IMAGE TO CLOUDINARY
    const imageUpload = await cloudinary.uploader.upload(imageFile.path, {
      resource_type: "image",
    });

    //SAVING DATA TO DB
    const imageUrl = imageUpload.secure_url;
    const doctorData = {
      name,
      email,
      image: imageUrl,
      password: hashedPassword,
      speciality,
      degree,
      experience,
      about,
      fee,
      address: JSON.parse(address),
      date: Date.now(),
    };
    const newDoctor = new doctorModel(doctorData);
    await newDoctor.save();
    res.json({ success: true, message: "Doctor Added" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// API FOR ADMIN LOGIN
const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (
      email === process.env.ADMIN_EMAIL &&
      password === process.env.ADMIN_PASSWORD
    ) {
      const token = jwt.sign(email + password, process.env.JWT_SECRET);
      // BUG FIX: this key was misspelled "sucess" instead of "success".
      // The backend was returning HTTP 200 with a valid token, but since
      // the frontend correctly checks `data.success`, it never found this
      // field and treated every successful admin login as a failure.
      res.json({ success: true, token });
    } else {
      res.json({ success: false, message: "Invalid Credentials" });
    }
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

//API TO GET ALL DOCTORS FROM ADMIN PANEL

const allDoctors = async (req, res) => {
  try {
    const doctors = await doctorModel.find({}).select("-password");
    res.json({ success: true, doctors });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};
//API TO GET ALL APPONTMENT LISTS
const appointmentsAdmin = async (req, res) => {
  try {
    const appointments = await appointmentModel.find({});
    res.json({ success: true, appointments });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};
//CANCEL APPPOINTMENT BY ADMIN
const appointmentCancel = async (req, res) => {
  try {
    const { appointmentId } = req.body;

    const appointmentData = await appointmentModel.findById(appointmentId);
    if (!appointmentData) {
      return res.json({ success: false, message: "Appointment not found" });
    }

    await appointmentModel.findByIdAndUpdate(appointmentId, {
      cancelled: true,
    });

    //RELEASING DOCTOR SLOT

    const { docId, slotDate, slotTime } = appointmentData;

    const doctorData = await doctorModel.findById(docId);
    if (doctorData) {
      let slots_booked = doctorData.slots_booked;

      if (slots_booked[slotDate]) {
        slots_booked[slotDate] = slots_booked[slotDate].filter(
          (e) => e !== slotTime,
        );
        await doctorModel.findByIdAndUpdate(docId, { slots_booked });
      }
    }

    // Notify the patient — they didn't initiate this cancellation, so
    // unlike a self-cancel, they need to actually be told it happened.
    sendAppointmentCancelledEmail({
      patientEmail: appointmentData.userData?.email,
      patientName: appointmentData.userData?.name,
      doctorName: appointmentData.docData?.name,
      slotDate,
      slotTime,
      cancelledBy: "the clinic administration",
    });

    res.json({ success: true, message: "Appointment Cancelled" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

//ADMIN DASHBOARD API

// Groups a timestamp into the Sunday-start of its week — used to bucket
// appointments into weekly trend data below.
const getWeekStart = (dateInput) => {
  const d = new Date(dateInput);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - d.getDay());
  return d.getTime();
};

const adminDashboard = async (req, res) => {
  try {
    const doctors = await doctorModel.find({});
    const users = await userModel.find({});
    const appointments = await appointmentModel.find({});

    const dashData = {
      doctors: doctors.length,
      appointments: appointments.length,
      patients: users.length,
      latestAppointments: appointments.slice(-5).reverse(),
    };

    // ANALYTICS: bucket the last 8 weeks of appointments by week-start,
    // tracking both appointment volume and revenue (revenue only counts
    // completed appointments, matching the same logic doctorDashboard
    // already uses for a single doctor's earnings). This gives the admin
    // an actual trend to look at instead of just static lifetime counts.
    const WEEKS = 8;
    const currentWeekStart = getWeekStart(new Date());
    const weekBuckets = [];
    for (let i = WEEKS - 1; i >= 0; i--) {
      const weekStart = currentWeekStart - i * 7 * 24 * 60 * 60 * 1000;
      weekBuckets.push({
        weekStart,
        label: new Date(weekStart).toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "short",
        }),
        appointments: 0,
        revenue: 0,
      });
    }

    appointments.forEach((appt) => {
      const apptWeekStart = getWeekStart(appt.date);
      const bucket = weekBuckets.find((b) => b.weekStart === apptWeekStart);
      if (bucket) {
        bucket.appointments += 1;
        if (appt.isCompleted) {
          bucket.revenue += appt.amount || 0;
        }
      }
    });

    dashData.weeklyTrends = weekBuckets.map(
      ({ label, appointments, revenue }) => ({
        label,
        appointments,
        revenue,
      }),
    );

    res.json({ success: true, dashData });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// REMOVE DOCTOR

const deleteDoctor = async (req, res) => {
  try {
    const { docId } = req.body;

    // Delete the doctor from the 'doctors' collection
    await doctorModel.findByIdAndDelete(docId);

    // Delete all appointments for that doctor
    await appointmentModel.updateMany({ docId: docId }, { cancelled: true });

    res.json({
      success: true,
      message: "Doctor and all associated appointments have been removed",
    });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// ============================================================
// ADMIN "OWNER" CAPABILITIES — full control over doctors, users,
// and appointment status, beyond the original add/delete/cancel set.
// ============================================================

// EDIT ANY DOCTOR'S DETAILS
// Previously admin could only add or delete a doctor — there was no way
// to correct a typo in a doctor's bio, adjust their fee, or update their
// speciality without deleting and re-adding them (which would also wipe
// their appointment history via the cascade-cancel in deleteDoctor).
const editDoctor = async (req, res) => {
  try {
    const {
      docId,
      name,
      speciality,
      degree,
      experience,
      about,
      fee,
      address,
      available,
    } = req.body;

    if (!docId) {
      return res.json({ success: false, message: "Doctor ID is required" });
    }

    const doctor = await doctorModel.findById(docId);
    if (!doctor) {
      return res.json({ success: false, message: "Doctor not found" });
    }

    const updateFields = {};
    if (name) updateFields.name = name;
    if (speciality) updateFields.speciality = speciality;
    if (degree) updateFields.degree = degree;
    if (experience) updateFields.experience = experience;
    if (about) updateFields.about = about;
    if (fee) updateFields.fee = Number(fee);
    if (typeof available === "boolean") updateFields.available = available;
    if (address) {
      try {
        updateFields.address =
          typeof address === "string" ? JSON.parse(address) : address;
      } catch {
        return res.json({ success: false, message: "Invalid address format" });
      }
    }

    await doctorModel.findByIdAndUpdate(docId, updateFields);
    res.json({ success: true, message: "Doctor Updated" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// VIEW ALL REGISTERED PATIENTS/USERS
// Admin previously had zero visibility into the user base beyond
// appointment records. This gives a real user-management view.
const getAllUsers = async (req, res) => {
  try {
    const users = await userModel.find({}).select("-password");
    res.json({ success: true, users });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// REMOVE A USER ACCOUNT
// Mirrors the same cascade pattern as deleteDoctor: removing a user
// cancels their outstanding appointments rather than leaving orphaned
// records pointing at a deleted account.
const deleteUser = async (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId) {
      return res.json({ success: false, message: "User ID is required" });
    }

    await userModel.findByIdAndDelete(userId);
    await appointmentModel.updateMany({ userId }, { cancelled: true });

    res.json({
      success: true,
      message: "User and their appointments have been removed",
    });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// ADMIN OVERRIDE: MARK ANY APPOINTMENT AS COMPLETED
// Previously only a doctor could mark their own appointment complete.
// As the system owner, admin should be able to override/correct this too
// (e.g. a doctor forgot to mark a visit complete, or an admin is
// reconciling records).
const completeAppointmentAdmin = async (req, res) => {
  try {
    const { appointmentId } = req.body;
    const appointmentData = await appointmentModel.findById(appointmentId);
    if (!appointmentData) {
      return res.json({ success: false, message: "Appointment not found" });
    }

    await appointmentModel.findByIdAndUpdate(appointmentId, {
      isCompleted: true,
    });

    res.json({ success: true, message: "Appointment marked as completed" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

export {
  addDoctor,
  loginAdmin,
  allDoctors,
  appointmentsAdmin,
  appointmentCancel,
  adminDashboard,
  deleteDoctor,
  editDoctor,
  getAllUsers,
  deleteUser,
  completeAppointmentAdmin,
};
