import { z } from "zod";

export const updateCompanySchema = z.object({
  name: z.string().min(1, "Nama perusahaan wajib diisi").max(200).optional(),
  legalName: z.string().min(1, "Nama legal wajib diisi").max(200).optional(),
  npwp: z.string().max(30).nullable().optional(),
  address: z.string().min(1, "Alamat wajib diisi").max(500).optional(),
  city: z.string().min(1).max(100).optional(),
  province: z.string().min(1).max(100).optional(),
  postalCode: z.string().max(10).nullable().optional(),
  phone: z.string().max(30).nullable().optional(),
  email: z.email("Format email tidak valid").nullable().optional(),
  website: z.url("Format website tidak valid").nullable().optional(),
  logoUrl: z.string().max(500).nullable().optional(),
  umrAmount: z.union([z.number().nonnegative(), z.string().regex(/^\d+(\.\d+)?$/)]).optional(),
  umrRegion: z.string().min(1).max(100).optional(),
  cutOffDate: z.number().int().min(1).max(31).optional(),
  payDate: z.number().int().min(1).max(31).optional(),
});

// App config is free-form JSON but we cap shape & size.
export const updateAppConfigSchema = z
  .record(z.string(), z.unknown())
  .refine((obj) => JSON.stringify(obj).length <= 50_000, {
    message: "Konfigurasi terlalu besar (maks 50KB)",
  });

export const resetActionSchema = z.object({
  action: z.literal("reset", { error: "Action harus 'reset'" }),
});

export type UpdateCompanyInput = z.infer<typeof updateCompanySchema>;
export type UpdateAppConfigInput = z.infer<typeof updateAppConfigSchema>;
export type ResetActionInput = z.infer<typeof resetActionSchema>;
