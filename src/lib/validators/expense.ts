import { z } from "zod";

const expenseItemSchema = z.object({
  description: z.string().min(1, "Deskripsi item wajib diisi"),
  amount: z.number().positive("Jumlah harus lebih dari 0"),
  category: z.enum(["TRANSPORT", "MAKAN", "AKOMODASI", "SUPPLIES", "LAINNYA"]),
  date: z.string().min(1, "Tanggal item wajib diisi"),
  receiptUrl: z.string().nullable().optional(),
});

export const createExpenseClaimSchema = z.object({
  title: z.string().min(1, "Judul klaim wajib diisi").max(200),
  items: z
    .array(expenseItemSchema)
    .min(1, "Minimal satu item pengeluaran"),
});

export type CreateExpenseClaimInput = z.infer<typeof createExpenseClaimSchema>;
