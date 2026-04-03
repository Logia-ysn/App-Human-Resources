import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { apiGuard, isGuardError } from "@/lib/api-guard";
import { successResponse, errorResponse } from "@/types/api";
import { updatePositionSchema } from "@/lib/validators/position";

type Params = { params: Promise<{ id: string }> };

export async function GET(req: NextRequest, { params }: Params) {
  const session = await apiGuard();
  if (isGuardError(session)) return session;

  const { id } = await params;
  const position = await prisma.position.findFirst({
    where: { id, isActive: true },
    include: {
      department: { select: { id: true, name: true, code: true } },
      _count: { select: { employees: true } },
    },
  });

  if (!position) {
    return NextResponse.json(errorResponse("Jabatan tidak ditemukan"), { status: 404 });
  }

  return NextResponse.json(successResponse(position));
}

export async function PATCH(req: NextRequest, { params }: Params) {
  const session = await apiGuard({ minRole: "HR_ADMIN" });
  if (isGuardError(session)) return session;

  const { id } = await params;
  const body = await req.json();
  const parsed = updatePositionSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(errorResponse(parsed.error.issues[0].message), { status: 400 });
  }

  const existing = await prisma.position.findFirst({ where: { id, isActive: true } });
  if (!existing) {
    return NextResponse.json(errorResponse("Jabatan tidak ditemukan"), { status: 404 });
  }

  if (parsed.data.code && parsed.data.code !== existing.code) {
    const dup = await prisma.position.findUnique({ where: { code: parsed.data.code } });
    if (dup) {
      return NextResponse.json(errorResponse("Kode jabatan sudah digunakan"), { status: 409 });
    }
  }

  const position = await prisma.position.update({
    where: { id },
    data: parsed.data,
    include: {
      department: { select: { id: true, name: true, code: true } },
      _count: { select: { employees: true } },
    },
  });

  return NextResponse.json(successResponse(position));
}

export async function DELETE(req: NextRequest, { params }: Params) {
  const session = await apiGuard({ minRole: "HR_ADMIN" });
  if (isGuardError(session)) return session;

  const { id } = await params;
  const pos = await prisma.position.findFirst({
    where: { id, isActive: true },
    include: { _count: { select: { employees: true } } },
  });

  if (!pos) {
    return NextResponse.json(errorResponse("Jabatan tidak ditemukan"), { status: 404 });
  }

  if (pos._count.employees > 0) {
    return NextResponse.json(errorResponse("Tidak bisa hapus jabatan yang masih memiliki karyawan"), { status: 400 });
  }

  await prisma.position.update({ where: { id }, data: { isActive: false } });

  return NextResponse.json(successResponse({ id }));
}
