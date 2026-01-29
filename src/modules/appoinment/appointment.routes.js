import express from "express";
import {
  getAppointments,
  createAppointment,
  updateAppointmentStatus,
  getAppointmentsByDoctor,
} from "./appointment.controller.js";

import {
  createAppointmentSchema,
  updateAppointmentStatusSchema,
} from "./appointment.schema.js";
import { validate } from "../../middleware/validate.js";
import { check } from "zod";
import { checkAuth } from "../../shared/middlewares/checkAuth.js";

const appointmentRouter = express.Router();

appointmentRouter.get("/doctor", getAppointmentsByDoctor);
appointmentRouter.get("/", getAppointments);
appointmentRouter.post(
  "/",
  checkAuth,
  validate(createAppointmentSchema),
  createAppointment
);
appointmentRouter.patch(
  "/:id",
  validate(updateAppointmentStatusSchema),
  updateAppointmentStatus
);

export default appointmentRouter;
