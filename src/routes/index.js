import { Router } from "express";
import authRoutes from "../modules/auth/auth.routes.js";
import userRoutes from "../modules/user/user.routes.js";
import doctorRouter from "../modules/doctor/doctor.routes.js";
import scheduleRouter from "../modules/schedule/schedule.routes.js";

const router = Router();

router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/doctors", doctorRouter);
router.use("/schedules", scheduleRouter);

export default router;
