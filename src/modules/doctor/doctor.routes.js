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

const router = express.Router();

router.post("/", validate(createDoctorSchema), createDoctor);
router.get("/", getDoctors);
router.get("/:id", validate(doctorIdSchema), getDoctorById);
router.put("/:id", validate(updateDoctorSchema), updateDoctor);
router.delete("/:id", validate(doctorIdSchema), deleteDoctor);

export default router;
