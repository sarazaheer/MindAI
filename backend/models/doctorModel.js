import mongoose from "mongoose";
const doctorSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    image: {
      type: String,
      required: true,
    },
    speciality: {
      type: String,
      required: true,
    },
    degree: {
      type: String,
      required: true,
    },
    experience: {
      type: String,
      required: true,
    },
    about: {
      type: String,
      required: true,
    },
    available: {
      type: Boolean,
      default: true,
    },
    fee: {
      type: Number,
      required: true,
    },
    address: {
      type: Object,
      required: true,
    },
    date: { type: Number, required: true },
    slots_booked: { type: Object, default: {} },

    // NEW: doctor-controlled availability. Previously every doctor was
    // hardcoded to be "available" every single day, 10am-9pm — there was
    // no way for a doctor to say "I don't work Fridays" or "I'm off next
    // Tuesday" without manually going in and blocking every single slot
    // by hand. These three fields let a doctor set that from their own
    // dashboard, and both the frontend slot picker AND the backend
    // booking/reschedule logic now respect them.

    // Which days of the week this doctor accepts appointments on.
    // 0 = Sunday ... 6 = Saturday, matching JS's Date.getDay().
    // Defaults to all 7 days so existing doctors keep behaving exactly
    // as before until they explicitly change it.
    workingDays: {
      type: [Number],
      default: [0, 1, 2, 3, 4, 5, 6],
    },

    // Daily working hours, in 24-hour "HH:MM" format. Defaults match the
    // previous hardcoded 10:00-21:00 window.
    workingHours: {
      start: { type: String, default: "10:00" },
      end: { type: String, default: "21:00" },
    },

    // Specific one-off dates this doctor is unavailable regardless of
    // their normal working days (e.g. a single day off, a holiday).
    // Stored in the same "day_month_year" string format already used
    // throughout the app for slotDate (e.g. "8_7_2026"), so it can be
    // compared directly against existing slot-date logic with no
    // reformatting needed.
    blockedDates: {
      type: [String],
      default: [],
    },
  },
  { minimize: false }
);
const doctorModel =
  mongoose.models.doctor || mongoose.model("doctor", doctorSchema);

export default doctorModel;