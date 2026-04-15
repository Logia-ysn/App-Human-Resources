import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { apiGuard, isGuardError } from "@/lib/api-guard";
import { successResponse, errorResponse } from "@/types/api";
import { parseCSV } from "@/lib/utils/csv";
import { parseXlsx } from "@/lib/utils/xlsx";
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

function splitFullName(full: string): { firstName: string; lastName: string } {
  const parts = full.trim().split(/\s+/);
  if (parts.length === 0 || !parts[0]) return { firstName: "", lastName: "" };
  if (parts.length === 1) return { firstName: parts[0], lastName: "-" };
  return { firstName: parts[0], lastName: parts.slice(1).join(" ") };
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

function genPlaceholderNik(empNumber: string): string {
  const digits = empNumber.replace(/\D/g, "").padStart(8, "0").slice(-8);
  const rand = Math.floor(Math.random() * 1e8)
    .toString()
    .padStart(8, "0");
  return `9${digits}${rand}`.slice(0, 16);
}

function todayYmd(): string {
  return new Date().toISOString().split("T")[0];
}

export async function POST(req: NextRequest) {
  const session = await apiGuard({ minRole: "HR_ADMIN" });
  if (isGuardError(session)) return session;

  const body = await req.json();
  const csvText = typeof body?.csv === "string" ? body.csv : "";
  const xlsxBase64 = typeof body?.xlsxBase64 === "string" ? body.xlsxBase64 : "";

  if (!csvText.trim() && !xlsxBase64.trim()) {
    return NextResponse.json(errorResponse("File kosong"), { status: 400 });
  }

  let rows: Array<Record<string, string>>;
  try {
    if (xlsxBase64.trim()) {
      const buf = Buffer.from(xlsxBase64, "base64");
      rows = await parseXlsx(buf);
    } else {
      rows = parseCSV(csvText);
    }
  } catch {
    return NextResponse.json(errorResponse("Format file tidak valid"), { status: 400 });
  }

  if (rows.length === 0) {
    return NextResponse.json(errorResponse("Tidak ada baris data di file"), { status: 400 });
  }

  const [departments, positions] = await Promise.all([
    prisma.department.findMany({
      where: { isActive: true },
      select: { id: true, code: true },
      orderBy: { code: "asc" },
    }),
    prisma.position.findMany({
      where: { isActive: true },
      select: { id: true, code: true, departmentId: true },
      orderBy: { code: "asc" },
    }),
  ]);
  const deptByCode = new Map(departments.map((d) => [d.code.toUpperCase(), d]));
  const posByCode = new Map(positions.map((p) => [p.code.toUpperCase(), p]));

  const defaultDept = departments[0];
  const defaultPosForDept = new Map<string, (typeof positions)[number]>();
  for (const p of positions) {
    if (!defaultPosForDept.has(p.departmentId)) {
      defaultPosForDept.set(p.departmentId, p);
    }
  }

  const results: RowResult[] = [];
  let created = 0;
  let errors = 0;

  for (let i = 0; i < rows.length; i++) {
    const r = rows[i];
    const lineNum = i + 2;

    try {
      const fullName = r.namaLengkap?.trim() || r.fullName?.trim() || "";
      let firstName = r.firstName?.trim() || "";
      let lastName = r.lastName?.trim() || "";
      if (fullName) {
        const split = splitFullName(fullName);
        firstName = firstName || split.firstName;
        lastName = lastName || split.lastName;
      }
      if (!firstName) {
        results.push({ row: lineNum, status: "error", message: "Nama lengkap wajib diisi" });
        errors += 1;
        continue;
      }
      if (!lastName) lastName = "-";

      const deptCode = r.departmentCode?.trim().toUpperCase();
      const posCode = r.positionCode?.trim().toUpperCase();
      let dept = deptCode ? deptByCode.get(deptCode) : undefined;
      let pos = posCode ? posByCode.get(posCode) : undefined;

      if (!dept && !deptCode) dept = defaultDept;
      if (!dept) {
        results.push({ row: lineNum, status: "error", message: `Departemen '${deptCode}' tidak ditemukan` });
        errors += 1;
        continue;
      }
      if (!pos && !posCode) pos = defaultPosForDept.get(dept.id);
      if (!pos) {
        results.push({
          row: lineNum,
          status: "error",
          message: posCode
            ? `Jabatan '${posCode}' tidak ditemukan`
            : `Departemen '${dept.code}' belum punya jabatan aktif`,
        });
        errors += 1;
        continue;
      }
      if (pos.departmentId !== dept.id) {
        results.push({
          row: lineNum,
          status: "error",
          message: `Jabatan '${posCode}' tidak milik departemen '${deptCode ?? dept.code}'`,
        });
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

      const employeeNumber = r.employeeNumber?.trim() || (await nextEmployeeNumber());
      const email = r.email?.trim() || `${employeeNumber.toLowerCase()}@noemail.local`;
      const nik = r.nik?.trim() || genPlaceholderNik(employeeNumber);

      const existing = await prisma.employee.findFirst({
        where: {
          OR: [
            { email },
            { nik },
            ...(r.employeeNumber?.trim() ? [{ employeeNumber: r.employeeNumber.trim() }] : []),
          ],
        },
        select: { id: true, employeeNumber: true, email: true, nik: true },
      });

      if (existing) {
        const field =
          existing.employeeNumber === r.employeeNumber?.trim()
            ? "nomor karyawan"
            : existing.email === email
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
        employeeNumber,
        firstName,
        lastName,
        email,
        phone: r.phone?.trim() || undefined,
        gender: (normalizeEnum(r.gender ?? "", ["MALE", "FEMALE"]) ?? "MALE") as "MALE" | "FEMALE",
        dateOfBirth: r.dateOfBirth?.trim() || "1970-01-01",
        placeOfBirth: r.placeOfBirth?.trim() || "-",
        religion: normalizeEnum(r.religion ?? "", [
          "ISLAM",
          "KRISTEN",
          "KATOLIK",
          "HINDU",
          "BUDDHA",
          "KONGHUCU",
          "LAINNYA",
        ]) as "ISLAM" | "KRISTEN" | "KATOLIK" | "HINDU" | "BUDDHA" | "KONGHUCU" | "LAINNYA" | undefined,
        maritalStatus: (normalizeEnum(r.maritalStatus ?? "", ["SINGLE", "MARRIED", "DIVORCED", "WIDOWED"]) ??
          "SINGLE") as "SINGLE" | "MARRIED" | "DIVORCED" | "WIDOWED",
        dependents: r.dependents ? Number(r.dependents) : 0,
        nik,
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
        type: (normalizeEnum(r.type ?? "", ["PERMANENT", "CONTRACT", "PROBATION", "INTERNSHIP"]) ?? "PERMANENT") as
          | "PERMANENT"
          | "CONTRACT"
          | "PROBATION"
          | "INTERNSHIP",
        joinDate: r.joinDate?.trim() || todayYmd(),
        endDate: r.endDate?.trim() || null,
        ptkpStatus: (normalizeEnum(r.ptkpStatus ?? "", [
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
        ]) ?? "TK0") as
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
          | "KI3",
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
