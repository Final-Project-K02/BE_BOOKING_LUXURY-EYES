import { Router } from "express";
import {
  createPatientProfile,
  deletePatientProfile,
  getMyPatientProfiles,
  getPatientProfileById,
  updatePatientProfile,
} from "./patient-profile.controller.js";
import { checkAuth } from "../../shared/middlewares/checkAuth.js";

const patientProfileRoutes = Router();

patientProfileRoutes.use(checkAuth);
patientProfileRoutes.post("/", createPatientProfile);
patientProfileRoutes.get("/", getMyPatientProfiles);
patientProfileRoutes.get("/:id", getPatientProfileById);
patientProfileRoutes.patch("/:id", updatePatientProfile);
patientProfileRoutes.delete("/:id", deletePatientProfile);

export default patientProfileRoutes;
