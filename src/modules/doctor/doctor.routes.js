import express from "express";
import {
  createDoctor,
  deleteDoctor,
  getDoctorById,
  getDoctors,
  getDoctorsByAdmin,
  toggleDoctorStatus,
  updateDoctor,
  updateDoctorAvatar,
} from "../doctor/doctor.controller.js";

import { validate } from "../../middleware/validate.js";
import { RoleEnum } from "../../shared/constant/enum.js";
import { checkAuth } from "../../shared/middlewares/checkAuth.js";
import { checkPermission } from "../../shared/middlewares/checkPermission.js";
import {
  createDoctorSchema,
  doctorIdSchema,
  updateDoctorSchema,
} from "../doctor/doctor.schema.js";

const doctorRouter = express.Router();
doctorRouter.post("/", validate(createDoctorSchema), createDoctor);
doctorRouter.get("/", getDoctors);
doctorRouter.get("/admin", getDoctorsByAdmin);

doctorRouter.get("/:id", validate(doctorIdSchema), getDoctorById);
doctorRouter.put("/:id", validate(updateDoctorSchema), updateDoctor);
doctorRouter.delete("/:id", validate(doctorIdSchema), deleteDoctor);

doctorRouter.patch("/:id/status", toggleDoctorStatus);
doctorRouter.patch(
  "/:id/avatar",
  checkAuth,
  checkPermission,
  updateDoctorAvatar,
);
export default doctorRouter;
