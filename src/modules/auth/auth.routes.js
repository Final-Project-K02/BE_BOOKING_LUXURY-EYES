import { Router } from "express";
import {
  forgotPassword,
  login,
  logout,
  refreshToken,
  register,
  sendForgotPassword,
} from "./auth.controller.js";
import validBodyRequest from "../../shared/middlewares/validBodyRequest.js";
import {
  forgotPasswordSchema,
  loginSchema,
  registerSchema,
  sendForgotPasswordSchema,
} from "./auth.schema.js";

const authRoutes = Router();
authRoutes.post("/register", validBodyRequest(registerSchema), register);
authRoutes.post("/login", validBodyRequest(loginSchema), login);
authRoutes.post("/logout", logout);
authRoutes.post("/refresh-token", refreshToken);
authRoutes.post(
  "/send-forgot",
  validBodyRequest(sendForgotPasswordSchema),
  sendForgotPassword,
);
authRoutes.post(
  "/forgot-password",
  validBodyRequest(forgotPasswordSchema),
  forgotPassword,
);

export default authRoutes;
