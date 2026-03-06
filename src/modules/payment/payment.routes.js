import express from "express";
import {
  createVnpayPayment,
  createVnpayLinkForAppointment,
  vnpayIpn,
  vnpayReturn,
  getVnpayPaymentStatus,
} from "./payment.controller.js";
import { checkAuth } from "../../shared/middlewares/checkAuth.js";

const paymentRouter = express.Router();

paymentRouter.post("/vnpay/create", checkAuth, createVnpayPayment);
paymentRouter.post(
  "/vnpay/link/:appointmentId",
  checkAuth,
  createVnpayLinkForAppointment
);
paymentRouter.get("/vnpay/ipn", vnpayIpn);
paymentRouter.get("/vnpay/return", vnpayReturn);
paymentRouter.get("/vnpay/status/:txnRef", checkAuth, getVnpayPaymentStatus);

export default paymentRouter;