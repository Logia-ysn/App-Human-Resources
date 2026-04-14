import { z } from "zod";

const ROLES = ["SUPER_ADMIN", "HR_ADMIN", "MANAGER", "EMPLOYEE"] as const;

const passwordSchema = z
  .string()
  .min(8, "Password minimal 8 karakter")
  .max(72, "Password maksimal 72 karakter");

export const createEmployeeAccountSchema = z.object({
  email: z.email("Format email tidak valid").optional(),
  password: passwordSchema,
  role: z.enum(ROLES).default("EMPLOYEE"),
  mustChangePassword: z.boolean().default(true),
});

export const updateEmployeeAccountSchema = z.object({
  role: z.enum(ROLES).optional(),
  isActive: z.boolean().optional(),
});

export const resetPasswordSchema = z.object({
  password: passwordSchema,
  mustChangePassword: z.boolean().default(true),
});

export type CreateEmployeeAccountInput = z.infer<typeof createEmployeeAccountSchema>;
export type UpdateEmployeeAccountInput = z.infer<typeof updateEmployeeAccountSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
