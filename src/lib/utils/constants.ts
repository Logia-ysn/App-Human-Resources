export const APP_NAME = "HRIS - Human Resource Information System";
export const APP_SHORT_NAME = "HRIS";

export const ITEMS_PER_PAGE = 10;
export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
export const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
export const ALLOWED_DOC_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/png",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

export const GENDER_OPTIONS = [
  { label: "Laki-laki", value: "MALE" },
  { label: "Perempuan", value: "FEMALE" },
] as const;

export const RELIGION_OPTIONS = [
  { label: "Islam", value: "ISLAM" },
  { label: "Kristen", value: "KRISTEN" },
  { label: "Katolik", value: "KATOLIK" },
  { label: "Hindu", value: "HINDU" },
  { label: "Buddha", value: "BUDDHA" },
  { label: "Konghucu", value: "KONGHUCU" },
  { label: "Lainnya", value: "LAINNYA" },
] as const;

export const MARITAL_STATUS_OPTIONS = [
  { label: "Belum Menikah", value: "SINGLE" },
  { label: "Menikah", value: "MARRIED" },
  { label: "Cerai Hidup", value: "DIVORCED" },
  { label: "Cerai Mati", value: "WIDOWED" },
] as const;

export const EMPLOYMENT_STATUS_OPTIONS = [
  { label: "Aktif", value: "ACTIVE" },
  { label: "Probation", value: "PROBATION" },
  { label: "Resign", value: "RESIGNED" },
  { label: "Diberhentikan", value: "TERMINATED" },
  { label: "Pensiun", value: "RETIRED" },
] as const;

export const EMPLOYMENT_TYPE_OPTIONS = [
  { label: "Tetap (PKWTT)", value: "PERMANENT" },
  { label: "Kontrak (PKWT)", value: "CONTRACT" },
  { label: "Probation", value: "PROBATION" },
  { label: "Magang", value: "INTERNSHIP" },
] as const;

export const PTKP_STATUS_OPTIONS = [
  { label: "TK/0 - Belum Kawin, 0 Tanggungan", value: "TK0" },
  { label: "TK/1 - Belum Kawin, 1 Tanggungan", value: "TK1" },
  { label: "TK/2 - Belum Kawin, 2 Tanggungan", value: "TK2" },
  { label: "TK/3 - Belum Kawin, 3 Tanggungan", value: "TK3" },
  { label: "K/0 - Kawin, 0 Tanggungan", value: "K0" },
  { label: "K/1 - Kawin, 1 Tanggungan", value: "K1" },
  { label: "K/2 - Kawin, 2 Tanggungan", value: "K2" },
  { label: "K/3 - Kawin, 3 Tanggungan", value: "K3" },
  { label: "K/I/0 - Kawin, Penghasilan Istri Digabung, 0", value: "KI0" },
  { label: "K/I/1 - Kawin, Penghasilan Istri Digabung, 1", value: "KI1" },
  { label: "K/I/2 - Kawin, Penghasilan Istri Digabung, 2", value: "KI2" },
  { label: "K/I/3 - Kawin, Penghasilan Istri Digabung, 3", value: "KI3" },
] as const;

export const POSITION_LEVEL_OPTIONS = [
  { label: "Staff", value: "STAFF" },
  { label: "Supervisor", value: "SUPERVISOR" },
  { label: "Manager", value: "MANAGER" },
  { label: "Director", value: "DIRECTOR" },
] as const;

export const ROLE_OPTIONS = [
  { label: "Super Admin", value: "SUPER_ADMIN" },
  { label: "HR Admin", value: "HR_ADMIN" },
  { label: "Manager", value: "MANAGER" },
  { label: "Karyawan", value: "EMPLOYEE" },
] as const;
