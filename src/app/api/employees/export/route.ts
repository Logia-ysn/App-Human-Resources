import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { apiGuard, isGuardError } from "@/lib/api-guard";
import { formatCSV } from "@/lib/utils/csv";

const HEADERS = [
  "employeeNumber",
  "firstName",
  "lastName",
  "email",
  "phone",
  "gender",
  "dateOfBirth",
  "placeOfBirth",
  "religion",
  "maritalStatus",
  "dependents",
  "nik",
  "npwp",
  "bpjsKesNumber",
  "bpjsTkNumber",
  "bankName",
  "bankAccountNo",
  "bankAccountName",
  "address",
  "city",
  "province",
  "postalCode",
  "emergencyName",
  "emergencyPhone",
  "emergencyRelation",
  "departmentCode",
  "positionCode",
  "managerEmployeeNumber",
  "status",
  "type",
  "joinDate",
  "endDate",
  "ptkpStatus",
  "taxMethod",
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
    employeeNumber: e.employeeNumber,
    firstName: e.firstName,
    lastName: e.lastName,
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

  const csv = formatCSV(HEADERS, rows);
  const filename = `employees-${new Date().toISOString().split("T")[0]}.csv`;

  return new NextResponse("\uFEFF" + csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
