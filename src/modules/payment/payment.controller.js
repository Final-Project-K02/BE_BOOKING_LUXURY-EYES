import handleAsync from "../../shared/utils/handleAsync.js";
import createResponse from "../../shared/utils/createResponse.js";
import { getClientIp } from "../../shared/utils/vnpay.util.js";
import {
  generatePaymentLinkForAppointment,
  createPaymentWithNewAppointment,
  handleVnpayIpn,
  handleVnpayReturn,
  fetchPaymentStatus,
} from "./payment.service.js";

export const createVnpayLinkForAppointment = handleAsync(async (req, res) => {
  const data = await generatePaymentLinkForAppointment(
    req.params.appointmentId,
    req.user._id,
    getClientIp(req),
  );
  createResponse(res, 200, "Tạo link thanh toán thành công", data);
});

export const createVnpayPayment = handleAsync(async (req, res) => {
  const data = await createPaymentWithNewAppointment(
    req.body,
    req.user._id,
    getClientIp(req),
  );
  res.status(201).json({ message: "Tạo link thanh toán thành công", data });
});

export const vnpayIpn = handleAsync(async (req, res) => {
  const { rspCode, message } = await handleVnpayIpn(req.query);
  res.status(200).json({ RspCode: rspCode, Message: message });
});

export const vnpayReturn = async (req, res) => {
  try {
    const { redirectParams } = await handleVnpayReturn(req.query);
    res.redirect(
      `${process.env.CLIENT_URI}payment/vnpay-result?${redirectParams}`,
    );
  } catch {
    res.redirect(
      `${process.env.CLIENT_URI}payment/vnpay-result?success=false&code=99`,
    );
  }
};

export const getVnpayPaymentStatus = handleAsync(async (req, res) => {
  const data = await fetchPaymentStatus(req.params.txnRef, req.user._id);
  createResponse(res, 200, "Success", data);
});
