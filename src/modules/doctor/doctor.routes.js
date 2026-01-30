import express from "express";
import {
  createDoctor,
  getDoctors,
  getDoctorById,
  updateDoctor,
  deleteDoctor,
  toggleDoctorStatus,
  getDoctorsByAdmin,
} from "../doctor/doctorController.js";

import {
  createDoctorSchema,
  updateDoctorSchema,
  doctorIdSchema,
} from "../doctor/doctor.schema.js";
import { validate } from "../../middleware/validate.js";

const doctorRouter = express.Router();

doctorRouter.post("/", validate(createDoctorSchema), createDoctor);
doctorRouter.get("/", getDoctors);
doctorRouter.get("/admin", getDoctorsByAdmin);


doctorRouter.get("/:id", validate(doctorIdSchema), getDoctorById);
doctorRouter.put("/:id", validate(updateDoctorSchema), updateDoctor);
doctorRouter.delete("/:id", validate(doctorIdSchema), deleteDoctor);
doctorRouter.patch("/:id/status", toggleDoctorStatus);
export default doctorRouter;