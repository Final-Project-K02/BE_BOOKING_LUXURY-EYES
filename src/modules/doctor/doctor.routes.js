import express from "express";
import {
  createDoctor,
  deleteDoctor,
  getDoctorById,
  getDoctors,
  updateDoctor,
} from "../doctor/doctorController.js";

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

doctorRouter.get("/", checkAuth, getDoctors);

doctorRouter.get("/:id", checkAuth, validate(doctorIdSchema), getDoctorById);

doctorRouter.post(
  "/",
  checkAuth,
  checkPermission([RoleEnum.ADMIN]),
  validate(createDoctorSchema),
  createDoctor,
);

doctorRouter.put(
  "/:id",
  checkAuth,
  checkPermission([RoleEnum.STAFF, RoleEnum.ADMIN]),
  validate(updateDoctorSchema),
  updateDoctor,
);

doctorRouter.delete(
  "/:id",
  checkAuth,
  checkPermission([RoleEnum.ADMIN]),
  validate(doctorIdSchema),
  deleteDoctor,
);

export default doctorRouter;
