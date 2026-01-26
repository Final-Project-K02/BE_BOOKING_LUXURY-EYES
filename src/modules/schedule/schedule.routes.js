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

const scheduleRouter = express.Router();

scheduleRouter.get("/", getSchedules);
scheduleRouter.post("/", validate(createScheduleSchema), createSchedule);
scheduleRouter.put("/:id", validate(updateScheduleSchema), updateSchedule);
scheduleRouter.delete("/:id", deleteSchedule);

export default scheduleRouter;