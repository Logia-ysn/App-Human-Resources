import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { apiGuard, isGuardError } from "@/lib/api-guard";
import { successResponse, errorResponse } from "@/types/api";
import { createOrgLevelSchema } from "@/lib/validators/org-level";

export async function GET() {
  const session = await apiGuard();
  if (isGuardError(session)) return session;

  const levels = await prisma.orgLevel.findMany({
    where: { isActive: true },
    orderBy: { rank: "asc" },
    include: { _count: { select: { positions: true } } },
  });

  return NextResponse.json(successResponse(levels));
}

export async function POST(req: NextRequest) {
  const session = await apiGuard({ minRole: "SUPER_ADMIN" });
  if (isGuardError(session)) return session;

  const body = await req.json();
  const parsed = createOrgLevelSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(errorResponse(parsed.error.issues[0].message), { status: 400 });
  }

  const existingCode = await prisma.orgLevel.findUnique({ where: { code: parsed.data.code } });
  if (existingCode) {
    return NextResponse.json(errorResponse("Kode level sudah digunakan"), { status: 409 });
  }

  const existingRank = await prisma.orgLevel.findUnique({ where: { rank: parsed.data.rank } });
  if (existingRank) {
    return NextResponse.json(errorResponse(`Rank ${parsed.data.rank} sudah digunakan oleh "${existingRank.name}"`), { status: 409 });
  }

  const level = await prisma.orgLevel.create({
    data: parsed.data,
    include: { _count: { select: { positions: true } } },
  });

  return NextResponse.json(successResponse(level), { status: 201 });
}
