import { Router } from "express";
import { login, refreshToken, register } from "./auth.controller.js";
import validBodyRequest from "../../shared/middlewares/validBodyRequest.js";
import { registerSchema } from "./auth.schema.js";

const authRoutes = Router();
authRoutes.post("/register", validBodyRequest(registerSchema), register);
authRoutes.post("/login", login);
authRoutes.post("/refresh-token", refreshToken);

export default authRoutes;
