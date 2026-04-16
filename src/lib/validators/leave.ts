import { z } from "zod";

export const createLeaveRequestSchema = z.object({
  leaveTypeId: z.string().min(1, "Tipe cuti wajib dipilih"),
  startDate: z.string().min(1, "Tanggal mulai wajib diisi"),
  endDate: z.string().min(1, "Tanggal selesai wajib diisi"),
  totalDays: z.number().min(0.5),
  isHalfDay: z.boolean().default(false),
  halfDayType: z.enum(["MORNING", "AFTERNOON"]).nullable().optional(),
  reason: z.string().min(1, "Alasan wajib diisi"),
  delegateToId: z.string().nullable().optional(),
});

export const approveLeaveSchema = z.object({
  status: z.enum(["APPROVED", "REJECTED"]),
  note: z.string().optional(),
});

export const leaveQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  status: z.enum(["PENDING", "APPROVED", "REJECTED", "CANCELLED"]).optional(),
  employeeId: z.string().optional(),
  leaveTypeId: z.string().optional(),
  year: z.coerce.number().int().optional(),
});

export const createLeaveTypeSchema = z.object({
  name: z.string().min(1, "Nama wajib diisi").max(100),
  code: z.string().min(1, "Kode wajib diisi").max(30).regex(/^[A-Z0-9_]+$/, "Kode hanya boleh huruf kapital, angka, atau underscore"),
  defaultQuota: z.number().int().min(0).max(365),
  isPaid: z.boolean().default(true),
  isCarryOver: z.boolean().default(false),
  maxCarryOver: z.number().int().min(0).max(365).default(0),
  requiresDoc: z.boolean().default(false),
  allowHalfDay: z.boolean().default(false),
  isActive: z.boolean().default(true),
});

export const updateLeaveTypeSchema = createLeaveTypeSchema.partial();

export type CreateLeaveRequestInput = z.infer<typeof createLeaveRequestSchema>;
export type ApproveLeaveInput = z.infer<typeof approveLeaveSchema>;
export type LeaveQuery = z.infer<typeof leaveQuerySchema>;
export type CreateLeaveTypeInput = z.infer<typeof createLeaveTypeSchema>;
export type UpdateLeaveTypeInput = z.infer<typeof updateLeaveTypeSchema>;
