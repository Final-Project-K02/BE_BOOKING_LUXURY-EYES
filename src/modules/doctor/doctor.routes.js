import express from "express";
import {
  createDoctor,
  getDoctors,
  getDoctorById,
  updateDoctor,
  deleteDoctor,
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
doctorRouter.get("/:id", validate(doctorIdSchema), getDoctorById);
doctorRouter.put("/:id", validate(updateDoctorSchema), updateDoctor);
doctorRouter.delete("/:id", validate(doctorIdSchema), deleteDoctor);

export default doctorRouter;