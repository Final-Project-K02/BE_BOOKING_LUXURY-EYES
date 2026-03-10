import express from "express";
import {
  getAppointments,
  createAppointment,
  updateAppointmentStatus,
  getAppointmentsByDoctor,
  requestCancelAppointment,
} from "./appointment.controller.js";

import {
  createAppointmentSchema,
  updateAppointmentStatusSchema,
} from "./appointment.schema.js";
import { validate } from "../../middleware/validate.js";
import { checkAuth } from "../../shared/middlewares/checkAuth.js";
import { checkPermission } from "../../shared/middlewares/checkPermission.js";
import { RoleEnum } from "../../shared/constant/enum.js";

const appointmentRouter = express.Router();

appointmentRouter.use(checkAuth);
appointmentRouter.get("/doctor", getAppointmentsByDoctor);
appointmentRouter.get("/", getAppointments);
appointmentRouter.post(
  "/",
  checkPermission([RoleEnum.USER]),
  validate(createAppointmentSchema),
  createAppointment,
);
appointmentRouter.post(
  "/:id/cancel",
  checkPermission([RoleEnum.USER]),
  requestCancelAppointment,
);
appointmentRouter.patch(
  "/:id",
  checkPermission([RoleEnum.ADMIN, RoleEnum.DOCTOR, RoleEnum.USER]),
  validate(updateAppointmentStatusSchema),
  updateAppointmentStatus,
);

export default appointmentRouter;
