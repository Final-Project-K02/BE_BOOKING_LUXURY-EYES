import { Router } from "express";
import authRoutes from "../modules/auth/auth.routes.js";
import userRoutes from "../modules/user/user.routes.js";
import doctorRouter from "../modules/doctor/doctor.routes.js";
import scheduleRouter from "../modules/schedule/schedule.routes.js";
import { getDoctorsByAdmin } from "../modules/doctor/doctorController.js";
import { checkAuth } from "../shared/middlewares/checkAuth.js";
import { checkPermission } from "../shared/middlewares/checkPermission.js";
import patientProfileRoutes from "../modules/patient-profile/patient-profile.routes.js";
import appointmentRouter from "../modules/appointment/appointment.routes.js";

const router = Router();

router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/doctors", doctorRouter);
router.use("/schedules", scheduleRouter);
router.use("/appointments", appointmentRouter);
router.get(
  "/admin/doctors",
  checkAuth,
  checkPermission,

  getDoctorsByAdmin,
);

router.use("/patient-profile", patientProfileRoutes);
export default router;
