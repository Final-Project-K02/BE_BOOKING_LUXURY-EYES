import { Router } from "express";
import doctorRouter from "../modules/doctor/doctor.routes.js";

const router = Router()
router.use("/doctors", doctorRouter)
export default router;
