import { z } from "zod";

export const createOrgLevelSchema = z.object({
  rank: z.number().int().min(0, "Rank minimal 0"),
  name: z.string().min(1, "Nama level wajib diisi"),
  code: z.string().min(1, "Kode level wajib diisi").max(20),
});

export const updateOrgLevelSchema = createOrgLevelSchema.partial();

export type CreateOrgLevelInput = z.infer<typeof createOrgLevelSchema>;
export type UpdateOrgLevelInput = z.infer<typeof updateOrgLevelSchema>;
