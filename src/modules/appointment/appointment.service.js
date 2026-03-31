import AppError from "../../shared/utils/AppError.js";
import { RoleEnum } from "../../shared/constant/enum.js";
import Doctor from "../doctor/doctor.js";
import {
  sendAdminCanceledPaidAppointmentNoRefundEmail,
  sendAdminCanceledPaidAppointmentWithRefundEmail,
  sendAppointmentPaidCanceledEmail,
} from "../mail/appointment.mail.js";
import {
  findAppointments,
  findAppointmentsByDoctor,
  findAppointmentWithSchedule,
  findAppointmentById,
  findAppointmentByPatient,
  findPopulatedById,
  createAppointmentRecord,
  countCanceledByPatient,
  existsActiveAtTime,
  findPatientProfilesMatching,
  findLatestPatientProfile,
  findPatientProfileById,
  reserveScheduleSlot,
  releaseScheduleSlot,
} from "./appointment.repository.js";
import { expirePendingAppointments } from "./appointment.job.js";
import {
  ACTIVE_APPOINTMENT_STATUSES,
  FILTERABLE_APPOINTMENT_STATUSES,
  STATUS_FLOW,
  REFUND_FLOW,
  REFUND_MESSAGES,
  CANCEL_PAYMENT_MESSAGES,
  MONTHLY_CANCEL_LIMIT,
} from "./constant/appointment.constants.js";
import {
  toArrayQueryValue,
  escapeRegex,
  startOfCurrentMonth,
  isValidObjectId,
} from "./appointment.utils.js";

// ─── Các hàm service ─────────────────────────────────────────────────────

export const listAppointmentsByDoctor = async (doctorId) => {
  if (!doctorId) throw new AppError(400, "doctorId is required");
  await expirePendingAppointments({ doctor: doctorId });
  return findAppointmentsByDoctor(doctorId);
};

export const listAppointments = async (query, user) => {
  const {
    userId,
    doctorId,
    scheduleId,
    status,
    paymentStatus,
    patientKeyword,
    keyword,
    dateFrom,
    dateTo,
    fromDate,
    toDate,
    startDate,
    endDate,
  } = query;

  const filter = {};

  if (user?.role === RoleEnum.USER) {
    filter.patient = user._id;
  } else if (userId) {
    filter.patient = userId;
  }

  if (doctorId) filter.doctor = doctorId;
  if (scheduleId) filter.scheduleId = scheduleId;

  const appointmentStatuses = toArrayQueryValue(status);
  if (appointmentStatuses.length > 0) {
    const hasInvalid = appointmentStatuses.some(
      (s) => !FILTERABLE_APPOINTMENT_STATUSES.includes(s),
    );
    if (hasInvalid)
      throw new AppError(400, "status không hợp lệ cho bộ lọc danh sách lịch");

    filter.status =
      appointmentStatuses.length === 1
        ? appointmentStatuses[0]
        : { $in: appointmentStatuses };
  }

  const paymentStatuses = toArrayQueryValue(paymentStatus);
  if (paymentStatuses.length > 0) {
    filter["payment.paymentStatus"] =
      paymentStatuses.length === 1
        ? paymentStatuses[0]
        : { $in: paymentStatuses };
  }

  const fromValue = dateFrom || fromDate || startDate;
  const toValue = dateTo || toDate || endDate;

  if (fromValue || toValue) {
    const dateFilter = {};

    if (fromValue) {
      const from = new Date(fromValue);
      if (Number.isNaN(from.getTime()))
        throw new AppError(400, "dateFrom không hợp lệ");
      from.setHours(0, 0, 0, 0);
      dateFilter.$gte = from;
    }

    if (toValue) {
      const to = new Date(toValue);
      if (Number.isNaN(to.getTime()))
        throw new AppError(400, "dateTo không hợp lệ");
      to.setHours(23, 59, 59, 999);
      dateFilter.$lte = to;
    }

    filter.dateTime = dateFilter;
  }

  const normalizedKeyword = (patientKeyword || keyword || "").trim();
  if (normalizedKeyword) {
    const regex = new RegExp(escapeRegex(normalizedKeyword), "i");
    const matchingProfiles = await findPatientProfilesMatching(regex);
    filter.patientProfile = { $in: matchingProfiles.map((p) => p._id) };
  }

  await expirePendingAppointments(filter);
  return findAppointments(filter);
};

export const fetchAppointmentDetail = async (id, user) => {
  if (!isValidObjectId(id)) throw new AppError(400, "id không hợp lệ");

  const filter = { _id: id };
  if (user?.role === RoleEnum.USER) {
    filter.patient = user._id;
  }

  await expirePendingAppointments(filter);

  const appointment = await findAppointmentWithSchedule(filter);
  if (!appointment) throw new AppError(404, "Không tìm thấy lịch hẹn");

  const appointmentData = appointment.toObject();
  const schedule = appointmentData?.scheduleId;

  if (schedule?.timeSlots?.length) {
    const appointmentDateKey = new Date(appointmentData.dateTime)
      .toISOString()
      .slice(0, 10);

    const selectedTimeSlot = schedule.timeSlots.find((slot) => {
      const slotDateKey = new Date(slot.date).toISOString().slice(0, 10);
      return (
        slot.time === appointmentData.time && slotDateKey === appointmentDateKey
      );
    });

    schedule.selectedTimeSlot = selectedTimeSlot || null;
    delete schedule.timeSlots;
  }

  return appointmentData;
};

export const bookAppointment = async (body, user) => {
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
  } = body;

  const normalizedDateTime = new Date(dateTime);
  if (!dateTime || Number.isNaN(normalizedDateTime.getTime()))
    throw new AppError(400, "dateTime không hợp lệ");

  // Xác định hồ sơ bệnh nhân sẽ dùng cho lịch hẹn
  const hasProvidedProfile =
    patientProfileId !== undefined && patientProfileId !== null
      ? true
      : patientProfile !== undefined && patientProfile !== null;

  let selectedPatientProfileId = patientProfileId || patientProfile;
  if (
    selectedPatientProfileId &&
    typeof selectedPatientProfileId === "object"
  ) {
    selectedPatientProfileId =
      selectedPatientProfileId._id ||
      selectedPatientProfileId.id ||
      selectedPatientProfileId.profileId ||
      null;
  }

  if (hasProvidedProfile && !selectedPatientProfileId)
    throw new AppError(400, "patientProfileId không hợp lệ");

  if (!selectedPatientProfileId) {
    const latestProfile = await findLatestPatientProfile(user._id);
    if (!latestProfile)
      throw new AppError(
        400,
        "Vui lòng tạo hồ sơ bệnh nhân trước khi đặt lịch",
      );
    selectedPatientProfileId = latestProfile._id;
  }

  const existingProfile = await findPatientProfileById(
    selectedPatientProfileId,
  );
  if (!existingProfile)
    throw new AppError(404, "Không tìm thấy hồ sơ bệnh nhân");

  const doctor = await Doctor.findById(doctorId);
  if (!doctor) throw new AppError(404, "Không tìm thấy bác sĩ");
  if (!doctor.is_active)
    throw new AppError(400, "Bác sĩ hiện không nhận lịch khám");

  const canceledCount = await countCanceledByPatient(
    user._id,
    startOfCurrentMonth(),
  );
  console.log(
    `[CREATE APPOINTMENT] User ${user._id} - Canceled count: ${canceledCount}`,
  );

  if (canceledCount >= MONTHLY_CANCEL_LIMIT)
    throw new AppError(
      403,
      "Bạn đã hủy 4 lịch trong tháng này. Không thể đặt lịch mới.",
    );

  const hasSameTime = await existsActiveAtTime(
    user._id,
    normalizedDateTime,
    time,
    ACTIVE_APPOINTMENT_STATUSES,
  );
  if (hasSameTime)
    throw new AppError(400, "Bạn đã có lịch hẹn khác cùng thời điểm này");

  const reservedSchedule = await reserveScheduleSlot(
    scheduleId,
    doctorId,
    time,
  );
  if (!reservedSchedule)
    throw new AppError(409, "Khung giờ này đã có người đặt");

  const total = Number(totalAmount || 0);
  const depositAmount = Math.ceil(total * 0.4);
  const expireAt = new Date(Date.now() + 5 * 60 * 1000);

  let appointment;
  try {
    appointment = await createAppointmentRecord({
      doctor: doctorId,
      scheduleId,
      dateTime: normalizedDateTime,
      time,
      room,
      location: location || "",
      symptoms: symptoms || "",
      patient: user._id,
      patientProfile: existingProfile._id,
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
  } catch (err) {
    await releaseScheduleSlot(scheduleId, time);
    if (err?.code === 11000)
      throw new AppError(
        409,
        "Khung giờ này đã có người đặt hoặc bạn đã đặt lịch trùng giờ",
      );
    throw err;
  }

  const populated = await findPopulatedById(appointment._id);
  return { appointment: populated, selectedPatientProfileId };
};

export const cancelAppointmentByUser = async (id, reason, user) => {
  const appointment = await findAppointmentByPatient(id, user._id);
  if (!appointment) throw new AppError(404, "Không tìm thấy lịch hẹn");

  if (!["PENDING", "CONFIRM"].includes(appointment.status))
    throw new AppError(
      400,
      "Chỉ có thể hủy lịch ở trạng thái PENDING hoặc CONFIRM",
    );

  const canceledCount = await countCanceledByPatient(
    user._id,
    startOfCurrentMonth(),
  );
  console.log(
    `[CANCEL REQUEST] User ${user._id} - Current canceled count: ${canceledCount}`,
  );

  if (canceledCount >= MONTHLY_CANCEL_LIMIT)
    throw new AppError(
      400,
      "Bạn đã hủy 4 lịch trong tháng này. Không thể hủy thêm.",
    );

  const wasPaid = appointment.payment?.paymentStatus === "PAID";

  appointment.status = "CANCELED";
  appointment.canceledBy = "patient";
  appointment.canceledAt = new Date();
  appointment.reason = reason || "Người dùng hủy";

  // Lịch đã thanh toán mà bệnh nhân tự hủy → giữ nguyên PAID (mất cọc)
  if (!wasPaid) {
    appointment.payment.paymentStatus =
      appointment.payment.paymentStatus === "EXPIRED" ? "EXPIRED" : "FAILED";
  }

  await releaseScheduleSlot(appointment.scheduleId, appointment.time);
  await appointment.save();

  if (wasPaid) {
    await appointment.populate([
      { path: "patient", select: "fullName email" },
      { path: "patientProfile", select: "fullName email phone" },
      { path: "doctor", select: "name" },
    ]);
    sendAppointmentPaidCanceledEmail(appointment).catch((err) => {
      console.error("Send paid cancellation email failed:", err.message);
    });
  }

  const newCount = canceledCount + 1;
  const message = wasPaid
    ? "Hủy lịch thành công. Tiền cọc sẽ KHÔNG được hoàn lại."
    : "Hủy lịch thành công.";

  return {
    message,
    data: {
      appointment,
      canceledCountThisMonth: newCount,
      remainingCancels: Math.max(0, MONTHLY_CANCEL_LIMIT - newCount),
    },
  };
};

export const changeAppointmentStatus = async (id, body, user) => {
  const { status, reason, paymentStatus, withRefund } = body;

  // Bệnh nhân chỉ được phép hủy — chuyển sang luồng hủy riêng
  if (user?.role === RoleEnum.USER) {
    if (status !== "CANCELED")
      throw new AppError(403, "Bạn chỉ có thể hủy lịch");
    if (paymentStatus)
      throw new AppError(
        403,
        "Bạn không có quyền cập nhật trạng thái hoàn tiền",
      );
    return cancelAppointmentByUser(id, reason, user);
  }

  const appointment = await findAppointmentById(id);
  if (!appointment) throw new AppError(404, "Appointment not found");

  if (paymentStatus && status && status !== "CANCELED")
    throw new AppError(400, "Chỉ được gửi paymentStatus cùng status=CANCELED");

  const isCancelingNow =
    status === "CANCELED" && appointment.status !== "CANCELED";

  // ── Cập nhật chỉ trạng thái thanh toán (không đổi trạng thái lịch) ─────────
  if (paymentStatus && !isCancelingNow) {
    if (appointment.status !== "CANCELED")
      throw new AppError(
        400,
        "Chỉ có thể cập nhật trạng thái hoàn tiền khi lịch đã hủy",
      );

    const currentPaymentStatus = appointment.payment?.paymentStatus || "UNPAID";

    // Idempotent: gửi lại cùng paymentStatus → bỏ qua, không báo lỗi
    if (currentPaymentStatus === paymentStatus)
      return {
        message: "Trạng thái hoàn tiền đã được cập nhật trước đó",
        data: appointment,
      };

    const allowed = REFUND_FLOW[currentPaymentStatus] || [];
    if (!allowed.includes(paymentStatus))
      throw new AppError(400, "Invalid payment status transition");

    appointment.payment.paymentStatus = paymentStatus;
    if (reason) appointment.reason = reason;
    await appointment.save();

    return {
      message:
        REFUND_MESSAGES[paymentStatus] ??
        "Cập nhật trạng thái thanh toán thành công",
      data: appointment,
    };
  }

  // ── Cập nhật trạng thái lịch hẹn ──────────────────────────────────────────
  if (!status) throw new AppError(400, "status is required");

  // Idempotent: gửi lại cùng status → bỏ qua, không báo lỗi
  if (appointment.status === status)
    return {
      message: "Trạng thái lịch đã được cập nhật trước đó",
      data: appointment,
    };

  const allowedTransitions = STATUS_FLOW[appointment.status] || [];
  if (!allowedTransitions.includes(status))
    throw new AppError(400, "Invalid status transition");

  const previousStatus = appointment.status;
  const wasPaidBeforeCancel = appointment.payment?.paymentStatus === "PAID";

  appointment.status = status;
  if (reason) appointment.reason = reason;

  if (status === "CANCELED") {
    appointment.canceledBy = "clinic";
    appointment.canceledAt = new Date();

    if (appointment.payment?.paymentStatus === "PAID") {
      if (paymentStatus) {
        if (!["REFUND_PENDING", "NO_REFUND"].includes(paymentStatus))
          throw new AppError(
            400,
            "Khi hủy lịch đã thanh toán, paymentStatus chỉ được là REFUND_PENDING hoặc NO_REFUND",
          );
        appointment.payment.paymentStatus = paymentStatus;
      } else {
        appointment.payment.paymentStatus =
          withRefund === false ? "NO_REFUND" : "REFUND_PENDING";
      }
    } else {
      if (paymentStatus)
        throw new AppError(
          400,
          "Lịch chưa thanh toán thì không thể đặt paymentStatus này khi hủy",
        );
      appointment.payment.paymentStatus =
        appointment.payment.paymentStatus === "EXPIRED" ? "EXPIRED" : "FAILED";
    }

    await releaseScheduleSlot(appointment.scheduleId, appointment.time);
  }

  await appointment.save();

  // Gửi email thông báo cho bệnh nhân khi phòng khám hủy lịch đã thanh toán
  if (
    status === "CANCELED" &&
    wasPaidBeforeCancel &&
    ["CONFIRM", "CHECKIN"].includes(previousStatus)
  ) {
    await appointment.populate([
      { path: "patient", select: "fullName email" },
      { path: "patientProfile", select: "fullName" },
      { path: "doctor", select: "name" },
    ]);

    const sendFn =
      appointment.payment?.paymentStatus === "NO_REFUND"
        ? sendAdminCanceledPaidAppointmentNoRefundEmail
        : sendAdminCanceledPaidAppointmentWithRefundEmail;

    sendFn(appointment).catch((err) => {
      console.error("Send admin cancel paid email failed:", err.message);
    });
  }

  const message =
    status === "CANCELED"
      ? (CANCEL_PAYMENT_MESSAGES[appointment.payment?.paymentStatus] ??
        "Hủy lịch thành công.")
      : "Update status success";

  return { message, data: appointment };
};
