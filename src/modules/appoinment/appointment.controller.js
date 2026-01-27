import Appointment from "./appointment.js";
import Schedule from "../schedule/doctorSchedule.js";
import createError from "../../shared/utils/createError.js";
import createResponse from "../../shared/utils/createResponse.js";
import handleAsync from "../../shared/utils/handleAsync.js";



export const getAppointmentsByDoctor = handleAsync(async (req, res) => {
  const { doctorId } = req.query;

  if (!doctorId) {
    return createError(res, 400, "doctorId is required");
  }

  const data = await Appointment.find({ doctor: doctorId })
    .populate("patient", "fullName email")
    .populate("doctor", "name")
    .sort({ dateTime: 1 });

  createResponse(res, 200, "Success", data);
});


export const getAppointments = handleAsync(async (req, res) => {
  const { userId, doctorId, scheduleId } = req.query;

  const filter = {};

  if (userId) filter.patient = userId;
  if (doctorId) filter.doctor = doctorId;
  if (scheduleId) filter.scheduleId = scheduleId;

  const data = await Appointment.find(filter)
    .populate("patient", "fullName email")
    .populate("doctor", "name")
    .sort({ createdAt: -1 });

  createResponse(res, 200, "Success", data);
});


export const createAppointment = handleAsync(async (req, res) => {
  const userId = req.user.id;
  const { doctorId, scheduleId, dateTime, time, room } = req.body;

  const schedule = await Schedule.findById(scheduleId);
  if (!schedule) {
    return createError(res, 404, "Schedule not found");
  }

  const slot = schedule.timeSlots.find(
    (s) => s.time === time && s.status === "AVAILABLE"
  );

  if (!slot) {
    return createError(res, 400, "Khung giờ đã được đặt");
  }

  // 🔒 Khoá slot
  slot.status = "BOOKED";
  await schedule.save();

  const appointment = await Appointment.create({
    patient: userId,
    doctor: doctorId,
    scheduleId,
    dateTime,
    time,
    room,
    status: "PENDING",
  });

  createResponse(res, 201, "Create appointment success", appointment);
});


export const updateAppointmentStatus = handleAsync(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const appointment = await Appointment.findById(id);
  if (!appointment) return createError(res, 404, "Appointment not found");

  const STATUS_FLOW = {
    PENDING: ["CONFIRM", "CANCELED"],
    CONFIRM: ["CHECKIN", "CANCELED"],
    CHECKIN: ["DONE"],
    DONE: [],
    CANCELED: [],
    "REQUEST-CANCELED": ["CANCELED"],
  };

  const allowed = STATUS_FLOW[appointment.status] || [];

  if (!allowed.includes(status)) {
    return createError(res, 400, "Invalid status transition");
  }

  appointment.status = status;
  await appointment.save();

  if (status === "CANCELED") {
    const schedule = await Schedule.findById(appointment.scheduleId);
    if (schedule) {
      const slot = schedule.timeSlots.find(
        (s) => s.time === appointment.time
      );
      if (slot) slot.status = "AVAILABLE";
      await schedule.save();
    }
  }

  createResponse(res, 200, "Update status success", appointment);
});
