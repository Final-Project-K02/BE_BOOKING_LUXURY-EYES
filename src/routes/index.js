import { Router } from "express";
import authRoutes from "../modules/auth/auth.routes.js";
import userRoutes from "../modules/user/user.routes.js";
import doctorRouter from "../modules/doctor/doctor.routes.js";

const router = Router()

router.use("/auth", authRoutes);
router.use("/", userRoutes);
router.use("/doctors", doctorRouter)

export default router;
