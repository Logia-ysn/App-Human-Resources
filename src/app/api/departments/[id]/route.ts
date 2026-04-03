import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { apiGuard, isGuardError } from "@/lib/api-guard";
import { successResponse, errorResponse } from "@/types/api";
import { updateDepartmentSchema } from "@/lib/validators/department";

type Params = { params: Promise<{ id: string }> };

export async function GET(req: NextRequest, { params }: Params) {
  const session = await apiGuard();
  if (isGuardError(session)) return session;

  const { id } = await params;
  const department = await prisma.department.findFirst({
    where: { id, isActive: true },
    include: {
      head: { select: { id: true, firstName: true, lastName: true } },
      parent: { select: { id: true, name: true, code: true } },
      children: { select: { id: true, name: true, code: true } },
      positions: { where: { isActive: true }, select: { id: true, name: true, code: true, level: true } },
      _count: { select: { employees: true, positions: true } },
    },
  });

  if (!department) {
    return NextResponse.json(errorResponse("Departemen tidak ditemukan"), { status: 404 });
  }

  return NextResponse.json(successResponse(department));
}

export async function PATCH(req: NextRequest, { params }: Params) {
  const session = await apiGuard({ minRole: "HR_ADMIN" });
  if (isGuardError(session)) return session;

  const { id } = await params;
  const body = await req.json();
  const parsed = updateDepartmentSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(errorResponse(parsed.error.issues[0].message), { status: 400 });
  }

  const existing = await prisma.department.findFirst({ where: { id, isActive: true } });
  if (!existing) {
    return NextResponse.json(errorResponse("Departemen tidak ditemukan"), { status: 404 });
  }

  if (parsed.data.code && parsed.data.code !== existing.code) {
    const dup = await prisma.department.findUnique({ where: { code: parsed.data.code } });
    if (dup) {
      return NextResponse.json(errorResponse("Kode departemen sudah digunakan"), { status: 409 });
    }
  }

  const department = await prisma.department.update({
    where: { id },
    data: parsed.data,
    include: {
      head: { select: { id: true, firstName: true, lastName: true } },
      _count: { select: { employees: true, positions: true } },
    },
  });

  return NextResponse.json(successResponse(department));
}

export async function DELETE(req: NextRequest, { params }: Params) {
  const session = await apiGuard({ minRole: "HR_ADMIN" });
  if (isGuardError(session)) return session;

  const { id } = await params;

  const dept = await prisma.department.findFirst({
    where: { id, isActive: true },
    include: { _count: { select: { employees: true } } },
  });

  if (!dept) {
    return NextResponse.json(errorResponse("Departemen tidak ditemukan"), { status: 404 });
  }

  if (dept._count.employees > 0) {
    return NextResponse.json(errorResponse("Tidak bisa hapus departemen yang masih memiliki karyawan"), { status: 400 });
  }

  await prisma.department.update({
    where: { id },
    data: { isActive: false },
  });

  return NextResponse.json(successResponse({ id }));
}
