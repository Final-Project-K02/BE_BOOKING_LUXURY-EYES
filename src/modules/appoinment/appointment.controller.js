import Appointment from "./appointment.js";
import Schedule from "../schedule/doctorSchedule.js";
import createError from "../../shared/utils/createError.js";
import createResponse from "../../shared/utils/createResponse.js";
import handleAsync from "../../shared/utils/handleAsync.js";



export const getAppointmentsByDoctor = handleAsync(async (req, res) => {
const { doctorId, scheduleId, dateTime, time, room } = req.body;

if (!doctorId) {
  return createError(res, 400, "doctorId is required");
}


  const data = await Appointment.find({ doctor: doctorId })
    .populate("patient", "fullName phone")
.populate("doctor", "fullName avatar experience_year")
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
    .populate("doctor", "name avatar experience_year")
    .populate("patient", "fullName phone")
    .sort({ createdAt: -1 });

  createResponse(res, 200, "Success", data);
});


export const createAppointment = handleAsync(async (req, res) => {
  const userId = req.user?._id;

  if (!userId) {
    return createError(res, 401, "Unauthorized");
  }

  const {
    doctorId,
    scheduleId,
    dateTime,
    time,
    room,
  } = req.body;

  if (!doctorId) {
    return createError(res, 400, "doctorId is required");
  }

  if (!scheduleId || !time) {
    return createError(res, 400, "scheduleId and time are required");
  }

  // 1️⃣ Check schedule
  const schedule = await Schedule.findById(scheduleId);
  if (!schedule) {
    return createError(res, 404, "Schedule not found");
  }

  // 2️⃣ Check slot
  const slot = schedule.timeSlots.find(
    (s) => s.time === time && s.status === "AVAILABLE"
  );

  if (!slot) {
    return createError(res, 400, "Khung giờ đã được đặt");
  }

  // 3️⃣ Lock slot
  slot.status = "BOOKED";
  await schedule.save();

  // 4️⃣ Create appointment
  const appointment = await Appointment.create({
    patient: userId,
    doctor: doctorId,
    scheduleId,
    dateTime,
    time,
    room,
    status: "PENDING",
  });

  // 5️⃣ Populate
  const populated = await Appointment.findById(appointment._id)
    .populate("doctor", "name avatar experience_year")
    .populate("patient", "fullName phone");

  createResponse(res, 201, "Create appointment success", populated);
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
