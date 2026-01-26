import { Router } from "express";
import { getUsers } from "./user.controller.js";
import { checkAuth } from "../../shared/middlewares/checkAuth.js";
import { checkPermission } from "../../shared/middlewares/checkPermission.js";
import { RoleEnum } from "../../shared/constant/enum.js";

const userRoutes = Router();

userRoutes.use(checkAuth, checkPermission([RoleEnum.ADMIN, RoleEnum.STAFF]));
userRoutes.get("/users", getUsers);

export default userRoutes;
