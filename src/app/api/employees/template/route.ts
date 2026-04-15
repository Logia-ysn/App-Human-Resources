import { NextResponse } from "next/server";
import { apiGuard, isGuardError } from "@/lib/api-guard";
import { buildXlsx, type XlsxColumn } from "@/lib/utils/xlsx";

const COLUMNS: XlsxColumn[] = [
  { key: "employeeNumber", header: "employeeNumber", width: 14, type: "text" },
  { key: "firstName", header: "firstName", width: 16 },
  { key: "lastName", header: "lastName", width: 16 },
  { key: "email", header: "email", width: 28 },
  { key: "phone", header: "phone", width: 16, type: "text" },
  { key: "gender", header: "gender", width: 10 },
  { key: "dateOfBirth", header: "dateOfBirth", width: 14, type: "date" },
  { key: "placeOfBirth", header: "placeOfBirth", width: 18 },
  { key: "religion", header: "religion", width: 12 },
  { key: "maritalStatus", header: "maritalStatus", width: 14 },
  { key: "dependents", header: "dependents", width: 10, type: "number" },
  { key: "nik", header: "nik", width: 20, type: "text" },
  { key: "npwp", header: "npwp", width: 22, type: "text" },
  { key: "bpjsKesNumber", header: "bpjsKesNumber", width: 18, type: "text" },
  { key: "bpjsTkNumber", header: "bpjsTkNumber", width: 18, type: "text" },
  { key: "bankName", header: "bankName", width: 14 },
  { key: "bankAccountNo", header: "bankAccountNo", width: 20, type: "text" },
  { key: "bankAccountName", header: "bankAccountName", width: 22 },
  { key: "address", header: "address", width: 32 },
  { key: "city", header: "city", width: 14 },
  { key: "province", header: "province", width: 16 },
  { key: "postalCode", header: "postalCode", width: 12, type: "text" },
  { key: "emergencyName", header: "emergencyName", width: 20 },
  { key: "emergencyPhone", header: "emergencyPhone", width: 16, type: "text" },
  { key: "emergencyRelation", header: "emergencyRelation", width: 14 },
  { key: "departmentCode", header: "departmentCode", width: 14, type: "text" },
  { key: "positionCode", header: "positionCode", width: 14, type: "text" },
  { key: "managerEmployeeNumber", header: "managerEmployeeNumber", width: 18, type: "text" },
  { key: "status", header: "status", width: 12 },
  { key: "type", header: "type", width: 12 },
  { key: "joinDate", header: "joinDate", width: 14, type: "date" },
  { key: "endDate", header: "endDate", width: 14, type: "date" },
  { key: "ptkpStatus", header: "ptkpStatus", width: 10 },
  { key: "taxMethod", header: "taxMethod", width: 12 },
];

const EXAMPLE_ROW = {
  employeeNumber: "",
  firstName: "Budi",
  lastName: "Santoso",
  email: "budi@contoh.com",
  phone: "081234567890",
  gender: "MALE",
  dateOfBirth: "1990-05-15",
  placeOfBirth: "Jakarta",
  religion: "ISLAM",
  maritalStatus: "MARRIED",
  dependents: 2,
  nik: "3171234567890001",
  npwp: "",
  bpjsKesNumber: "",
  bpjsTkNumber: "",
  bankName: "",
  bankAccountNo: "",
  bankAccountName: "",
  address: "",
  city: "Jakarta",
  province: "DKI Jakarta",
  postalCode: "",
  emergencyName: "",
  emergencyPhone: "",
  emergencyRelation: "",
  departmentCode: "IT",
  positionCode: "IT-STAFF",
  managerEmployeeNumber: "",
  status: "ACTIVE",
  type: "PERMANENT",
  joinDate: "2024-01-15",
  endDate: "",
  ptkpStatus: "K2",
  taxMethod: "GROSS",
};

export async function GET() {
  const session = await apiGuard({ minRole: "HR_ADMIN" });
  if (isGuardError(session)) return session;

  const buffer = await buildXlsx(COLUMNS, [EXAMPLE_ROW], "Template");

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="template-employees.xlsx"`,
    },
  });
}
