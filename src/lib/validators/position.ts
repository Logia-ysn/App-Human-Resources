import { z } from "zod";

export const createPositionSchema = z.object({
  name: z.string().min(1, "Nama jabatan wajib diisi"),
  code: z.string().min(1, "Kode jabatan wajib diisi").max(10),
  departmentId: z.string().min(1, "Departemen wajib dipilih"),
  level: z.enum(["STAFF", "SUPERVISOR", "MANAGER", "DIRECTOR"]),
  minSalary: z.number().min(0).nullable().optional(),
  maxSalary: z.number().min(0).nullable().optional(),
  description: z.string().optional(),
});

export const updatePositionSchema = createPositionSchema.partial();

export type CreatePositionInput = z.infer<typeof createPositionSchema>;
export type UpdatePositionInput = z.infer<typeof updatePositionSchema>;
