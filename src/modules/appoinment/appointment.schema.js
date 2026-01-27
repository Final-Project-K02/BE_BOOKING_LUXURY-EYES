import { z } from "zod";


export const createAppointmentSchema = z.object({
  body: z.object({
    doctorId: z.string().min(1, "doctorId is required"),
    scheduleId: z.string().min(1, "scheduleId is required"),
    dateTime: z.string().datetime(),
    time: z.string().regex(/^\d{2}:\d{2}$/, "Invalid time format"),
    room: z.object({
      id: z.number(),
      name: z.string(),
    }),
  }),
});


export const updateAppointmentStatusSchema = z.object({
  body: z.object({
    status: z.enum([
      "PENDING",
      "CONFIRM",
      "CHECKIN",
      "DONE",
      "CANCELED",
      "REQUEST-CANCELED",
    ]),
  }),
  params: z.object({
    id: z.string().length(24),
  }),
});
