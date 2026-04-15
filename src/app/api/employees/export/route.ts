import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { apiGuard, isGuardError } from "@/lib/api-guard";
import { buildXlsx, type XlsxColumn } from "@/lib/utils/xlsx";

const COLUMNS: XlsxColumn[] = [
  { key: "namaLengkap", header: "namaLengkap", width: 28 },
  { key: "employeeNumber", header: "employeeNumber", width: 14, type: "text" },
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

function toYmd(d: Date | null | undefined): string {
  if (!d) return "";
  return d.toISOString().split("T")[0];
}

export async function GET() {
  const session = await apiGuard({ minRole: "HR_ADMIN" });
  if (isGuardError(session)) return session;

  const employees = await prisma.employee.findMany({
    where: { isDeleted: false },
    include: {
      department: { select: { code: true } },
      position: { select: { code: true } },
      manager: { select: { employeeNumber: true } },
    },
    orderBy: { employeeNumber: "asc" },
  });

  const rows = employees.map((e) => ({
    namaLengkap: `${e.firstName} ${e.lastName}`.trim(),
    employeeNumber: e.employeeNumber,
    email: e.email,
    phone: e.phone ?? "",
    gender: e.gender,
    dateOfBirth: toYmd(e.dateOfBirth),
    placeOfBirth: e.placeOfBirth,
    religion: e.religion ?? "",
    maritalStatus: e.maritalStatus,
    dependents: e.dependents,
    nik: e.nik,
    npwp: e.npwp ?? "",
    bpjsKesNumber: e.bpjsKesNumber ?? "",
    bpjsTkNumber: e.bpjsTkNumber ?? "",
    bankName: e.bankName ?? "",
    bankAccountNo: e.bankAccountNo ?? "",
    bankAccountName: e.bankAccountName ?? "",
    address: e.address ?? "",
    city: e.city ?? "",
    province: e.province ?? "",
    postalCode: e.postalCode ?? "",
    emergencyName: e.emergencyName ?? "",
    emergencyPhone: e.emergencyPhone ?? "",
    emergencyRelation: e.emergencyRelation ?? "",
    departmentCode: e.department.code,
    positionCode: e.position.code,
    managerEmployeeNumber: e.manager?.employeeNumber ?? "",
    status: e.status,
    type: e.type,
    joinDate: toYmd(e.joinDate),
    endDate: toYmd(e.endDate),
    ptkpStatus: e.ptkpStatus,
    taxMethod: e.taxMethod,
  }));

  const buffer = await buildXlsx(COLUMNS, rows, "Karyawan");
  const filename = `employees-${new Date().toISOString().split("T")[0]}.xlsx`;

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
