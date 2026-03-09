import createError from "../../shared/utils/createError.js";
import createResponse from "../../shared/utils/createResponse.js";
import handleAsync from "../../shared/utils/handleAsync.js";
import Doctor from "../doctor/doctor.js";
import Schedule from "../schedule/doctorSchedule.js";
import Appointment from "./appointment.js";
import PatientProfile from "../patient-profile/patient-profile.model.js";

const expirePendingAppointments = async (filter = {}) => {
  await Appointment.updateMany(
    {
      ...filter,
      status: "PENDING",
      "payment.paymentStatus": { $in: ["UNPAID", "PENDING", "FAILED"] },
      "payment.expireAt": { $ne: null, $lte: new Date() },
    },
    {
      $set: {
        status: "CANCELED",
        "payment.paymentStatus": "EXPIRED",
      },
    },
  );
};

export const getAppointmentsByDoctor = handleAsync(async (req, res) => {
  const { doctorId } = req.query;

  if (!doctorId) {
    return createError(res, 400, "doctorId is required");
  }

  await expirePendingAppointments({ doctor: doctorId });

  const data = await Appointment.find({ doctor: doctorId })
    .populate(
      "patientProfile",
      "fullName phone gender dateOfBirth identityCard email address",
    )
    .populate("doctor", "name fullName avatar experience_year")

    .sort({ dateTime: 1 });

  createResponse(res, 200, "Success", data);
});

export const getAppointments = handleAsync(async (req, res) => {
  const { userId, doctorId, scheduleId } = req.query;
  const filter = {};

  if (userId) filter.patient = userId;
  if (doctorId) filter.doctor = doctorId;
  if (scheduleId) filter.scheduleId = scheduleId;

  await expirePendingAppointments(filter);

  const data = await Appointment.find(filter)
    .populate("doctor", "name fullName avatar experience_year")
    .populate(
      "patientProfile",
      "fullName phone gender dateOfBirth identityCard email address",
    )

    .sort({ createdAt: -1 });

  createResponse(res, 200, "Success", data);
});

export const createAppointment = async (req, res) => {
  try {
    const {
      doctorId,
      scheduleId,
      dateTime,
      time,
      room,
      totalAmount,
      location,
      symptoms,
      patientProfileId,
      patientProfile,
    } = req.body;

    const hasProvidedProfile =
      patientProfileId !== undefined && patientProfileId !== null
        ? true
        : patientProfile !== undefined && patientProfile !== null;

    let selectedPatientProfileId = patientProfileId || patientProfile;
    if (selectedPatientProfileId && typeof selectedPatientProfileId === "object") {
      selectedPatientProfileId =
        selectedPatientProfileId._id ||
        selectedPatientProfileId.id ||
        selectedPatientProfileId.profileId ||
        null;
    }

    // If client explicitly sends patient profile data, do not silently fallback.
    if (hasProvidedProfile && !selectedPatientProfileId) {
      return createError(res, 400, "patientProfileId không hợp lệ");
    }

    if (!selectedPatientProfileId) {
      const latestProfile = await PatientProfile.findOne({
        userId: req.user._id,
      }).sort({ createdAt: -1 });
      if (!latestProfile) {
        return createError(
          res,
          400,
          "Vui lòng tạo hồ sơ bệnh nhân trước khi đặt lịch",
        );
      }
      selectedPatientProfileId = latestProfile._id;
    }

    const existingPatientProfile = await PatientProfile.findOne({
      _id: selectedPatientProfileId,
      userId: req.user._id,
    });

    if (!existingPatientProfile) {
      return createError(res, 404, "Không tìm thấy hồ sơ bệnh nhân");
    }

    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return res.status(404).json({ message: "Không tìm thấy bác sĩ" });
    }

    if (!doctor.is_active) {
      return res
        .status(400)
        .json({ message: "Bác sĩ hiện không nhận lịch khám" });
    }

    const total = Number(totalAmount || 0);
    const depositAmount = Math.ceil(total * 0.4);
    const expireAt = new Date(Date.now() + 5 * 60 * 1000);

    const appointment = await Appointment.create({
      doctor: doctorId,
      scheduleId,
      dateTime,
      time,
      room,
      location: location || "",
      symptoms: symptoms || "",
      patient: req.user._id,
      patientProfile: existingPatientProfile._id,

      status: "PENDING",
      payment: {
        totalAmount: total,
        depositRate: 40,
        depositAmount,
        paymentMethod: "VNPAY",
        paymentStatus: "UNPAID",
        expireAt,
      },
    });

    const populated = await Appointment.findById(appointment._id)
      .populate("patientProfile", "fullName phone")
      .populate("doctor", "name avatar experience_year");

    return res.status(201).json({
      message: "Đặt lịch thành công",
      data: populated,
      selectedPatientProfileId,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const updateAppointmentStatus = handleAsync(async (req, res) => {
  const { id } = req.params;
  const { status, reason } = req.body;

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

  if (reason) {
    appointment.reason = reason;
  }

  if (status === "CANCELED") {
    if (appointment.payment?.paymentStatus !== "PAID") {
      appointment.payment.paymentStatus =
        appointment.payment.paymentStatus === "EXPIRED" ? "EXPIRED" : "FAILED";
    }

    const schedule = await Schedule.findById(appointment.scheduleId);
    if (schedule) {
      const slot = schedule.timeSlots.find((s) => s.time === appointment.time);
      if (slot) slot.status = "AVAILABLE";
      await schedule.save();
    }
  }

  await appointment.save();

  createResponse(res, 200, "Update status success", appointment);
});
