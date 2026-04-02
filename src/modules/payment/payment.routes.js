import express from "express";
import {
  createVnpayPayment,
  createVnpayLinkForAppointment,
  vnpayIpn,
  vnpayReturn,
  getVnpayPaymentStatus,
} from "./payment.controller.js";
import { checkAuth } from "../../shared/middlewares/checkAuth.js";
import { checkPermission } from "../../shared/middlewares/checkPermission.js";
import { RoleEnum } from "../../shared/constant/enum.js";

const paymentRouter = express.Router();

paymentRouter.post(
  "/vnpay/create",
  checkAuth,
  checkPermission([RoleEnum.USER]),
  createVnpayPayment,
);
paymentRouter.post(
  "/vnpay/link/:appointmentId",
  checkAuth,
  checkPermission([RoleEnum.USER]),
  createVnpayLinkForAppointment,
);
paymentRouter.get("/vnpay/ipn", vnpayIpn);
paymentRouter.get("/vnpay/return", vnpayReturn);
paymentRouter.get(
  "/vnpay/status/:txnRef",
  checkAuth,
  checkPermission([RoleEnum.USER]),
  getVnpayPaymentStatus,
);

export default paymentRouter;
