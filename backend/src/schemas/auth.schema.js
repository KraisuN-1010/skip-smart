import { z } from "zod";

export const registerSchema = z.object({
  body: z
    .object({
      firstName: z.string().trim().min(1, { message: "First name is required" }),
      lastName: z.string().trim().min(1, { message: "Last name is required" }),
      email: z.string().trim().toLowerCase().email({ message: "Invalid email address" }),
      password: z.string().min(8, { message: "Password must be at least 8 characters" }),
      thresholdPct: z
        .number()
        .min(1, { message: "Percentage must be greater than 0" })
        .max(100, { message: "Percentage cannot exceed 100" })
        .default(75),
      startDate: z.string().date({ message: "Invalid start date" }),
      endDate: z.string().date({ message: "Invalid end date" }),
    })
    .refine((data) => data.startDate < data.endDate, {
      message: "Start date must be before the end date",
      path: ["endDate"],
    }),
});

export const verifyEmailSchema = z.object({
  body: z.object({
    email: z.string().trim().toLowerCase().email({ message: "Invalid email address" }),
    code: z
      .string()
      .length(6, { message: "Verification code must be 6 digits" })
      .regex(/^\d{6}$/, { message: "Verification code must be numeric" }),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().trim().toLowerCase().email({ message: "Invalid email address" }),
    password: z.string().min(1, { message: "Password is required" }),
  }),
});

export const refreshTokenSchema = z.object({
  body: z.object({
    refreshToken: z.string().min(1, { message: "Refresh token is required" }),
  }),
});
