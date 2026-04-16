import { z } from "zod";

export const createHolidaySchema = z.object({
  name: z.string().min(1, "Nama wajib diisi").max(100),
  date: z.string().min(1, "Tanggal wajib diisi").regex(/^\d{4}-\d{2}-\d{2}/, "Format tanggal harus YYYY-MM-DD"),
  type: z.enum(["NATIONAL", "COMPANY", "CUTI_BERSAMA"]),
  isRecurring: z.boolean().default(false),
});

export type CreateHolidayInput = z.infer<typeof createHolidaySchema>;
