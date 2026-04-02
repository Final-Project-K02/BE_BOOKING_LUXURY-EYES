import DoctorSchedule from "./doctorSchedule.js";
import Appointment from "../appointment/appointment.js";
import createResponse from "../../shared/utils/createResponse.js";
import createError from "../../shared/utils/createError.js";

export const getSchedules = async (req, res) => {
  const { doctorId } = req.query;

  const filter = {};
  if (doctorId) {
    filter.doctorId = doctorId;
  }

  const schedules = await DoctorSchedule.find(filter).sort({ createdAt: -1 });

  if (schedules.length === 0) {
    return createError(res, 404, "Không có lịch rảnh cho bác sĩ này");
  }

  createResponse(res, 200, "Lấy danh sách lịch thành công", schedules);
};

export const createSchedule = async (req, res) => {
  const schedule = await DoctorSchedule.create(req.body);
  createResponse(res, 201, "Tạo lịch rảnh thành công", schedule);
};

export const updateSchedule = async (req, res) => {
  const schedule = await DoctorSchedule.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true },
  );

  if (!schedule) {
    return createError(res, 404, "Không tìm thấy lịch");
  }

  createResponse(res, 200, "Cập nhật lịch thành công", schedule);
};

export const deleteSchedule = async (req, res) => {
  const schedule = await DoctorSchedule.findById(req.params.id);

  if (!schedule) {
    return createError(res, 404, "Không tìm thấy lịch");
  }

  const hasBookedSlot = (schedule.timeSlots || []).some(
    (slot) => slot.status === "BOOKED",
  );

  if (hasBookedSlot) {
    return createError(res, 400, "Không thể xóa lịch vì có slot đã được đặt");
  }

  const hasAppointment = await Appointment.exists({
    scheduleId: schedule._id,
    status: { $in: ["PENDING", "CONFIRM", "CHECKIN", "REQUEST-CANCELED"] },
  });

  if (hasAppointment) {
    return createError(res, 400, "Không thể xóa lịch vì có lịch hẹn đã đặt");
  }

  await schedule.deleteOne();
  return createResponse(res, 200, "Xóa lịch thành công");
};
