import { z } from "zod";


export const createDoctorSchema = z.object({
  body: z.object({
    name: z
      .string({ required_error: "Tên bác sĩ là bắt buộc" })
      .min(1, "Tên bác sĩ là bắt buộc"),

    avatar: z
      .string()
      .url("Avatar phải là URL hợp lệ")
      .optional(),

    email: z
      .string({ required_error: "Email là bắt buộc" })
      .email("Email không hợp lệ"),

    phone: z
      .string({ required_error: "Số điện thoại là bắt buộc" })
      .regex(/^0\d{9}$/, "Số điện thoại không hợp lệ"),

  
    price: z
      .number({ required_error: "Giá khám là bắt buộc" })
      .min(0, "Giá khám phải >= 0"),

    description: z.string().optional(),

    experience_year: z
      .number({ required_error: "Số năm kinh nghiệm là bắt buộc" })
      .min(0, "Số năm kinh nghiệm phải >= 0"),
  }),
});

/**
 * Update Doctor
 */
export const updateDoctorSchema = z.object({
  body: z.object({
    name: z.string().min(1, "Tên không được rỗng").optional(),

    avatar: z.string().url("Avatar không hợp lệ").optional(),

    email: z.string().email("Email không hợp lệ").optional(),

    phone: z
      .string()
      .regex(/^0\d{9}$/, "Số điện thoại không hợp lệ")
      .optional(),

    licensenumber: z.string().min(3, "Số giấy phép không hợp lệ").optional(),

    price: z.number().min(0, "Giá khám phải >= 0").optional(),

    description: z.string().optional(),

    experience_year: z.number().min(0).optional(),
  }),

  params: z.object({
    id: z.string().length(24, "Doctor id không hợp lệ"),
  }),
});

/**
 * Doctor ID param
 */
export const doctorIdSchema = z.object({
  params: z.object({
    id: z.string().length(24, "Doctor id không hợp lệ"),
  }),
});
