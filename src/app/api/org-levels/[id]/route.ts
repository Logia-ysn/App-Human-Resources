import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { apiGuard, isGuardError } from "@/lib/api-guard";
import { successResponse, errorResponse } from "@/types/api";
import { updateOrgLevelSchema } from "@/lib/validators/org-level";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(req: NextRequest, { params }: Params) {
  const session = await apiGuard({ minRole: "SUPER_ADMIN" });
  if (isGuardError(session)) return session;

  const { id } = await params;
  const body = await req.json();
  const parsed = updateOrgLevelSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(errorResponse(parsed.error.issues[0].message), { status: 400 });
  }

  const existing = await prisma.orgLevel.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json(errorResponse("Level tidak ditemukan"), { status: 404 });
  }

  if (parsed.data.code && parsed.data.code !== existing.code) {
    const dup = await prisma.orgLevel.findUnique({ where: { code: parsed.data.code } });
    if (dup) {
      return NextResponse.json(errorResponse("Kode level sudah digunakan"), { status: 409 });
    }
  }

  if (parsed.data.rank !== undefined && parsed.data.rank !== existing.rank) {
    const dup = await prisma.orgLevel.findUnique({ where: { rank: parsed.data.rank } });
    if (dup) {
      return NextResponse.json(errorResponse(`Rank ${parsed.data.rank} sudah digunakan oleh "${dup.name}"`), { status: 409 });
    }
  }

  const level = await prisma.orgLevel.update({
    where: { id },
    data: parsed.data,
    include: { _count: { select: { positions: true } } },
  });

  return NextResponse.json(successResponse(level));
}

export async function DELETE(req: NextRequest, { params }: Params) {
  const session = await apiGuard({ minRole: "SUPER_ADMIN" });
  if (isGuardError(session)) return session;

  const { id } = await params;

  const existing = await prisma.orgLevel.findUnique({
    where: { id },
    include: { _count: { select: { positions: true } } },
  });
  if (!existing) {
    return NextResponse.json(errorResponse("Level tidak ditemukan"), { status: 404 });
  }

  if (existing._count.positions > 0) {
    return NextResponse.json(
      errorResponse(`Tidak bisa hapus — masih digunakan oleh ${existing._count.positions} jabatan`),
      { status: 409 },
    );
  }

  await prisma.orgLevel.delete({ where: { id } });

  return NextResponse.json(successResponse({ id }));
}
