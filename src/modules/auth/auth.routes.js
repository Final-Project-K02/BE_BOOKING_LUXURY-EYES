import { Router } from "express";
import {
  forgotPassword,
  login,
  refreshToken,
  register,
  sendForgotPassword,
} from "./auth.controller.js";
import validBodyRequest from "../../shared/middlewares/validBodyRequest.js";
import { loginSchema, registerSchema } from "./auth.schema.js";

const authRoutes = Router();
authRoutes.post("/register", validBodyRequest(registerSchema), register);
authRoutes.post("/login", validBodyRequest(loginSchema), login);
authRoutes.post("/refresh-token", refreshToken);
authRoutes.post("/send-forgot", sendForgotPassword);
authRoutes.post("/forgot-password", forgotPassword);

export default authRoutes;
