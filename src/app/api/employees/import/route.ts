import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { apiGuard, isGuardError } from "@/lib/api-guard";
import { successResponse, errorResponse } from "@/types/api";
import { parseCSV } from "@/lib/utils/csv";
import { createEmployeeSchema } from "@/lib/validators/employee";

type RowResult = {
  row: number;
  employeeNumber?: string;
  name?: string;
  status: "created" | "skipped" | "error";
  message?: string;
};

function normalizeEnum(v: string, allowed: readonly string[], fallback?: string): string | undefined {
  const up = v.trim().toUpperCase();
  if (allowed.includes(up)) return up;
  if (!v.trim()) return fallback;
  return undefined;
}

async function nextEmployeeNumber(): Promise<string> {
  const latest = await prisma.employee.findFirst({
    where: { employeeNumber: { startsWith: "EMP-" } },
    orderBy: { employeeNumber: "desc" },
    select: { employeeNumber: true },
  });
  const match = latest?.employeeNumber.match(/EMP-(\d+)/);
  const next = (match ? parseInt(match[1], 10) : 0) + 1;
  return `EMP-${String(next).padStart(4, "0")}`;
}

export async function POST(req: NextRequest) {
  const session = await apiGuard({ minRole: "HR_ADMIN" });
  if (isGuardError(session)) return session;

  const body = await req.json();
  const csvText = typeof body?.csv === "string" ? body.csv : "";
  if (!csvText.trim()) {
    return NextResponse.json(errorResponse("File CSV kosong"), { status: 400 });
  }

  let rows: Array<Record<string, string>>;
  try {
    rows = parseCSV(csvText);
  } catch {
    return NextResponse.json(errorResponse("Format CSV tidak valid"), { status: 400 });
  }

  if (rows.length === 0) {
    return NextResponse.json(errorResponse("Tidak ada baris data di CSV"), { status: 400 });
  }

  const [departments, positions] = await Promise.all([
    prisma.department.findMany({ select: { id: true, code: true } }),
    prisma.position.findMany({ select: { id: true, code: true, departmentId: true } }),
  ]);
  const deptByCode = new Map(departments.map((d) => [d.code.toUpperCase(), d]));
  const posByCode = new Map(positions.map((p) => [p.code.toUpperCase(), p]));

  const results: RowResult[] = [];
  let created = 0;
  let errors = 0;

  for (let i = 0; i < rows.length; i++) {
    const r = rows[i];
    const lineNum = i + 2;

    try {
      if (!r.firstName?.trim() || !r.lastName?.trim() || !r.email?.trim() || !r.nik?.trim()) {
        results.push({ row: lineNum, status: "error", message: "firstName/lastName/email/nik wajib diisi" });
        errors += 1;
        continue;
      }

      const deptCode = r.departmentCode?.trim().toUpperCase();
      const posCode = r.positionCode?.trim().toUpperCase();
      const dept = deptCode ? deptByCode.get(deptCode) : undefined;
      const pos = posCode ? posByCode.get(posCode) : undefined;
      if (!dept) {
        results.push({ row: lineNum, status: "error", message: `Departemen '${deptCode ?? ""}' tidak ditemukan` });
        errors += 1;
        continue;
      }
      if (!pos) {
        results.push({ row: lineNum, status: "error", message: `Jabatan '${posCode ?? ""}' tidak ditemukan` });
        errors += 1;
        continue;
      }
      if (pos.departmentId !== dept.id) {
        results.push({ row: lineNum, status: "error", message: `Jabatan '${posCode}' tidak milik departemen '${deptCode}'` });
        errors += 1;
        continue;
      }

      let managerId: string | undefined;
      if (r.managerEmployeeNumber?.trim()) {
        const manager = await prisma.employee.findUnique({
          where: { employeeNumber: r.managerEmployeeNumber.trim() },
          select: { id: true },
        });
        if (!manager) {
          results.push({ row: lineNum, status: "error", message: `Manager '${r.managerEmployeeNumber}' tidak ditemukan` });
          errors += 1;
          continue;
        }
        managerId = manager.id;
      }

      const existing = await prisma.employee.findFirst({
        where: {
          OR: [
            { email: r.email.trim() },
            { nik: r.nik.trim() },
            ...(r.employeeNumber?.trim() ? [{ employeeNumber: r.employeeNumber.trim() }] : []),
          ],
        },
        select: { id: true, employeeNumber: true, email: true, nik: true },
      });

      if (existing) {
        const field =
          existing.employeeNumber === r.employeeNumber?.trim()
            ? "nomor karyawan"
            : existing.email === r.email.trim()
              ? "email"
              : "NIK";
        results.push({
          row: lineNum,
          employeeNumber: r.employeeNumber,
          status: "skipped",
          message: `${field} sudah terdaftar`,
        });
        continue;
      }

      const payload = {
        employeeNumber: r.employeeNumber?.trim() || (await nextEmployeeNumber()),
        firstName: r.firstName.trim(),
        lastName: r.lastName.trim(),
        email: r.email.trim(),
        phone: r.phone?.trim() || undefined,
        gender: normalizeEnum(r.gender ?? "", ["MALE", "FEMALE"]) as "MALE" | "FEMALE" | undefined,
        dateOfBirth: r.dateOfBirth?.trim() || "",
        placeOfBirth: r.placeOfBirth?.trim() || "",
        religion: normalizeEnum(r.religion ?? "", [
          "ISLAM",
          "KRISTEN",
          "KATOLIK",
          "HINDU",
          "BUDDHA",
          "KONGHUCU",
          "LAINNYA",
        ]) as "ISLAM" | "KRISTEN" | "KATOLIK" | "HINDU" | "BUDDHA" | "KONGHUCU" | "LAINNYA" | undefined,
        maritalStatus: normalizeEnum(r.maritalStatus ?? "", ["SINGLE", "MARRIED", "DIVORCED", "WIDOWED"]) as
          | "SINGLE"
          | "MARRIED"
          | "DIVORCED"
          | "WIDOWED"
          | undefined,
        dependents: r.dependents ? Number(r.dependents) : 0,
        nik: r.nik.trim(),
        npwp: r.npwp?.trim() || undefined,
        bpjsKesNumber: r.bpjsKesNumber?.trim() || undefined,
        bpjsTkNumber: r.bpjsTkNumber?.trim() || undefined,
        bankName: r.bankName?.trim() || undefined,
        bankAccountNo: r.bankAccountNo?.trim() || undefined,
        bankAccountName: r.bankAccountName?.trim() || undefined,
        address: r.address?.trim() || undefined,
        city: r.city?.trim() || undefined,
        province: r.province?.trim() || undefined,
        postalCode: r.postalCode?.trim() || undefined,
        emergencyName: r.emergencyName?.trim() || undefined,
        emergencyPhone: r.emergencyPhone?.trim() || undefined,
        emergencyRelation: r.emergencyRelation?.trim() || undefined,
        departmentId: dept.id,
        positionId: pos.id,
        managerId: managerId ?? null,
        status: (normalizeEnum(r.status ?? "", [
          "ACTIVE",
          "PROBATION",
          "RESIGNED",
          "TERMINATED",
          "RETIRED",
        ]) ?? "ACTIVE") as "ACTIVE" | "PROBATION" | "RESIGNED" | "TERMINATED" | "RETIRED",
        type: normalizeEnum(r.type ?? "", ["PERMANENT", "CONTRACT", "PROBATION", "INTERNSHIP"]) as
          | "PERMANENT"
          | "CONTRACT"
          | "PROBATION"
          | "INTERNSHIP"
          | undefined,
        joinDate: r.joinDate?.trim() || "",
        endDate: r.endDate?.trim() || null,
        ptkpStatus: normalizeEnum(r.ptkpStatus ?? "", [
          "TK0",
          "TK1",
          "TK2",
          "TK3",
          "K0",
          "K1",
          "K2",
          "K3",
          "KI0",
          "KI1",
          "KI2",
          "KI3",
        ]) as
          | "TK0"
          | "TK1"
          | "TK2"
          | "TK3"
          | "K0"
          | "K1"
          | "K2"
          | "K3"
          | "KI0"
          | "KI1"
          | "KI2"
          | "KI3"
          | undefined,
        taxMethod: (normalizeEnum(r.taxMethod ?? "", ["GROSS", "GROSS_UP", "NETT"]) ?? "GROSS") as
          | "GROSS"
          | "GROSS_UP"
          | "NETT",
      };

      const parsed = createEmployeeSchema.safeParse(payload);
      if (!parsed.success) {
        results.push({
          row: lineNum,
          employeeNumber: payload.employeeNumber,
          status: "error",
          message: parsed.error.issues[0].message,
        });
        errors += 1;
        continue;
      }

      const employeeNumber = parsed.data.employeeNumber || payload.employeeNumber;
      await prisma.employee.create({
        data: {
          ...parsed.data,
          employeeNumber,
          dateOfBirth: new Date(parsed.data.dateOfBirth),
          joinDate: new Date(parsed.data.joinDate),
          endDate: parsed.data.endDate ? new Date(parsed.data.endDate) : undefined,
        },
      });
      created += 1;
      results.push({
        row: lineNum,
        employeeNumber,
        name: `${parsed.data.firstName} ${parsed.data.lastName}`,
        status: "created",
      });
    } catch (err: unknown) {
      errors += 1;
      results.push({
        row: lineNum,
        status: "error",
        message: err instanceof Error ? err.message : "Unknown error",
      });
    }
  }

  return NextResponse.json(
    successResponse({
      total: rows.length,
      created,
      skipped: results.filter((r) => r.status === "skipped").length,
      errors,
      results,
    }),
  );
}
