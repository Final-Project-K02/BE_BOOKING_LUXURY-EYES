import { Router } from "express";
import doctorRouter from "../modules/doctor/doctor.routes.js";
import scheduleRouter from "../modules/schedule/schedule.routes.js";

const router = Router()
router.use("/doctors", doctorRouter)
router.use("/schedules", scheduleRouter)

export default router;
