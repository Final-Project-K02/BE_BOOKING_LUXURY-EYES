import Appointment from "../appointment/appointment.js";
import Doctor from "../doctor/doctor.js";
import {
  createSecureHash,
  buildQuery,
  formatVnpDate,
  getClientIp,
} from "../../shared/utils/vnpay.util.js";

export const createVnpayLinkForAppointment = async (req, res) => {
  try {
    const { appointmentId } = req.params;

    const appointment = await Appointment.findOne({
      _id: appointmentId,
      patient: req.user._id,
    });

    if (!appointment) {
      return res.status(404).json({ message: "Không tìm thấy lịch hẹn" });
    }

    if (appointment.status === "CONFIRM" || appointment.payment?.paymentStatus === "PAID") {
      return res.status(400).json({ message: "Lịch này đã thanh toán" });
    }

    if (appointment.status === "CANCELED") {
      return res.status(400).json({ message: "Lịch này đã bị hủy" });
    }

    const now = new Date();
    const expireAt = appointment.payment?.expireAt;

    if (!expireAt || new Date(expireAt) <= now) {
      appointment.status = "CANCELED";
      appointment.payment.paymentStatus = "EXPIRED";
      await appointment.save();

      return res.status(400).json({
        message: "Lịch đã hết hạn thanh toán",
      });
    }

    const txnRef = `APT${Date.now()}${Math.floor(Math.random() * 1000)}`;
    const depositAmount = Number(appointment.payment?.depositAmount || 0);

    appointment.payment.txnRef = txnRef;
    appointment.payment.paymentStatus = "PENDING";
    await appointment.save();

    const vnpParams = {
      vnp_Version: "2.1.0",
      vnp_Command: "pay",
      vnp_TmnCode: process.env.VNPAY_TMN_CODE,
      vnp_Amount: depositAmount * 100,
      vnp_CurrCode: "VND",
      vnp_TxnRef: txnRef,
      vnp_OrderInfo: `DAT COC LICH KHAM ${appointment._id}`,
      vnp_OrderType: "other",
      vnp_Locale: "vn",
      vnp_ReturnUrl: process.env.VNPAY_RETURN_URL,
      vnp_IpAddr: getClientIp(req),
      vnp_CreateDate: formatVnpDate(new Date()),
      vnp_ExpireDate: formatVnpDate(expireAt),
    };
    console.log("SERVER NOW =", new Date().toString());
console.log("CREATE DATE =", formatVnpDate(new Date()));
console.log("EXPIRE DATE =", formatVnpDate(expireAt));

    const secureHash = createSecureHash(vnpParams, process.env.VNPAY_HASH_SECRET);
    const query = buildQuery(vnpParams);
    const paymentUrl = `${process.env.VNPAY_URL}?${query}&vnp_SecureHash=${secureHash}`;
console.log("==== CREATE VNPAY LINK FOR APPOINTMENT ====");
console.log("TMN =", process.env.VNPAY_TMN_CODE);
console.log("RETURN =", process.env.VNPAY_RETURN_URL);
console.log("IPN =", process.env.VNPAY_IPN_URL);
console.log("PARAMS =", vnpParams);
console.log("SIGN =", secureHash);
console.log("URL =", paymentUrl);
    return res.status(200).json({
      message: "Tạo link thanh toán thành công",
      data: {
        appointmentId: appointment._id,
        txnRef,
        paymentUrl,
        expireAt,
      },
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
export const createVnpayPayment = async (req, res) => {
  try {
    const { doctorId, scheduleId, dateTime, time, room, totalAmount } = req.body;

    if (!doctorId || !scheduleId || !dateTime || !time) {
      return res.status(400).json({
        message: "doctorId, scheduleId, dateTime, time là bắt buộc",
      });
    }

    if (!totalAmount || Number(totalAmount) <= 0) {
      return res.status(400).json({
        message: "totalAmount is required",
      });
    }

    if (!process.env.VNPAY_TMN_CODE) {
      return res.status(500).json({
        message: "Thiếu cấu hình VNPAY_TMN_CODE",
      });
    }

    if (!process.env.VNPAY_HASH_SECRET) {
      return res.status(500).json({
        message: "Thiếu cấu hình VNPAY_HASH_SECRET",
      });
    }

    if (!process.env.VNPAY_URL) {
      return res.status(500).json({
        message: "Thiếu cấu hình VNPAY_URL",
      });
    }

    if (!process.env.VNPAY_RETURN_URL) {
      return res.status(500).json({
        message: "Thiếu cấu hình VNPAY_RETURN_URL",
      });
    }

    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return res.status(404).json({
        message: "Không tìm thấy bác sĩ",
      });
    }

    if (!doctor.is_active) {
      return res.status(400).json({
        message: "Bác sĩ hiện không nhận lịch khám",
      });
    }

    const total = Number(totalAmount);
    const depositAmount = Math.ceil(total * 0.4); // 40%, làm tròn lên
    const expireAt = new Date(Date.now() + 15 * 60 * 1000);
    const txnRef = `APT${Date.now()}${Math.floor(Math.random() * 1000)}`;

    const appointment = await Appointment.create({
      doctor: doctorId,
      scheduleId,
      dateTime,
      time,
      room,
      patient: req.user._id,
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

    const vnpParams = {
      vnp_Version: "2.1.0",
      vnp_Command: "pay",
      vnp_TmnCode: process.env.VNPAY_TMN_CODE,
      vnp_Amount: depositAmount * 100,
      vnp_CurrCode: "VND",
      vnp_TxnRef: txnRef,
      vnp_OrderInfo: `DAT COC LICH KHAM ${appointment._id}`,
      vnp_OrderType: "other",
      vnp_Locale: "vn",
      vnp_ReturnUrl: process.env.VNPAY_RETURN_URL,
      vnp_IpAddr: getClientIp(req),
      vnp_CreateDate: formatVnpDate(new Date()),
      vnp_ExpireDate: formatVnpDate(expireAt),
    };

    const secureHash = createSecureHash(vnpParams, process.env.VNPAY_HASH_SECRET);
    const query = buildQuery(vnpParams);

    const paymentUrl = `${process.env.VNPAY_URL}?${query}&vnp_SecureHash=${secureHash}`;
console.log("==== CREATE DIRECT VNPAY PAYMENT ====");
console.log("TMN =", process.env.VNPAY_TMN_CODE);
console.log("RETURN =", process.env.VNPAY_RETURN_URL);
console.log("IPN =", process.env.VNPAY_IPN_URL);
console.log("PARAMS =", vnpParams);
console.log("SIGN =", secureHash);
console.log("URL =", paymentUrl);
    return res.status(201).json({
      message: "Tạo link thanh toán thành công",
      data: {
        appointmentId: appointment._id,
        depositAmount,
        paymentUrl,
        txnRef,
      },
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || "Internal server error",
    });
  }
};

export const vnpayIpn = async (req, res) => {
  try {
    console.log("==== VNPAY IPN CALLBACK ====");
console.log("QUERY =", req.query);
    const inputData = { ...req.query };
    const secureHash = inputData.vnp_SecureHash;

    delete inputData.vnp_SecureHash;
    delete inputData.vnp_SecureHashType;

    const signed = createSecureHash(inputData, process.env.VNPAY_HASH_SECRET);

    if (secureHash !== signed) {
      return res.status(200).json({ RspCode: "97", Message: "Invalid signature" });
    }

    const txnRef = inputData.vnp_TxnRef;
    const vnpAmount = Number(inputData.vnp_Amount) / 100;
    const responseCode = inputData.vnp_ResponseCode;
    const transactionStatus = inputData.vnp_TransactionStatus;
    const vnpTransactionNo = inputData.vnp_TransactionNo;

    const appointment = await Appointment.findOne({ "payment.txnRef": txnRef });

    if (!appointment) {
      return res.status(200).json({ RspCode: "01", Message: "Order not found" });
    }

    if (Number(appointment.payment?.depositAmount || 0) !== vnpAmount) {
      return res.status(200).json({ RspCode: "04", Message: "Invalid amount" });
    }

    if (
      appointment.payment?.paymentStatus === "PAID" ||
      appointment.status === "CONFIRM"
    ) {
      return res.status(200).json({ RspCode: "02", Message: "Order already confirmed" });
    }

    const now = new Date();
    const isExpired =
      !appointment.payment?.expireAt ||
      new Date(appointment.payment.expireAt) <= now;

    const isSuccess = responseCode === "00" && transactionStatus === "00";

    if (isSuccess) {
      appointment.payment.paymentStatus = "PAID";
      appointment.payment.vnpTransactionNo = vnpTransactionNo || null;
      appointment.payment.paidAt = new Date();
      appointment.status = "CONFIRM";
    } else if (isExpired) {
      appointment.payment.paymentStatus = "EXPIRED";
      appointment.status = "CANCELED";
    } else {
      // cho phép thanh toán lại trong thời gian còn hạn
      appointment.payment.paymentStatus = "UNPAID";
      appointment.status = "PENDING";
    }

    await appointment.save();

    return res.status(200).json({ RspCode: "00", Message: "Confirm Success" });
  } catch (error) {
    return res.status(200).json({ RspCode: "99", Message: "Unknown error" });
  }
};

export const vnpayReturn = async (req, res) => {
  try {console.log("==== VNPAY RETURN CALLBACK ====");
console.log("QUERY =", req.query);
    const inputData = { ...req.query };
    const secureHash = inputData.vnp_SecureHash;

    delete inputData.vnp_SecureHash;
    delete inputData.vnp_SecureHashType;

    const signed = createSecureHash(inputData, process.env.VNPAY_HASH_SECRET);

    if (secureHash !== signed) {
      return res.redirect(
        `${process.env.CLIENT_URL}/payment/vnpay-result?success=false&code=97`
      );
    }

    const success =
      inputData.vnp_ResponseCode === "00" &&
      inputData.vnp_TransactionStatus === "00";

    return res.redirect(
      `${process.env.CLIENT_URL}/payment/vnpay-result?success=${success}&txnRef=${inputData.vnp_TxnRef}&code=${inputData.vnp_ResponseCode}`
    );
  } catch (error) {
    return res.redirect(
      `${process.env.CLIENT_URL}/payment/vnpay-result?success=false&code=99`
    );
  }
};

export const getVnpayPaymentStatus = async (req, res) => {
  try {
    const { txnRef } = req.params;

    if (!txnRef) {
      return res.status(400).json({
        message: "txnRef is required",
      });
    }

    const appointment = await Appointment.findOne({
      "payment.txnRef": txnRef,
      patient: req.user._id,
    })
      .populate("doctor", "name fullName avatar")
      .populate("patient", "fullName phone");

    if (!appointment) {
      return res.status(404).json({
        message: "Không tìm thấy lịch hẹn",
      });
    }

    return res.status(200).json({
      message: "Success",
      data: {
        _id: appointment._id,
        status: appointment.status,
        paymentStatus: appointment.payment?.paymentStatus || "UNPAID",
        depositAmount: appointment.payment?.depositAmount || 0,
        totalAmount: appointment.payment?.totalAmount || 0,
        txnRef: appointment.payment?.txnRef || null,
        vnpTransactionNo: appointment.payment?.vnpTransactionNo || null,
        paidAt: appointment.payment?.paidAt || null,
        appointment,
      },
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || "Internal server error",
    });
  }
};