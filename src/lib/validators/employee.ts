import { z } from "zod";

export const createEmployeeSchema = z.object({
  employeeNumber: z.string().min(1, "Nomor karyawan wajib diisi"),
  firstName: z.string().min(1, "Nama depan wajib diisi"),
  lastName: z.string().min(1, "Nama belakang wajib diisi"),
  email: z.string().email("Email tidak valid"),
  phone: z.string().optional(),
  gender: z.enum(["MALE", "FEMALE"]),
  dateOfBirth: z.string().min(1, "Tanggal lahir wajib diisi"),
  placeOfBirth: z.string().min(1, "Tempat lahir wajib diisi"),
  religion: z
    .preprocess(
      (v) => (v === "" || v === null ? undefined : v),
      z.enum(["ISLAM", "KRISTEN", "KATOLIK", "HINDU", "BUDDHA", "KONGHUCU", "LAINNYA"]).optional(),
    ),
  maritalStatus: z.enum(["SINGLE", "MARRIED", "DIVORCED", "WIDOWED"]),
  dependents: z.number().int().min(0).default(0),
  nik: z.string().min(16, "NIK harus 16 digit").max(16),
  npwp: z.string().optional(),
  bpjsKesNumber: z.string().optional(),
  bpjsTkNumber: z.string().optional(),
  bankName: z.string().optional(),
  bankAccountNo: z.string().optional(),
  bankAccountName: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  province: z.string().optional(),
  postalCode: z.string().optional(),
  emergencyName: z.string().optional(),
  emergencyPhone: z.string().optional(),
  emergencyRelation: z.string().optional(),
  departmentId: z.string().min(1, "Departemen wajib dipilih"),
  positionId: z.string().min(1, "Jabatan wajib dipilih"),
  managerId: z.string().nullable().optional(),
  status: z.enum(["ACTIVE", "PROBATION", "RESIGNED", "TERMINATED", "RETIRED"]).default("ACTIVE"),
  type: z.enum(["PERMANENT", "CONTRACT", "PROBATION", "INTERNSHIP"]),
  joinDate: z.string().min(1, "Tanggal masuk wajib diisi"),
  endDate: z.string().nullable().optional(),
  ptkpStatus: z.enum(["TK0", "TK1", "TK2", "TK3", "K0", "K1", "K2", "K3", "KI0", "KI1", "KI2", "KI3"]),
  taxMethod: z.enum(["GROSS", "GROSS_UP", "NETT"]).default("GROSS"),
});

export const updateEmployeeSchema = createEmployeeSchema.partial();

export const employeeQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().optional(),
  departmentId: z.string().optional(),
  status: z.enum(["ACTIVE", "PROBATION", "RESIGNED", "TERMINATED", "RETIRED"]).optional(),
  type: z.enum(["PERMANENT", "CONTRACT", "PROBATION", "INTERNSHIP"]).optional(),
  sort: z.enum(["employeeNumber", "firstName", "lastName", "joinDate", "status", "createdAt"]).default("createdAt"),
  order: z.enum(["asc", "desc"]).default("asc"),
});

export type CreateEmployeeInput = z.infer<typeof createEmployeeSchema>;
export type UpdateEmployeeInput = z.infer<typeof updateEmployeeSchema>;
export type EmployeeQuery = z.infer<typeof employeeQuerySchema>;
