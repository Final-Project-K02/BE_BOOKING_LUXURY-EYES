import { z } from "zod";

export const createAppointmentSchema = z.object({
  body: z.object({
    doctorId: z.string().length(24, "doctorId invalid"),
    scheduleId: z.string().length(24),
    patientProfileId: z.string().length(24).optional(),
    patientProfile: z
      .union([
        z.string().length(24),
        z.object({
          _id: z.string().length(24).optional(),
          id: z.string().length(24).optional(),
          profileId: z.string().length(24).optional(),
        }),
      ])
      .optional(),
    dateTime: z.string().datetime(),
    time: z.string().regex(/^\d{2}:\d{2}$/),
    room: z.object({
      id: z.number(),
      name: z.string(),
    }),
  }),
});

export const updateAppointmentStatusSchema = z.object({
  body: z
    .object({
      status: z
        .enum([
          "PENDING",
          "CONFIRM",
          "CHECKIN",
          "DONE",
          "CANCELED",
          "REQUEST-CANCELED",
        ])
        .optional(),
      paymentStatus: z.enum(["REFUND_PENDING", "REFUNDED"]).optional(),
      reason: z.string().trim().optional(),
    })
    .refine((data) => !!(data.status || data.paymentStatus), {
      message: "status hoặc paymentStatus là bắt buộc",
    }),
  params: z.object({
    id: z.string().length(24),
  }),
});
