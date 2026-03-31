import AppError from "../../shared/utils/AppError.js";
import Doctor from "../doctor/doctor.js";
import { sendAppointmentDepositPaidEmail } from "../mail/appointment.mail.js";
import { releaseScheduleSlot } from "../appointment/appointment.repository.js";
import {
  findAppointmentForPayment,
  findAppointmentByTxnRef,
  findAppointmentStatusByTxnRef,
  createAppointmentWithPayment,
} from "./payment.repository.js";
import {
  generateTxnRef,
  validateVnpayConfig,
  verifyVnpaySignature,
  buildVnpayPaymentUrl,
} from "./vnpay.service.js";

// ─── Hàm nội bộ: áp dụng kết quả thanh toán vào lịch hẹn ─────────────────

/**
 * Cập nhật trạng thái lịch hẹn dựa trên kết quả từ VNPay.
 * Dùng chung cho cả IPN và Return để tránh duplicate logic.
 *
 * - Thành công → CONFIRM + PAID
 * - Hết hạn   → CANCELED + EXPIRED + giải phóng slot
 * - Thất bại  → PENDING + UNPAID (cho phép thanh toán lại)
 *
 * Gửi email xác nhận cọc nếu đây là lần đầu chuyển sang PAID.
 */
const applyVnpayResult = async (
  appointment,
  { isSuccess, isExpired, vnpTransactionNo },
) => {
  const wasAlreadyPaid =
    appointment.payment?.paymentStatus === "PAID" ||
    appointment.status === "CONFIRM";

  if (isSuccess) {
    appointment.payment.paymentStatus = "PAID";
    appointment.payment.vnpTransactionNo = vnpTransactionNo || null;
    appointment.payment.paidAt = new Date();
    appointment.status = "CONFIRM";
  } else if (isExpired) {
    appointment.payment.paymentStatus = "EXPIRED";
    appointment.status = "CANCELED";
    appointment.canceledBy = "clinic";
    appointment.canceledAt = new Date();
    await releaseScheduleSlot(appointment.scheduleId, appointment.time);
  } else {
    // Cho phép thanh toán lại trong thời gian còn hạn
    appointment.payment.paymentStatus = "UNPAID";
    appointment.status = "PENDING";
  }

  await appointment.save();

  // Gửi email xác nhận cọc — chỉ khi lần đầu chuyển sang PAID
  if (isSuccess && !wasAlreadyPaid) {
    await appointment.populate([
      { path: "patient", select: "fullName email" },
      { path: "patientProfile", select: "fullName email phone" },
      { path: "doctor", select: "name" },
    ]);

    sendAppointmentDepositPaidEmail(appointment).catch((err) => {
      console.error("Gửi email xác nhận cọc thất bại:", err.message);
    });
  }
};

// ─── Tạo link thanh toán cho lịch hẹn đã tồn tại ─────────────────────────

export const generatePaymentLinkForAppointment = async (
  appointmentId,
  userId,
  ipAddr,
) => {
  const appointment = await findAppointmentForPayment(appointmentId, userId);
  if (!appointment) throw new AppError(404, "Không tìm thấy lịch hẹn");

  if (
    appointment.status === "CONFIRM" ||
    appointment.payment?.paymentStatus === "PAID"
  )
    throw new AppError(400, "Lịch này đã thanh toán");

  if (appointment.status === "CANCELED")
    throw new AppError(400, "Lịch này đã bị hủy");

  const now = new Date();
  const expireAt = appointment.payment?.expireAt;

  // Lịch hết hạn → tự động hủy và giải phóng slot
  if (!expireAt || new Date(expireAt) <= now) {
    appointment.status = "CANCELED";
    appointment.payment.paymentStatus = "EXPIRED";
    await appointment.save();
    await releaseScheduleSlot(appointment.scheduleId, appointment.time);
    throw new AppError(400, "Lịch đã hết hạn thanh toán");
  }

  const txnRef = generateTxnRef();
  const depositAmount = Number(appointment.payment?.depositAmount || 0);

  appointment.payment.txnRef = txnRef;
  appointment.payment.paymentStatus = "PENDING";
  await appointment.save();

  const paymentUrl = buildVnpayPaymentUrl({
    txnRef,
    depositAmount,
    appointmentId: appointment._id,
    expireAt,
    ipAddr,
  });

  console.log("==== VNPAY LINK FOR APPOINTMENT ====");
  console.log("SERVER NOW =", new Date().toString());
  console.log("TMN =", process.env.VNPAY_TMN_CODE);
  console.log("RETURN =", process.env.VNPAY_RETURN_URL);
  console.log("IPN =", process.env.VNPAY_IPN_URL);

  return { appointmentId: appointment._id, txnRef, paymentUrl, expireAt };
};

// ─── Tạo lịch hẹn mới kèm link thanh toán (legacy flow) ──────────────────

export const createPaymentWithNewAppointment = async (body, userId, ipAddr) => {
  const { doctorId, scheduleId, dateTime, time, room, totalAmount } = body;

  if (!doctorId || !scheduleId || !dateTime || !time)
    throw new AppError(400, "doctorId, scheduleId, dateTime, time là bắt buộc");

  if (!totalAmount || Number(totalAmount) <= 0)
    throw new AppError(400, "totalAmount is required");

  validateVnpayConfig();

  const doctor = await Doctor.findById(doctorId);
  if (!doctor) throw new AppError(404, "Không tìm thấy bác sĩ");
  if (!doctor.is_active)
    throw new AppError(400, "Bác sĩ hiện không nhận lịch khám");

  const total = Number(totalAmount);
  const depositAmount = Math.ceil(total * 0.4); // 40%, làm tròn lên
  const expireAt = new Date(Date.now() + 15 * 60 * 1000);
  const txnRef = generateTxnRef();

  const appointment = await createAppointmentWithPayment({
    doctor: doctorId,
    scheduleId,
    dateTime,
    time,
    room,
    patient: userId,
    status: "PENDING",
    payment: {
      totalAmount: total,
      depositRate: 40,
      depositAmount,
      paymentMethod: "VNPAY",
      paymentStatus: "PENDING",
      txnRef,
      expireAt,
    },
  });

  const paymentUrl = buildVnpayPaymentUrl({
    txnRef,
    depositAmount,
    appointmentId: appointment._id,
    expireAt,
    ipAddr,
  });

  return { appointmentId: appointment._id, depositAmount, paymentUrl, txnRef };
};

// ─── Xử lý IPN callback từ VNPay ──────────────────────────────────────────

/**
 * Xử lý IPN (Instant Payment Notification) từ VNPay.
 * Luôn trả về { rspCode, message } — không bao giờ ném lỗi
 * vì VNPay yêu cầu HTTP 200 trong mọi trường hợp.
 */
export const handleVnpayIpn = async (queryParams) => {
  try {
    console.log("==== VNPAY IPN CALLBACK ====");
    console.log("QUERY =", queryParams);

    const { isValid, inputData } = verifyVnpaySignature(queryParams);
    if (!isValid) return { rspCode: "97", message: "Invalid signature" };

    const {
      vnp_TxnRef: txnRef,
      vnp_Amount: rawAmount,
      vnp_ResponseCode: responseCode,
      vnp_TransactionStatus: transactionStatus,
      vnp_TransactionNo: vnpTransactionNo,
    } = inputData;

    const vnpAmount = Number(rawAmount) / 100;

    const appointment = await findAppointmentByTxnRef(txnRef);
    if (!appointment) return { rspCode: "01", message: "Order not found" };

    // Kiểm tra số tiền khớp với depositAmount đã lưu
    if (Number(appointment.payment?.depositAmount || 0) !== vnpAmount)
      return { rspCode: "04", message: "Invalid amount" };

    // Idempotent: đơn hàng đã được xử lý trước đó
    if (
      appointment.payment?.paymentStatus === "PAID" ||
      appointment.status === "CONFIRM"
    )
      return { rspCode: "02", message: "Order already confirmed" };

    const isExpired =
      !appointment.payment?.expireAt ||
      new Date(appointment.payment.expireAt) <= new Date();
    const isSuccess = responseCode === "00" && transactionStatus === "00";

    await applyVnpayResult(appointment, { isSuccess, isExpired, vnpTransactionNo });

    return { rspCode: "00", message: "Confirm Success" };
  } catch {
    return { rspCode: "99", message: "Unknown error" };
  }
};

// ─── Xử lý Return callback từ VNPay ──────────────────────────────────────

/**
 * Xử lý Return URL — người dùng được redirect về sau khi thanh toán.
 * Luôn trả về { redirectParams } — không bao giờ ném lỗi
 * vì controller sẽ redirect dù thành công hay thất bại.
 */
export const handleVnpayReturn = async (queryParams) => {
  try {
    console.log("==== VNPAY RETURN CALLBACK ====");
    console.log("QUERY =", queryParams);

    const { isValid, inputData } = verifyVnpaySignature(queryParams);
    if (!isValid) return { redirectParams: "success=false&code=97" };

    const {
      vnp_TxnRef: txnRef,
      vnp_ResponseCode: responseCode,
      vnp_TransactionStatus: transactionStatus,
      vnp_TransactionNo: vnpTransactionNo,
    } = inputData;

    const isSuccess = responseCode === "00" && transactionStatus === "00";

    const appointment = await findAppointmentByTxnRef(txnRef);

    if (!appointment) {
      return {
        redirectParams: `success=${isSuccess}&txnRef=${txnRef}&code=${responseCode}`,
      };
    }

    const isExpired =
      !appointment.payment?.expireAt ||
      new Date(appointment.payment.expireAt) <= new Date();

    await applyVnpayResult(appointment, { isSuccess, isExpired, vnpTransactionNo });

    const depositAmount = Number(appointment.payment?.depositAmount || 0);
    const paidAt = appointment.payment?.paidAt
      ? new Date(appointment.payment.paidAt).toISOString()
      : "";
    const appointmentStatus = appointment.status || "PENDING";

    return {
      redirectParams: `success=${isSuccess}&txnRef=${txnRef}&code=${responseCode}&depositAmount=${depositAmount}&paidAt=${encodeURIComponent(paidAt)}&status=${appointmentStatus}`,
    };
  } catch {
    return { redirectParams: "success=false&code=99" };
  }
};

// ─── Tra cứu trạng thái thanh toán ───────────────────────────────────────

export const fetchPaymentStatus = async (txnRef, userId) => {
  if (!txnRef) throw new AppError(400, "txnRef is required");

  const appointment = await findAppointmentStatusByTxnRef(txnRef, userId);
  if (!appointment) throw new AppError(404, "Không tìm thấy lịch hẹn");

  return {
    _id: appointment._id,
    status: appointment.status,
    paymentStatus: appointment.payment?.paymentStatus || "UNPAID",
    depositAmount: appointment.payment?.depositAmount || 0,
    totalAmount: appointment.payment?.totalAmount || 0,
    txnRef: appointment.payment?.txnRef || null,
    vnpTransactionNo: appointment.payment?.vnpTransactionNo || null,
    paidAt: appointment.payment?.paidAt || null,
    appointment,
  };
};
