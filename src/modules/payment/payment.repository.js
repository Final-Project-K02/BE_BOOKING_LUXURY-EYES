import Appointment from "../appointment/appointment.js";

// ─── Truy vấn lịch hẹn theo mục đích thanh toán ───────────────────────────

/**
 * Tìm lịch hẹn theo id và patient — dùng cho luồng tạo link thanh toán.
 * Trả về document thô, không populate.
 */
export const findAppointmentForPayment = (appointmentId, patientId) =>
  Appointment.findOne({ _id: appointmentId, patient: patientId });

/**
 * Tìm lịch hẹn theo mã giao dịch txnRef — dùng cho IPN và Return callback.
 * Trả về document thô, không populate.
 */
export const findAppointmentByTxnRef = (txnRef) =>
  Appointment.findOne({ "payment.txnRef": txnRef });

/**
 * Tìm lịch hẹn theo txnRef và patient, có populate.
 * Dùng cho endpoint tra cứu trạng thái thanh toán.
 */
export const findAppointmentStatusByTxnRef = (txnRef, patientId) =>
  Appointment.findOne({ "payment.txnRef": txnRef, patient: patientId })
    .populate("doctor", "name fullName avatar")
    .populate("patient", "fullName phone");

/**
 * Tạo mới lịch hẹn kèm thông tin thanh toán (legacy flow).
 */
export const createAppointmentWithPayment = (data) => Appointment.create(data);
