import express from "express";
import {
  appointmentsDoctor,
  doctorList,
  doctorLogin,
  appointmentComplete,
  appointmentCancel,
  doctorDashboard,
  doctorProfile,
  updateDoctorProfile,
} from "../controllers/doctorController.js";
import authDoctor from "../middlewares/authDoctor.js";

const doctorRouter = express.Router();

doctorRouter.get("/list", doctorList);

//API TO LOGIN DOCTOR
doctorRouter.post("/login", doctorLogin);

///API FOR APPOINTMENTS
doctorRouter.get("/appointments", authDoctor, appointmentsDoctor);

//API FOR APPOINTMENT COMPLETE
doctorRouter.post("/complete-appointment", authDoctor, appointmentComplete);

//API FOR APPNTMT CANCELATION
doctorRouter.post("/cancel-appointment", authDoctor, appointmentCancel);

//DASHBOARD DATA
doctorRouter.get("/dashboard", authDoctor, doctorDashboard);

//GET DOCTOR PROFILE
doctorRouter.get("/profile", authDoctor, doctorProfile);

//EDIT DOCTOR PROFILE
doctorRouter.post("/update-profile", authDoctor, updateDoctorProfile);

export default doctorRouter;
