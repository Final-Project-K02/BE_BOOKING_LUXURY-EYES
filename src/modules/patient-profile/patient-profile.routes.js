import { Router } from "express";
import {
  createPatientProfile,
  deletePatientProfile,
  getMyPatientProfiles,
  getPatientProfileById,
  updatePatientProfile,
} from "./patient-profile.controller.js";
import { checkAuth } from "../../shared/middlewares/checkAuth.js";
import validBodyRequest from "../../shared/middlewares/validBodyRequest.js";
import { validate } from "../../middleware/validate.js";
import {
  createPatientProfileSchema,
  updatePatientProfileSchema,
  patientProfileIdSchema,
} from "./patient-profile.schema.js";
import { checkPermission } from "../../shared/middlewares/checkPermission.js";
import { RoleEnum } from "../../shared/constant/enum.js";

const patientProfileRoutes = Router();

patientProfileRoutes.use(checkAuth, checkPermission([RoleEnum.USER]));
patientProfileRoutes.post(
  "/",
  validBodyRequest(createPatientProfileSchema),
  createPatientProfile,
);
patientProfileRoutes.get("/", getMyPatientProfiles);
patientProfileRoutes.get(
  "/:id",
  validate(patientProfileIdSchema),
  getPatientProfileById,
);
patientProfileRoutes.patch(
  "/:id",
  validate(updatePatientProfileSchema),
  updatePatientProfile,
);
patientProfileRoutes.delete(
  "/:id",
  validate(patientProfileIdSchema),
  deletePatientProfile,
);

export default patientProfileRoutes;
