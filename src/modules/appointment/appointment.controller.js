import createError from "../../shared/utils/createError.js";
import createResponse from "../../shared/utils/createResponse.js";
import handleAsync from "../../shared/utils/handleAsync.js";
import Doctor from "../doctor/doctor.js";
import Schedule from "../schedule/doctorSchedule.js";
import Appointment from "./appointment.js";
import PatientProfile from "../patient-profile/patient-profile.model.js";
import { RoleEnum } from "../../shared/constant/enum.js";
import {
  sendAdminCanceledPaidAppointmentNoRefundEmail,
  sendAdminCanceledPaidAppointmentWithRefundEmail,
  sendAppointmentPaidCanceledEmail,
} from "../mail/appointment.mail.js";

const ACTIVE_APPOINTMENT_STATUSES = [
  "PENDING",
  "CONFIRM",
  "CHECKIN",
  "REQUEST-CANCELED",
];

const FILTERABLE_APPOINTMENT_STATUSES = [
  "PENDING",
  "CONFIRM",
  "CHECKIN",
  "DONE",
  "CANCELED",
];

const toArrayQueryValue = (value) => {
  if (!value) return [];
  if (Array.isArray(value)) {
    return value
      .flatMap((item) => String(item).split(","))
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return String(value)
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
};

const escapeRegex = (value = "") =>
  String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const releaseScheduleSlot = async (scheduleId, time) => {
  if (!scheduleId || !time) return;

  await Schedule.updateOne(
    {
      _id: scheduleId,
      timeSlots: { $elemMatch: { time, status: "BOOKED" } },
    },
    {
      $set: { "timeSlots.$.status": "AVAILABLE" },
    },
  );
};

const expirePendingAppointments = async (filter = {}) => {
  const expiredAppointments = await Appointment.find(
    {
      ...filter,
      status: "PENDING",
      "payment.paymentStatus": { $in: ["UNPAID", "PENDING", "FAILED"] },
      "payment.expireAt": { $ne: null, $lte: new Date() },
    },
    { _id: 1, scheduleId: 1, time: 1 },
  ).lean();

  if (expiredAppointments.length === 0) return;

  const now = new Date();

  await Appointment.updateMany(
    { _id: { $in: expiredAppointments.map((item) => item._id) } },
    {
      $set: {
        status: "CANCELED",
        "payment.paymentStatus": "EXPIRED",
        canceledBy: "system",
        canceledAt: now,
      },
    },
  );

  await Promise.all(
    expiredAppointments.map((item) =>
      releaseScheduleSlot(item.scheduleId, item.time),
    ),
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
    .populate("patient", "fullName email phone")
    .populate("doctor", "name fullName avatar experience_year")

    .sort({ dateTime: 1 });

  createResponse(res, 200, "Success", data);
});

export const getAppointments = handleAsync(async (req, res) => {
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
  } = req.query;
  const filter = {};

  if (req.user?.role === RoleEnum.USER) {
    filter.patient = req.user._id;
  } else if (userId) {
    filter.patient = userId;
  }

  if (doctorId) filter.doctor = doctorId;
  if (scheduleId) filter.scheduleId = scheduleId;

  const appointmentStatuses = toArrayQueryValue(status);
  if (appointmentStatuses.length > 0) {
    const hasInvalidStatus = appointmentStatuses.some(
      (item) => !FILTERABLE_APPOINTMENT_STATUSES.includes(item),
    );

    if (hasInvalidStatus) {
      return createError(
        res,
        400,
        "status không hợp lệ cho bộ lọc danh sách lịch",
      );
    }

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
      if (Number.isNaN(from.getTime())) {
        return createError(res, 400, "dateFrom không hợp lệ");
      }

      from.setHours(0, 0, 0, 0);
      dateFilter.$gte = from;
    }

    if (toValue) {
      const to = new Date(toValue);
      if (Number.isNaN(to.getTime())) {
        return createError(res, 400, "dateTo không hợp lệ");
      }

      to.setHours(23, 59, 59, 999);
      dateFilter.$lte = to;
    }

    filter.dateTime = dateFilter;
  }

  const normalizedPatientKeyword = (patientKeyword || keyword || "").trim();
  if (normalizedPatientKeyword) {
    const patientRegex = new RegExp(escapeRegex(normalizedPatientKeyword), "i");

    const matchingProfiles = await PatientProfile.find(
      {
        $or: [
          { fullName: patientRegex },
          { phone: patientRegex },
          { identityCard: patientRegex },
          { email: patientRegex },
        ],
      },
      { _id: 1 },
    ).lean();

    filter.patientProfile = { $in: matchingProfiles.map((item) => item._id) };
  }

  await expirePendingAppointments(filter);

  const data = await Appointment.find(filter)
    .populate("doctor", "name fullName avatar experience_year")
    .populate("patient", "fullName email phone")
    .populate(
      "patientProfile",
      "fullName phone gender dateOfBirth identityCard email address",
    )

    .sort({ createdAt: -1 });

  createResponse(res, 200, "Success", data);
});

export const getAppointmentDetail = handleAsync(async (req, res) => {
  const { id } = req.params;

  if (!/^[a-fA-F0-9]{24}$/.test(String(id))) {
    return createError(res, 400, "id không hợp lệ");
  }

  const filter = { _id: id };

  // User chỉ xem được lịch của chính mình.
  if (req.user?.role === RoleEnum.USER) {
    filter.patient = req.user._id;
  }

  await expirePendingAppointments(filter);

  const appointment = await Appointment.findOne(filter)
    .populate("doctor", "name fullName avatar experience_year")
    .populate("patient", "fullName email phone")
    .populate(
      "patientProfile",
      "fullName phone gender dateOfBirth identityCard email address",
    )
    .populate("scheduleId", "doctorId roomId roomName price timeSlots");

  if (!appointment) {
    return createError(res, 404, "Không tìm thấy lịch hẹn");
  }

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

  createResponse(res, 200, "Success", appointmentData);
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

    const normalizedDateTime = new Date(dateTime);

    if (!dateTime || Number.isNaN(normalizedDateTime.getTime())) {
      return createError(res, 400, "dateTime không hợp lệ");
    }

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

    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const canceledCountThisMonth = await Appointment.countDocuments({
      patient: req.user._id,
      status: "CANCELED",
      canceledBy: "patient",
      $or: [
        { canceledAt: { $gte: startOfMonth } },
        {
          canceledAt: { $in: [null, undefined] },
          updatedAt: { $gte: startOfMonth },
        },
      ],
    });

    console.log(
      `[CREATE APPOINTMENT] User ${req.user._id} - Canceled count: ${canceledCountThisMonth}`,
    );

    if (canceledCountThisMonth >= 4) {
      return createError(
        res,
        403,
        "Bạn đã hủy 4 lịch trong tháng này. Không thể đặt lịch mới.",
      );
    }

    const hasSameTimeAppointment = await Appointment.exists({
      patient: req.user._id,
      dateTime: normalizedDateTime,
      time: time,
      status: { $in: ACTIVE_APPOINTMENT_STATUSES },
    });

    if (hasSameTimeAppointment) {
      return createError(
        res,
        400,
        "Bạn đã có lịch hẹn khác cùng thời điểm này",
      );
    }

    const reservedSchedule = await Schedule.findOneAndUpdate(
      {
        _id: scheduleId,
        doctorId,
        timeSlots: { $elemMatch: { time, status: "AVAILABLE" } },
      },
      {
        $set: { "timeSlots.$.status": "BOOKED" },
      },
      { new: true },
    );

    if (!reservedSchedule) {
      return createError(res, 409, "Khung giờ này đã có người đặt");
    }

    const total = Number(totalAmount || 0);
    const depositAmount = Math.ceil(total * 0.4);
    const expireAt = new Date(Date.now() + 5 * 60 * 1000);

    let appointment;
    try {
      appointment = await Appointment.create({
        doctor: doctorId,
        scheduleId,
        dateTime: normalizedDateTime,
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
    } catch (createErr) {
      await releaseScheduleSlot(scheduleId, time);

      if (createErr?.code === 11000) {
        return createError(
          res,
          409,
          "Khung giờ này đã có người đặt hoặc bạn đã đặt lịch trùng giờ",
        );
      }

      throw createErr;
    }

    const populated = await Appointment.findById(appointment._id)
      .populate("patientProfile", "fullName phone")
      .populate("patient", "fullName email phone")
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

export const requestCancelAppointment = handleAsync(async (req, res) => {
  const { id } = req.params;
  const { reason } = req.body;

  const appointment = await Appointment.findOne({
    _id: id,
    patient: req.user._id,
  });

  if (!appointment) {
    return createError(res, 404, "Không tìm thấy lịch hẹn");
  }

  if (!["PENDING", "CONFIRM"].includes(appointment.status)) {
    return createError(
      res,
      400,
      "Chỉ có thể hủy lịch ở trạng thái PENDING hoặc CONFIRM",
    );
  }

  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const canceledCountThisMonth = await Appointment.countDocuments({
    patient: req.user._id,
    status: "CANCELED",
    canceledBy: "patient",
    $or: [
      { canceledAt: { $gte: startOfMonth } },
      {
        canceledAt: { $in: [null, undefined] },
        updatedAt: { $gte: startOfMonth },
      },
    ],
  });

  console.log(
    `[CANCEL REQUEST] User ${req.user._id} - Current canceled count: ${canceledCountThisMonth}`,
  );

  if (canceledCountThisMonth >= 4) {
    return createError(
      res,
      400,
      "Bạn đã hủy 4 lịch trong tháng này. Không thể hủy thêm.",
    );
  }

  appointment.status = "CANCELED";
  appointment.canceledBy = "patient";
  appointment.canceledAt = new Date();
  appointment.reason = reason || "Người dùng hủy";
  const wasPaid = appointment.payment?.paymentStatus === "PAID";

  // User hủy = KHÔNG hoàn cọc (giữ nguyên PAID nếu đã thanh toán)
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

  const message =
    appointment.payment?.paymentStatus === "PAID"
      ? "Hủy lịch thành công. Tiền cọc sẽ KHÔNG được hoàn lại."
      : "Hủy lịch thành công.";

  createResponse(res, 200, message, {
    appointment,
    canceledCountThisMonth: canceledCountThisMonth + 1,
    remainingCancels: Math.max(0, 4 - (canceledCountThisMonth + 1)),
  });
});

export const updateAppointmentStatus = handleAsync(async (req, res) => {
  const { id } = req.params;
  const { status, reason, paymentStatus, withRefund } = req.body;

  if (req.user?.role === RoleEnum.USER) {
    if (status !== "CANCELED") {
      return createError(res, 403, "Bạn chỉ có thể hủy lịch");
    }

    if (paymentStatus) {
      return createError(
        res,
        403,
        "Bạn không có quyền cập nhật trạng thái hoàn tiền",
      );
    }

    return requestCancelAppointment(req, res);
  }

  const appointment = await Appointment.findById(id);
  if (!appointment) return createError(res, 404, "Appointment not found");

  if (paymentStatus && status && status !== "CANCELED") {
    return createError(
      res,
      400,
      "Chỉ được gửi paymentStatus cùng status=CANCELED",
    );
  }

  const isCancelingNow =
    status === "CANCELED" && appointment.status !== "CANCELED";

  if (paymentStatus && !isCancelingNow) {
    if (appointment.status !== "CANCELED") {
      return createError(
        res,
        400,
        "Chỉ có thể cập nhật trạng thái hoàn tiền khi lịch đã hủy",
      );
    }

    const currentPaymentStatus = appointment.payment?.paymentStatus || "UNPAID";

    // Idempotent: frontend có thể bắn lại request cùng paymentStatus.
    if (currentPaymentStatus === paymentStatus) {
      return createResponse(
        res,
        200,
        "Trạng thái hoàn tiền đã được cập nhật trước đó",
        appointment,
      );
    }

    const REFUND_FLOW = {
      PAID: ["REFUND_PENDING", "NO_REFUND"],
      REFUND_PENDING: ["REFUNDED"],
      REFUNDED: [],
      NO_REFUND: [],
    };

    const allowedPaymentTransitions = REFUND_FLOW[currentPaymentStatus] || [];
    if (!allowedPaymentTransitions.includes(paymentStatus)) {
      return createError(res, 400, "Invalid payment status transition");
    }

    appointment.payment.paymentStatus = paymentStatus;
    if (reason) {
      appointment.reason = reason;
    }

    await appointment.save();

    let refundMessage = "Cập nhật trạng thái thanh toán thành công";
    if (paymentStatus === "REFUNDED") {
      refundMessage = "Đã xác nhận hoàn tiền thành công";
    } else if (paymentStatus === "REFUND_PENDING") {
      refundMessage = "Đã chuyển trạng thái chờ hoàn tiền";
    } else if (paymentStatus === "NO_REFUND") {
      refundMessage = "Đã xác nhận hủy không hoàn tiền";
    }

    return createResponse(res, 200, refundMessage, appointment);
  }

  if (!status) {
    return createError(res, 400, "status is required");
  }

  // Idempotent: request trùng trạng thái sẽ không bị báo transition lỗi.
  if (appointment.status === status) {
    return createResponse(
      res,
      200,
      "Trạng thái lịch đã được cập nhật trước đó",
      appointment,
    );
  }

  const STATUS_FLOW = {
    PENDING: ["CONFIRM", "CANCELED"],
    CONFIRM: ["CHECKIN", "CANCELED"],
    CHECKIN: ["DONE", "CANCELED"],
    DONE: [],
    CANCELED: [],
    "REQUEST-CANCELED": ["CANCELED"],
  };

  const allowed = STATUS_FLOW[appointment.status] || [];

  if (!allowed.includes(status)) {
    return createError(res, 400, "Invalid status transition");
  }

  const previousStatus = appointment.status;
  const wasPaidBeforeCancel = appointment.payment?.paymentStatus === "PAID";

  appointment.status = status;

  if (reason) {
    appointment.reason = reason;
  }

  if (status === "CANCELED") {
    appointment.canceledBy = "clinic";
    appointment.canceledAt = new Date();

    if (appointment.payment?.paymentStatus === "PAID") {
      if (paymentStatus) {
        if (!["REFUND_PENDING", "NO_REFUND"].includes(paymentStatus)) {
          return createError(
            res,
            400,
            "Khi hủy lịch đã thanh toán, paymentStatus chỉ được là REFUND_PENDING hoặc NO_REFUND",
          );
        }
        appointment.payment.paymentStatus = paymentStatus;
      } else {
        appointment.payment.paymentStatus =
          withRefund === false ? "NO_REFUND" : "REFUND_PENDING";
      }
    } else {
      if (paymentStatus) {
        return createError(
          res,
          400,
          "Lịch chưa thanh toán thì không thể đặt paymentStatus này khi hủy",
        );
      }

      appointment.payment.paymentStatus =
        appointment.payment.paymentStatus === "EXPIRED" ? "EXPIRED" : "FAILED";
    }

    await releaseScheduleSlot(appointment.scheduleId, appointment.time);
  }

  await appointment.save();

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

    const sendAdminCanceledEmail =
      appointment.payment?.paymentStatus === "NO_REFUND"
        ? sendAdminCanceledPaidAppointmentNoRefundEmail
        : sendAdminCanceledPaidAppointmentWithRefundEmail;

    sendAdminCanceledEmail(appointment).catch((err) => {
      console.error("Send admin cancel paid email failed:", err.message);
    });
  }

  let message = "Update status success";
  if (status === "CANCELED") {
    if (appointment.payment?.paymentStatus === "REFUND_PENDING") {
      message =
        "Hủy lịch thành công. Lịch đã chuyển sang trạng thái chờ hoàn tiền.";
    } else if (appointment.payment?.paymentStatus === "NO_REFUND") {
      message = "Hủy lịch thành công. Tiền cọc sẽ KHÔNG được hoàn lại.";
    } else {
      message = "Hủy lịch thành công.";
    }
  }

  createResponse(res, 200, message, appointment);
});
