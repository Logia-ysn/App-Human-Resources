import { z } from "zod";

export const createProfileChangeRequestSchema = z.object({
  message: z
    .string()
    .min(5, "Pesan minimal 5 karakter")
    .max(2000, "Pesan maksimal 2000 karakter"),
});

export const resolveProfileChangeRequestSchema = z.object({
  status: z.enum(["RESOLVED", "REJECTED"]),
  handledNote: z.string().max(1000).optional().nullable(),
});

export type CreateProfileChangeRequestInput = z.infer<
  typeof createProfileChangeRequestSchema
>;
export type ResolveProfileChangeRequestInput = z.infer<
  typeof resolveProfileChangeRequestSchema
>;
