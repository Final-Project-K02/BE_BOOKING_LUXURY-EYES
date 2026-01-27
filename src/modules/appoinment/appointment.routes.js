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

const appointmentRouter = express.Router();


appointmentRouter.get("/doctor", getAppointmentsByDoctor);


appointmentRouter.get("/", getAppointments);

appointmentRouter.post(
  "/",
  validate(createAppointmentSchema),
  createAppointment
);

appointmentRouter.put(
  "/:id",
  validate(updateAppointmentStatusSchema),
  updateAppointmentStatus
);

export default appointmentRouter;
