import { z } from "zod";

export const createPatientProfileSchema = z.object({
  fullName: z
    .string({ required_error: "Họ và tên là bắt buộc" })
    .min(3, "Họ và tên phải có ít nhất 3 ký tự"),

  phone: z
    .string({ required_error: "Số điện thoại là bắt buộc" })
    .regex(/^0\d{9}$/, "Số điện thoại không hợp lệ"),

  gender: z.enum(["male", "female", "other"], {
    required_error: "Giới tính là bắt buộc",
  }),

  dateOfBirth: z.preprocess(
    (arg) => {
      if (typeof arg === "string" || arg instanceof Date) return new Date(arg);
      return arg;
    },
    z
      .date({ required_error: "Ngày sinh là bắt buộc" })
      .max(new Date(), "Ngày sinh không hợp lệ"),
  ),

  identityCard: z
    .string()
    .regex(/^(\d{9}|\d{12})$/, "CMND/CCCD không hợp lệ")
    .optional(),

  email: z.string().email("Email không hợp lệ").optional(),

  address: z.string().optional(),
});

export const updatePatientProfileSchema = z.object({
  body: z.object({
    fullName: z.string().min(3, "Họ và tên phải có ít nhất 3 ký tự").optional(),

    phone: z
      .string()
      .regex(/^0\d{9}$/, "Số điện thoại không hợp lệ")
      .optional(),

    gender: z.enum(["male", "female", "other"]).optional(),

    dateOfBirth: z.preprocess((arg) => {
      if (!arg) return undefined;
      if (typeof arg === "string" || arg instanceof Date) return new Date(arg);
      return arg;
    }, z.date().max(new Date(), "Ngày sinh không hợp lệ").optional()),

    identityCard: z
      .string()
      .regex(/^(\d{9}|\d{12})$/, "CMND/CCCD không hợp lệ")
      .optional(),

    email: z.string().email("Email không hợp lệ").optional(),

    address: z.string().optional(),
  }),

  params: z.object({
    id: z.string().length(24, "Patient profile id không hợp lệ"),
  }),
});

export const patientProfileIdSchema = z.object({
  params: z.object({
    id: z
      .string()
      .regex(/^[0-9a-fA-F]{24}$/, "Patient profile id không hợp lệ"),
  }),
});
