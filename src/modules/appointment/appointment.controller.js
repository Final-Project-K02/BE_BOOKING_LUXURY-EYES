import Appointment from "./appointment.js";
import Schedule from "../schedule/doctorSchedule.js";
import createError from "../../shared/utils/createError.js";
import createResponse from "../../shared/utils/createResponse.js";
import handleAsync from "../../shared/utils/handleAsync.js";
import Doctor from "../doctor/doctor.js";
import PatientProfile from "../patient-profile/patient-profile.model.js";
import dayjs from "dayjs";

export const getAppointmentsByDoctor = handleAsync(async (req, res) => {
  const { doctorId, scheduleId, dateTime, time, room } = req.body;

  if (!doctorId) {
    return createError(res, 400, "doctorId is required");
  }

  const data = await Appointment.find({ doctor: doctorId })
    .populate("patientProfile", "fullName phone")
    .populate("doctor", "name avatar experience_year")
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
    .populate("patientProfile", "fullName phone")
    .sort({ createdAt: -1 });

  createResponse(res, 200, "Success", data);
});

export const createAppointment = async (req, res) => {
  try {
    const { doctorId, scheduleId, dateTime, time, room } = req.body;

    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return res.status(404).json({ message: "Không tìm thấy bác sĩ" });
    }

    if (!doctor.is_active) {
      return res
        .status(400)
        .json({ message: "Bác sĩ hiện không nhận lịch khám" });
    }

    const patientId = req.user._id;
    let patientProfileId = req.body.patientProfile || req.body.patientProfileId;

    // if no profile id provided, fallback to the most recent profile of the user
    if (!patientProfileId) {
      const recent = await PatientProfile.findOne({ userId: patientId }).sort({
        createdAt: -1,
      });
      if (!recent) {
        return res.status(400).json({
          message:
            "Bạn chưa có hồ sơ bệnh nhân, vui lòng tạo hồ sơ trước khi đặt lịch",
        });
      }
      patientProfileId = recent._id;
    }

    const profile = await PatientProfile.findById(patientProfileId);
    if (!profile)
      return res
        .status(404)
        .json({ message: "Không tìm thấy hồ sơ bệnh nhân" });
    if (profile.userId.toString() !== patientId.toString()) {
      return res
        .status(403)
        .json({ message: "Hồ sơ bệnh nhân không thuộc người dùng" });
    }

    // Prevent the same patientProfile booking the same date + time (any doctor)
    const dayStart = dayjs(dateTime).startOf("day").toDate();
    const dayEnd = dayjs(dateTime).endOf("day").toDate();

    const existing = await Appointment.findOne({
      patientProfile: patientProfileId,
      dateTime: { $gte: dayStart, $lte: dayEnd },
      time,
      status: { $nin: ["CANCELED", "DONE"] },
    });

    if (existing) {
      return res
        .status(400)
        .json({ message: "Bạn đã có lịch khám cùng thời gian" });
    }

    // Check schedule and slot availability
    const schedule = await Schedule.findById(scheduleId);
    if (!schedule) {
      return res.status(404).json({ message: "Không tìm thấy lịch" });
    }

    const slot = schedule.timeSlots.find(
      (s) => dayjs(s.date).isSame(dayjs(dateTime), "day") && s.time === time,
    );

    if (!slot) {
      return res.status(400).json({ message: "Khung giờ không tồn tại" });
    }

    if (slot.status !== "AVAILABLE" || slot.capacity <= 0) {
      return res.status(400).json({ message: "Khung giờ đã được đặt" });
    }

    // reserve slot: decrement capacity or mark as BOOKED
    if (slot.capacity && slot.capacity > 1) {
      slot.capacity = slot.capacity - 1;
    } else {
      slot.capacity = 0;
      slot.status = "BOOKED";
    }

    await schedule.save();

    const appointment = await Appointment.create({
      doctor: doctorId,
      scheduleId,
      dateTime,
      time,
      room,
      patient: patientId,
      patientProfile: patientProfileId,
      payment: { totalAmount: doctor.price },
      status: "PENDING",
    });

    const populated = await Appointment.findById(appointment._id)
      .populate("patientProfile", "fullName phone")
      .populate("doctor", "name avatar experience_year");

    return res.status(201).json({
      message: "Đặt lịch thành công",
      data: populated,
      selectedPatientProfileId: patientProfileId,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

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
      const slot = schedule.timeSlots.find((s) => s.time === appointment.time);
      if (slot) slot.status = "AVAILABLE";
      await schedule.save();
    }
  }

  const populated = await Appointment.findById(appointment._id)
    .populate("patientProfile", "fullName phone")
    .populate("doctor", "name avatar experience_year");

  createResponse(res, 200, "Update status success", populated);
});
