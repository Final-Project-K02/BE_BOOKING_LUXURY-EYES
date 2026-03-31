import handleAsync from "../../shared/utils/handleAsync.js";
import createResponse from "../../shared/utils/createResponse.js";
import {
  listAppointmentsByDoctor,
  listAppointments,
  fetchAppointmentDetail,
  bookAppointment,
  cancelAppointmentByUser,
  changeAppointmentStatus,
} from "./appointment.service.js";

export const getAppointmentsByDoctor = handleAsync(async (req, res) => {
  const data = await listAppointmentsByDoctor(req.query.doctorId);
  createResponse(res, 200, "Success", data);
});

export const getAppointments = handleAsync(async (req, res) => {
  const data = await listAppointments(req.query, req.user);
  createResponse(res, 200, "Success", data);
});

export const getAppointmentDetail = handleAsync(async (req, res) => {
  const data = await fetchAppointmentDetail(req.params.id, req.user);
  createResponse(res, 200, "Success", data);
});

export const createAppointment = handleAsync(async (req, res) => {
  const { appointment, selectedPatientProfileId } = await bookAppointment(
    req.body,
    req.user,
  );
  res.status(201).json({
    message: "Đặt lịch thành công",
    data: appointment,
    selectedPatientProfileId,
  });
});

export const requestCancelAppointment = handleAsync(async (req, res) => {
  const { message, data } = await cancelAppointmentByUser(
    req.params.id,
    req.body.reason,
    req.user,
  );
  createResponse(res, 200, message, data);
});

export const updateAppointmentStatus = handleAsync(async (req, res) => {
  const { message, data } = await changeAppointmentStatus(
    req.params.id,
    req.body,
    req.user,
  );
  createResponse(res, 200, message, data);
});
