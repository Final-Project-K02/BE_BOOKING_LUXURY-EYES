import Appointment from "./appointment.js";
import PatientProfile from "../patient-profile/patient-profile.model.js";
import Schedule from "../schedule/doctorSchedule.js";

const DOCTOR_FIELDS = "name fullName avatar experience_year";
const PATIENT_FIELDS = "fullName email phone";
const PATIENT_PROFILE_FIELDS =
  "fullName phone gender dateOfBirth identityCard email address";

// ─── Truy vấn lịch hẹn ───────────────────────────────────────────────────

export const findAppointments = (filter, sort = { createdAt: -1 }) =>
  Appointment.find(filter)
    .populate("doctor", DOCTOR_FIELDS)
    .populate("patient", PATIENT_FIELDS)
    .populate("patientProfile", PATIENT_PROFILE_FIELDS)
    .sort(sort);

export const findAppointmentsByDoctor = (doctorId) =>
  Appointment.find({ doctor: doctorId })
    .populate("patientProfile", PATIENT_PROFILE_FIELDS)
    .populate("patient", PATIENT_FIELDS)
    .populate("doctor", DOCTOR_FIELDS)
    .sort({ dateTime: 1 });

export const findAppointmentWithSchedule = (filter) =>
  Appointment.findOne(filter)
    .populate("doctor", DOCTOR_FIELDS)
    .populate("patient", PATIENT_FIELDS)
    .populate("patientProfile", PATIENT_PROFILE_FIELDS)
    .populate("scheduleId", "doctorId roomId roomName price timeSlots");

/** Trả về document thô, không populate. Dùng cho các luồng cập nhật/hủy lịch. */
export const findAppointmentById = (id) => Appointment.findById(id);

/** Tìm lịch hẹn thuộc về một bệnh nhân cụ thể. Dùng cho luồng bệnh nhân tự hủy lịch. */
export const findAppointmentByPatient = (id, patientId) =>
  Appointment.findOne({ _id: id, patient: patientId });

/** Trả về document đã populate đầy đủ. Dùng sau khi tạo lịch hẹn để trả về response. */
export const findPopulatedById = (id) =>
  Appointment.findById(id)
    .populate("patientProfile", "fullName phone")
    .populate("patient", "fullName email phone")
    .populate("doctor", "name avatar experience_year");

export const createAppointmentRecord = (data) => Appointment.create(data);

export const countCanceledByPatient = (userId, since) =>
  Appointment.countDocuments({
    patient: userId,
    status: "CANCELED",
    canceledBy: "patient",
    $or: [
      { canceledAt: { $gte: since } },
      {
        canceledAt: { $in: [null, undefined] },
        updatedAt: { $gte: since },
      },
    ],
  });

export const existsActiveAtTime = (patient, dateTime, time, activeStatuses) =>
  Appointment.exists({
    patient,
    dateTime,
    time,
    status: { $in: activeStatuses },
  });

export const findExpiredPendingAppointments = (extraFilter = {}) =>
  Appointment.find(
    {
      ...extraFilter,
      status: "PENDING",
      "payment.paymentStatus": { $in: ["UNPAID", "PENDING", "FAILED"] },
      "payment.expireAt": { $ne: null, $lte: new Date() },
    },
    { _id: 1, scheduleId: 1, time: 1 },
  ).lean();

export const bulkExpireAppointments = (ids) =>
  Appointment.updateMany(
    { _id: { $in: ids } },
    {
      $set: {
        status: "CANCELED",
        "payment.paymentStatus": "EXPIRED",
        canceledBy: "system",
        canceledAt: new Date(),
      },
    },
  );

// ─── Truy vấn hồ sơ bệnh nhân ───────────────────────────────────────────────

export const findPatientProfilesMatching = (searchRegex) =>
  PatientProfile.find(
    {
      $or: [
        { fullName: searchRegex },
        { phone: searchRegex },
        { identityCard: searchRegex },
        { email: searchRegex },
      ],
    },
    { _id: 1 },
  ).lean();

export const findLatestPatientProfile = (userId) =>
  PatientProfile.findOne({ userId }).sort({ createdAt: -1 });

export const findPatientProfileByIdAndUser = (profileId, userId) =>
  PatientProfile.findOne({ _id: profileId, userId });

// ─── Thao tác slot lịch làm việc ──────────────────────────────────────────────

/**
 * Đánh dấu atomic một slot AVAILABLE thành BOOKED.
 * Trả về schedule đã cập nhật nếu thành công, hoặc null nếu slot đã bị đặt.
 */
export const reserveScheduleSlot = (scheduleId, doctorId, time) =>
  Schedule.findOneAndUpdate(
    {
      _id: scheduleId,
      doctorId,
      timeSlots: { $elemMatch: { time, status: "AVAILABLE" } },
    },
    { $set: { "timeSlots.$.status": "BOOKED" } },
    { new: true },
  );

/** Giải phóng slot BOOKED về lại AVAILABLE. Bỏ qua nếu thiếu scheduleId hoặc time. */
export const releaseScheduleSlot = async (scheduleId, time) => {
  if (!scheduleId || !time) return;
  await Schedule.updateOne(
    {
      _id: scheduleId,
      timeSlots: { $elemMatch: { time, status: "BOOKED" } },
    },
    { $set: { "timeSlots.$.status": "AVAILABLE" } },
  );
};
