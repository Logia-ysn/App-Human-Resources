import { z } from "zod";

export const createDepartmentSchema = z.object({
  name: z.string().min(1, "Nama departemen wajib diisi"),
  code: z.string().min(1, "Kode departemen wajib diisi").max(10),
  description: z.string().optional(),
  parentId: z.string().nullable().optional(),
  headEmployeeId: z.string().nullable().optional(),
});

export const updateDepartmentSchema = createDepartmentSchema.partial();

export type CreateDepartmentInput = z.infer<typeof createDepartmentSchema>;
export type UpdateDepartmentInput = z.infer<typeof updateDepartmentSchema>;
