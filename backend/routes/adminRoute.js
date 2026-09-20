import express from "express";
import {
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
} from "../controllers/adminController.js";
import upload from "../middlewares/multer.js";
import authAdmin from "../middlewares/authAdmin.js";
import { changeAvailability } from "../controllers/doctorController.js";

const adminRouter = express.Router();

//ADD DOCTOR BY ADMIN
adminRouter.post("/add-doctor", authAdmin, upload.single("image"), addDoctor);

//LOGIN ADMIN ROUTE
adminRouter.post("/login", loginAdmin);

//ALL DOCTOS (MAKE IT GET THEN)
adminRouter.post("/all-doctors", authAdmin, allDoctors);

//CHANGE AVAILIBILITY
adminRouter.post("/change-availability", authAdmin, changeAvailability);

//EDIT DOCTOR DETAILS (admin can now correct/update any doctor's profile)
adminRouter.post("/edit-doctor", authAdmin, editDoctor);

//FOR ALL APPOINTMENTS
adminRouter.get("/appointments", authAdmin, appointmentsAdmin);

//CANCEL APPOINTMENT
adminRouter.post("/cancel-appointment", authAdmin, appointmentCancel);

//ADMIN OVERRIDE: MARK APPOINTMENT COMPLETED
adminRouter.post("/complete-appointment", authAdmin, completeAppointmentAdmin);

//ADMIN DASHBOARD
adminRouter.get("/dashboard", authAdmin, adminDashboard);

//REMOVE DOCTOR
adminRouter.post("/delete-doctor", authAdmin, deleteDoctor);

//VIEW ALL USERS/PATIENTS
adminRouter.get("/all-users", authAdmin, getAllUsers);

//REMOVE A USER ACCOUNT
adminRouter.post("/delete-user", authAdmin, deleteUser);

adminRouter.post("/edit-doctor", authAdmin, editDoctor);
adminRouter.get("/all-users", authAdmin, getAllUsers);
adminRouter.post("/delete-user", authAdmin, deleteUser);
adminRouter.post("/complete-appointment", authAdmin, completeAppointmentAdmin);

export default adminRouter;
