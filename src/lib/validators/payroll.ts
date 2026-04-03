import { z } from "zod";

export const createPayrollPeriodSchema = z.object({
  month: z.number().int().min(1).max(12),
  year: z.number().int().min(2020).max(2030),
});

export const processPayrollSchema = z.object({
  action: z.enum(["calculate", "approve", "pay", "cancel"]),
  notes: z.string().optional(),
});

export const employeeSalarySchema = z.object({
  employeeId: z.string().min(1),
  componentId: z.string().min(1),
  amount: z.number().min(0),
  effectiveDate: z.string().min(1),
  endDate: z.string().nullable().optional(),
});

export type CreatePayrollPeriodInput = z.infer<typeof createPayrollPeriodSchema>;
export type ProcessPayrollInput = z.infer<typeof processPayrollSchema>;
export type EmployeeSalaryInput = z.infer<typeof employeeSalarySchema>;
