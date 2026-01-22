import { Router } from "express";
import { register } from "./auth.controller.js";
import validBodyRequest from "../../shared/middlewares/validBodyRequest.js";
import { registerSchema } from "./auth.schema.js";

const authRoutes = Router();
authRoutes.post("/register", validBodyRequest(registerSchema), register);

export default authRoutes;
