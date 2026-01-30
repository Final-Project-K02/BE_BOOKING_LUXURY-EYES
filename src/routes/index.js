import { Router } from "express";
import authRoutes from "../modules/auth/auth.routes.js";
import userRoutes from "../modules/user/user.routes.js";
import doctorRouter from "../modules/doctor/doctor.routes.js";
import scheduleRouter from "../modules/schedule/schedule.routes.js";
import appointmentRoutes from "../modules/appointment/appointment.routes.js";
import { getDoctorsByAdmin } from "../modules/doctor/doctorController.js";
import { checkAuth } from "../shared/middlewares/checkAuth.js";
import { checkPermission } from "../shared/middlewares/checkPermission.js";
const router = Router();

router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/doctors", doctorRouter);
router.use("/schedules", scheduleRouter);
router.use("/appointments", appointmentRoutes);
router.get(
  "/admin/doctors",
  checkAuth,checkPermission,
 
  getDoctorsByAdmin
);

export default router;
