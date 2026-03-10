import DoctorSchedule from "./doctorSchedule.js";
import Appointment from "../appointment/appointment.js";

export const getSchedules = async (req, res) => {
  const { doctorId } = req.query;

  const filter = {};
  if (doctorId) {
    filter.doctorId = doctorId;
  }

  const schedules = await DoctorSchedule.find(filter).sort({ createdAt: -1 });

  if (schedules.length === 0) {
    return res.status(404).json({
      message: "Không có lịch rảnh cho bác sĩ này",
    });
  }

  res.json({ data: schedules });
};

export const createSchedule = async (req, res) => {
  const schedule = await DoctorSchedule.create(req.body);
  res.status(201).json({
    message: "Tạo lịch rảnh thành công",
    data: schedule,
  });
};

export const updateSchedule = async (req, res) => {
  const schedule = await DoctorSchedule.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true },
  );

  if (!schedule) {
    return res.status(404).json({ message: "Không tìm thấy lịch" });
  }

  res.json({
    message: "Cập nhật lịch thành công",
    data: schedule,
  });
};

export const deleteSchedule = async (req, res) => {
  const schedule = await DoctorSchedule.findById(req.params.id);

  if (!schedule) {
    return res.status(404).json({ message: "Không tìm thấy lịch" });
  }

  const hasBookedSlot = (schedule.timeSlots || []).some(
    (slot) => slot.status === "BOOKED",
  );

  if (hasBookedSlot) {
    return res.status(400).json({
      message: "Không thể xóa lịch vì có slot đã được đặt",
    });
  }

  const hasAppointment = await Appointment.exists({
    scheduleId: schedule._id,
    status: { $in: ["PENDING", "CONFIRM", "CHECKIN", "REQUEST-CANCELED"] },
  });

  if (hasAppointment) {
    return res.status(400).json({
      message: "Không thể xóa lịch vì có lịch hẹn đã đặt",
    });
  }

  await schedule.deleteOne();
  return res.json({ message: "Xóa lịch thành công" });
};
