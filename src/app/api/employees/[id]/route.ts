import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { apiGuard, isGuardError } from "@/lib/api-guard";
import { successResponse, errorResponse } from "@/types/api";
import { updateEmployeeSchema } from "@/lib/validators/employee";
import { recordAudit, getRequestMeta } from "@/lib/audit";
import { hasMinRole } from "@/lib/utils/permissions";

const MANAGER_RESTRICTED_FIELDS = [
  "nik",
  "npwp",
  "bpjsKesNumber",
  "bpjsTkNumber",
  "bankAccountNo",
  "bankAccountName",
  "salaryComponents",
  "basicSalary",
] as const;

type Params = { params: Promise<{ id: string }> };

export async function GET(req: NextRequest, { params }: Params) {
  const session = await apiGuard({ minRole: "MANAGER" });
  if (isGuardError(session)) return session;

  const { id } = await params;

  const employee = await prisma.employee.findFirst({
    where: { id, isDeleted: false },
    include: {
      department: { select: { id: true, name: true, code: true } },
      position: { select: { id: true, name: true, code: true } },
      manager: { select: { id: true, firstName: true, lastName: true } },
      salaryComponents: {
        where: { isCurrent: true },
        include: { component: { select: { id: true, name: true, code: true, type: true } } },
      },
      contracts: { orderBy: { startDate: "desc" }, take: 5 },
      leaveBalances: { where: { year: new Date().getFullYear() } },
    },
  });

  if (!employee) {
    return NextResponse.json(errorResponse("Karyawan tidak ditemukan"), { status: 404 });
  }

  // Filter sensitive PII fields for MANAGER role (HR_ADMIN+ sees everything)
  if (!hasMinRole(session.user.role, "HR_ADMIN")) {
    const filtered = { ...employee } as Record<string, unknown>;
    for (const field of MANAGER_RESTRICTED_FIELDS) {
      delete filtered[field];
    }
    return NextResponse.json(successResponse(filtered));
  }

  return NextResponse.json(successResponse(employee));
}

export async function PATCH(req: NextRequest, { params }: Params) {
  const session = await apiGuard({ minRole: "HR_ADMIN" });
  if (isGuardError(session)) return session;

  const { id } = await params;
  const body = await req.json();
  const parsed = updateEmployeeSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(errorResponse(parsed.error.issues[0].message), { status: 400 });
  }

  const existing = await prisma.employee.findFirst({ where: { id, isDeleted: false } });
  if (!existing) {
    return NextResponse.json(errorResponse("Karyawan tidak ditemukan"), { status: 404 });
  }

  const data = parsed.data;
  const employee = await prisma.employee.update({
    where: { id },
    data: {
      ...data,
      dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : undefined,
      joinDate: data.joinDate ? new Date(data.joinDate) : undefined,
      endDate: data.endDate ? new Date(data.endDate) : undefined,
    },
    include: {
      department: { select: { id: true, name: true, code: true } },
      position: { select: { id: true, name: true, code: true } },
      manager: { select: { id: true, firstName: true, lastName: true } },
    },
  });

  await recordAudit({
    userId: session.user.id,
    action: "UPDATE",
    entityType: "Employee",
    entityId: id,
    oldValues: existing,
    newValues: employee,
    ...getRequestMeta(req.headers),
  });

  return NextResponse.json(successResponse(employee));
}

export async function DELETE(req: NextRequest, { params }: Params) {
  const session = await apiGuard({ minRole: "HR_ADMIN" });
  if (isGuardError(session)) return session;

  const { id } = await params;

  const existing = await prisma.employee.findFirst({ where: { id, isDeleted: false } });
  if (!existing) {
    return NextResponse.json(errorResponse("Karyawan tidak ditemukan"), { status: 404 });
  }

  // Soft delete
  await prisma.employee.update({
    where: { id },
    data: { isDeleted: true, deletedAt: new Date() },
  });

  await recordAudit({
    userId: session.user.id,
    action: "DELETE",
    entityType: "Employee",
    entityId: id,
    oldValues: existing,
    ...getRequestMeta(req.headers),
  });

  return NextResponse.json(successResponse({ id }));
}
