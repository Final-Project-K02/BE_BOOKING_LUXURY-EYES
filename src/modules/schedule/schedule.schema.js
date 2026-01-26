import { z } from "zod";

const timeSlotSchema = z.object({
  date: z.string(),
  time: z.string(),
  blockTime: z.number().min(5),
  status: z.enum(["AVAILABLE", "BOOKED"]).optional(),
  capacity: z.number().min(1),
});

export const createScheduleSchema = z.object({
  body: z.object({
    doctorId: z.string().length(24),
    roomId: z.number(),
    roomName: z.string(),
    price: z.number().min(0),
    timeSlots: z.array(timeSlotSchema).min(1),
  }),
});

export const updateScheduleSchema = createScheduleSchema.extend({
  params: z.object({
    id: z.string().length(24),
  }),
});
