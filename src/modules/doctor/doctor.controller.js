import * as doctorService from "./doctor.service.js";
import createError from "../../shared/utils/createError.js";
import createResponse from "../../shared/utils/createResponse.js";
import handleAsync from "../../shared/utils/handleAsync.js";
import AppError from "../../shared/utils/AppError.js";

export const createDoctor = handleAsync(async (req, res) => {
  const doctor = await doctorService.createDoctor(req.body);
  return createResponse(res, 201, "Create doctor successfully", doctor);
});

export const getDoctors = handleAsync(async (req, res) => {
  const result = await doctorService.getDoctors(req.query);
  return createResponse(res, 200, "Successfully", result.data, result.meta);
});

export const getDoctorById = handleAsync(async (req, res) => {
  const doctor = await doctorService.getDoctorById(req.params.id);
  return createResponse(res, 200, "Successfully", doctor);
});

export const updateDoctor = handleAsync(async (req, res) => {
  const doctor = await doctorService.updateDoctor(req.params.id, req.body);
  return createResponse(res, 200, "Update doctor successfully", doctor);
});

export const deleteDoctor = handleAsync(async (req, res) => {
  await doctorService.deleteDoctor(req.params.id);
  return createResponse(res, 200, "Delete doctor successfully");
});

export const toggleDoctorStatus = handleAsync(async (req, res) => {
  const doctor = await doctorService.toggleDoctorStatus(req.params.id);
  const message = doctor.is_active
    ? "Bật bác sĩ thành công"
    : "Tắt bác sĩ thành công";
  return createResponse(res, 200, message, doctor);
});

export const getDoctorsByAdmin = handleAsync(async (req, res) => {
  const doctors = await doctorService.getDoctorsByAdmin(req.query);
  return createResponse(res, 200, "Successfully", doctors);
});

export const updateDoctorAvatar = handleAsync(async (req, res) => {
  const { avatar } = req.body;

  if (!avatar || typeof avatar !== "string") {
    throw new AppError(400, "avatar is required");
  }

  const doctor = await doctorService.updateDoctorAvatar(req.params.id, avatar);
  return createResponse(res, 200, "Cập nhật avatar thành công", doctor);
});
