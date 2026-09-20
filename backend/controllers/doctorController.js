import doctorModel from "../models/doctorModel.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import appointmentModel from "../models/appointmentModel.js";
import { sendAppointmentCancelledEmail } from "../config/mailer.js";
import { isSlotWithinAvailability } from "../utils/availability.js";

//CHANGE AVAILABILTY
const changeAvailability = async (req, res) => {
  try {
    const { docId } = req.body;

    const docData = await doctorModel.findById(docId);
    if (!docData) {
      // Defensive check — previously this would throw a raw
      // "Cannot read properties of null" error if an invalid/deleted
      // docId was ever passed, instead of a clean response.
      return res.json({ success: false, message: "Doctor not found" });
    }

    await doctorModel.findByIdAndUpdate(docId, {
      available: !docData.available,
    });
    res.json({ success: true, message: "Availability Changed" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

const doctorList = async (req, res) => {
  try {
    const doctors = await doctorModel.find({}).select(["-password", "-email"]);
    res.json({ success: true, doctors });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

//DOCTOR LOGIN
const doctorLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const doctor = await doctorModel.findOne({ email });

    if (!doctor) {
      return res.json({ success: false, message: "Invalid Credentials" });
    }

    const isMatch = await bcrypt.compare(password, doctor.password);

    if (isMatch) {
      const token = jwt.sign({ id: doctor._id }, process.env.JWT_SECRET);
      // BUG FIX: this key was misspelled "sucess" instead of "success" —
      // the exact same typo we found (and fixed) in admin login. Since the
      // frontend correctly checks `data.success`, this meant doctor login
      // never actually completed successfully from the frontend's point
      // of view, even with correct credentials and a valid token issued.
      res.json({ success: true, token });
    } else {
      return res.json({ success: false, message: "Invalid Credentials" });
    }
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

//ALL APPOINTMENT OF SPECIFIC DOCTOR
const appointmentsDoctor = async (req, res) => {
  try {
    const docId = req.docId;

    const appointments = await appointmentModel.find({ docId });

    res.json({ success: true, appointments });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// API TO MARK APPOINTMENT COMPLETED
const appointmentComplete = async (req, res) => {
  try {
    const docId = req.docId;
    const { appointmentId } = req.body;

    const appointmentData = await appointmentModel.findById(appointmentId);

    if (
      appointmentData &&
      appointmentData.docId.toString() === docId.toString()
    ) {
      await appointmentModel.findByIdAndUpdate(appointmentId, {
        isCompleted: true,
      });
      return res.json({ success: true, message: "Appointment Completed" });
    } else {
      // BUG FIX: was `success: False` (capital F) — not a valid JS value.
      // This threw a ReferenceError that got caught by the catch block
      // below, so doctors saw "False is not defined" instead of a clean
      // "Operation Failed" message.
      return res.json({
        success: false,
        message: "Operation Failed",
      });
    }
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

//API TO CANCEL APPOINTMENT:
const appointmentCancel = async (req, res) => {
  try {
    const docId = req.docId;
    const { appointmentId } = req.body;

    const appointmentData = await appointmentModel.findById(appointmentId);

    if (
      appointmentData &&
      appointmentData.docId.toString() === docId.toString()
    ) {
      await appointmentModel.findByIdAndUpdate(appointmentId, {
        cancelled: true,
      });

      // Notify the patient — same shared helper used for admin
      // cancellations, just with a different "cancelled by" attribution
      // so the email correctly reflects who actually cancelled it.
      sendAppointmentCancelledEmail({
        patientEmail: appointmentData.userData?.email,
        patientName: appointmentData.userData?.name,
        doctorName: appointmentData.docData?.name,
        slotDate: appointmentData.slotDate,
        slotTime: appointmentData.slotTime,
        cancelledBy: `Dr. ${appointmentData.docData?.name || "your doctor"}`,
      });

      return res.json({ success: true, message: "Appointment Cancelled" });
    } else {
      // Same False -> false fix as appointmentComplete above.
      return res.json({
        success: false,
        message: "Operation Failed",
      });
    }
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

//API TO GET DASHBOARD DATA FOR DOCTOR PANEL

// Same week-bucketing helper as the admin dashboard — groups a timestamp
// into the Sunday-start of its week.
const getWeekStart = (dateInput) => {
  const d = new Date(dateInput);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - d.getDay());
  return d.getTime();
};

const doctorDashboard = async (req, res) => {
  try {
    const docId = req.docId;
    const appointments = await appointmentModel.find({ docId });
    let earnings = 0;

    appointments.forEach((item) => {
      if (item.isCompleted) {
        earnings += item.amount;
      }
    });

    let patients = [];
    appointments.forEach((item) => {
      if (!patients.includes(item.userId)) {
        patients.push(item.userId);
      }
    });

    // ANALYTICS: this doctor's own appointments/earnings trend over the
    // last 8 weeks — same pattern as the admin-wide version, just scoped
    // to appointments belonging to this docId only.
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
        earnings: 0,
      });
    }

    appointments.forEach((appt) => {
      const apptWeekStart = getWeekStart(appt.date);
      const bucket = weekBuckets.find((b) => b.weekStart === apptWeekStart);
      if (bucket) {
        bucket.appointments += 1;
        if (appt.isCompleted) {
          bucket.earnings += appt.amount || 0;
        }
      }
    });

    const dashData = {
      earnings,
      appointments: appointments.length,
      patients: patients.length,
      // Only reverse the small slice we actually need, rather than
      // reversing the doctor's entire appointment history just to grab 5.
      latestAppointments: appointments.slice(-5).reverse(),
      weeklyTrends: weekBuckets.map(({ label, appointments, earnings }) => ({
        label,
        appointments,
        earnings,
      })),
    };
    res.json({ success: true, dashData });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

//TO GET THE DOCTOR PROFILE
const doctorProfile = async (req, res) => {
  try {
    const docId = req.docId;

    const profileData = await doctorModel.findById(docId).select("-password");

    res.json({ success: true, profileData });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

//API TO UPDATE DOCTOR PROFILE DATA FROM DOCTOR PANEL
const updateDoctorProfile = async (req, res) => {
  try {
    const docId = req.docId;
    const {
      fee,
      address,
      available,
      workingDays,
      workingHours,
      blockedDates,
      confirmCancelConflicts, // true only when the doctor has already seen
      // and confirmed the conflict list below
    } = req.body;

    const updateFields = {};
    if (fee !== undefined) updateFields.fee = fee;
    if (address !== undefined) updateFields.address = address;
    if (available !== undefined) updateFields.available = available;

    // NEW: availability settings. Validate defensively rather than
    // trusting the client blindly — a malformed workingDays array (e.g.
    // containing 7, or a non-array) could otherwise corrupt the schema's
    // expected [0-6] range in a way that silently breaks slot generation
    // for every future booking against this doctor.
    if (workingDays !== undefined) {
      if (
        !Array.isArray(workingDays) ||
        workingDays.some((d) => !Number.isInteger(d) || d < 0 || d > 6)
      ) {
        return res.json({
          success: false,
          message: "Working days must be an array of numbers between 0 and 6.",
        });
      }
      updateFields.workingDays = workingDays;
    }

    if (workingHours !== undefined) {
      const timePattern = /^([01]\d|2[0-3]):([0-5]\d)$/;
      if (
        !workingHours?.start ||
        !workingHours?.end ||
        !timePattern.test(workingHours.start) ||
        !timePattern.test(workingHours.end) ||
        workingHours.start >= workingHours.end
      ) {
        return res.json({
          success: false,
          message: "Working hours must be valid, with start before end.",
        });
      }
      updateFields.workingHours = workingHours;
    }

    if (blockedDates !== undefined) {
      if (!Array.isArray(blockedDates)) {
        return res.json({
          success: false,
          message: "Blocked dates must be a list of dates.",
        });
      }
      updateFields.blockedDates = blockedDates;
    }

    // CONFLICT DETECTION: if the doctor is changing anything about their
    // availability, check whether any existing upcoming appointment would
    // now fall outside the NEW settings. Previously a doctor could block
    // a date (or drop a working day) that already had confirmed bookings
    // on it, and those bookings would just silently sit there, completely
    // unaffected — the doctor would show as unavailable that day while a
    // patient still had a confirmed appointment for it.
    const availabilityChanging =
      workingDays !== undefined ||
      workingHours !== undefined ||
      blockedDates !== undefined;

    if (availabilityChanging) {
      const currentDoctor = await doctorModel.findById(docId);
      if (!currentDoctor) {
        return res.json({ success: false, message: "Doctor not found" });
      }

      // The full proposed availability profile — changed fields merged
      // with whatever wasn't touched in this request.
      const proposedDoctor = {
        workingDays:
          workingDays !== undefined
            ? updateFields.workingDays
            : currentDoctor.workingDays,
        workingHours:
          workingHours !== undefined
            ? updateFields.workingHours
            : currentDoctor.workingHours,
        blockedDates:
          blockedDates !== undefined
            ? updateFields.blockedDates
            : currentDoctor.blockedDates,
      };

      const activeAppointments = await appointmentModel.find({
        docId,
        cancelled: false,
        isCompleted: false,
      });

      const now = new Date();
      const conflicts = activeAppointments.filter((appt) => {
        const [d, m, y] = appt.slotDate.split("_").map(Number);
        const apptDateTime = new Date(`${m}/${d}/${y} ${appt.slotTime}`);
        if (isNaN(apptDateTime.getTime()) || apptDateTime < now) return false; // ignore past appointments

        // Reuses the exact same check the backend uses to VALIDATE new
        // bookings — same source of truth, no duplicated logic that could
        // drift out of sync with what actually gets enforced at booking
        // time.
        return !isSlotWithinAvailability(
          proposedDoctor,
          appt.slotDate,
          appt.slotTime,
        );
      });

      if (conflicts.length > 0 && !confirmCancelConflicts) {
        // Don't apply anything yet — surface the conflicts and let the
        // doctor explicitly decide, rather than silently either dropping
        // the change or silently orphaning the appointments.
        return res.json({
          success: false,
          conflictsFound: true,
          message: `This change conflicts with ${conflicts.length} upcoming appointment${
            conflicts.length > 1 ? "s" : ""
          }.`,
          conflicts: conflicts.map((c) => ({
            appointmentId: c._id,
            patientName: c.userData?.name || "Unknown",
            slotDate: c.slotDate,
            slotTime: c.slotTime,
          })),
        });
      }

      if (conflicts.length > 0 && confirmCancelConflicts) {
        // Doctor explicitly confirmed — cancel each conflicting
        // appointment, release its slot, and notify the patient via the
        // same email helper used for admin/doctor-initiated cancellations
        // elsewhere in the app.
        for (const appt of conflicts) {
          await appointmentModel.findByIdAndUpdate(appt._id, {
            cancelled: true,
          });

          if (currentDoctor.slots_booked?.[appt.slotDate]) {
            await doctorModel.findByIdAndUpdate(docId, {
              $pull: { [`slots_booked.${appt.slotDate}`]: appt.slotTime },
            });
          }

          sendAppointmentCancelledEmail({
            patientEmail: appt.userData?.email,
            patientName: appt.userData?.name,
            doctorName: appt.docData?.name,
            slotDate: appt.slotDate,
            slotTime: appt.slotTime,
            cancelledBy: `Dr. ${appt.docData?.name || "your doctor"} due to a schedule change`,
          });
        }
      }
    }

    await doctorModel.findByIdAndUpdate(docId, updateFields);

    res.json({ success: true, message: "Profile Updated" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

export {
  changeAvailability,
  doctorList,
  doctorLogin,
  appointmentsDoctor,
  appointmentCancel,
  appointmentComplete,
  doctorDashboard,
  doctorProfile,
  updateDoctorProfile,
};
