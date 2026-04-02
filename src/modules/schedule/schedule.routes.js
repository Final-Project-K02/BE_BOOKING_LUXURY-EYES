import express from "express";
import {
  getSchedules,
  createSchedule,
  updateSchedule,
  deleteSchedule,
} from "./scheduleController.js";

import { validate } from "../../middleware/validate.js";
import {
  createScheduleSchema,
  updateScheduleSchema,
} from "./schedule.schema.js";
import { checkAuth } from "../../shared/middlewares/checkAuth.js";
import { RoleEnum } from "../../shared/constant/enum.js";
import { checkPermission } from "../../shared/middlewares/checkPermission.js";

const scheduleRouter = express.Router();

scheduleRouter.get("/", checkAuth, getSchedules);

scheduleRouter.post(
  "/",
  checkAuth,
  checkPermission([RoleEnum.STAFF, RoleEnum.ADMIN]),
  validate(createScheduleSchema),
  createSchedule,
);

scheduleRouter.put(
  "/:id",
  checkAuth,
  checkPermission([RoleEnum.STAFF, RoleEnum.ADMIN]),
  validate(updateScheduleSchema),
  updateSchedule,
);

scheduleRouter.delete(
  "/:id",
  checkAuth,
  checkPermission([RoleEnum.STAFF, RoleEnum.ADMIN]),
  deleteSchedule,
);

export default scheduleRouter;
