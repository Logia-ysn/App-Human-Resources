import { z } from "zod";

export const checkInSchema = z.object({
  employeeId: z.string().min(1),
  note: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
});

export const checkOutSchema = z.object({
  note: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
});

export const attendanceQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  employeeId: z.string().optional(),
  status: z.enum(["PRESENT", "ABSENT", "LATE", "LEAVE", "HOLIDAY", "SICK", "BUSINESS_TRIP"]).optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

export const overtimeRequestSchema = z.object({
  date: z.string().min(1, "Tanggal wajib diisi"),
  startTime: z.string().min(1, "Jam mulai wajib diisi"),
  endTime: z.string().min(1, "Jam selesai wajib diisi"),
  plannedMinutes: z.number().int().min(1),
  reason: z.string().min(1, "Alasan wajib diisi"),
});

export type CheckInInput = z.infer<typeof checkInSchema>;
export type CheckOutInput = z.infer<typeof checkOutSchema>;
export type AttendanceQuery = z.infer<typeof attendanceQuerySchema>;
export type OvertimeRequestInput = z.infer<typeof overtimeRequestSchema>;
