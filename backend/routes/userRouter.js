import express from "express";
import rateLimit from "express-rate-limit";

import {
  registerUser,
  loginUser,
  getProfile,
  updateProfile,
  bookAppointment,
  listAppointment,
  cancelAppointment,
  rescheduleAppointment,
} from "../controllers/userController.js";
import authUser from "../middlewares/authUser.js";
import upload from "../middlewares/multer.js";

const userRouter = express.Router();

// Stricter limit for endpoints that are prime targets for brute-force and
// credential-stuffing abuse.
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 attempts per IP per window
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many attempts. Please try again later.",
  },
});

//REGISTER USER
userRouter.post("/register", authLimiter, registerUser);

//LOGIN USER
userRouter.post("/login", authLimiter, loginUser);

//GET USER DATA
userRouter.get("/get-profile", authUser, getProfile);

//UPDATE PROFILE
// NOTE: swapped order so authUser runs BEFORE the file upload — previously
// upload.single("img") ran first, meaning an unauthenticated request would
// have its file fully processed before ever being checked for a valid
// login. Auth should always gate expensive work like file handling.
userRouter.post(
  "/update-profile",
  authUser,
  upload.single("img"),
  updateProfile,
);

//APPOINTMENT BOOKING API
userRouter.post("/book-appointment", authUser, bookAppointment);

//RESCHEDULE APPOINTMENT API
userRouter.post("/reschedule-appointment", authUser, rescheduleAppointment);

//APOINTMENT PAGE API
userRouter.post("/appointments", authUser, listAppointment);

//CANCEL APPOINTMENT
userRouter.post("/cancel-appointment", authUser, cancelAppointment);

export default userRouter;
