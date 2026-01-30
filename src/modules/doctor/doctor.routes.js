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
import { checkAuth } from "../../shared/middlewares/checkAuth.js";
import { checkPermission } from "../../shared/middlewares/checkPermission.js";
import { RoleEnum } from "../../shared/constant/enum.js";

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
