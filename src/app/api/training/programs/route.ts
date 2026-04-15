import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { apiGuard, isGuardError } from "@/lib/api-guard";
import { successResponse } from "@/types/api";

export async function GET(req: NextRequest) {
  const session = await apiGuard({ minRole: "EMPLOYEE" });
  if (isGuardError(session)) return session;

  const status = req.nextUrl.searchParams.get("status");
  const where: Record<string, unknown> = {};
  if (status) where.status = status;

  const programs = await prisma.trainingProgram.findMany({
    where,
    orderBy: { startDate: "desc" },
    include: {
      createdBy: { select: { id: true, firstName: true, lastName: true } },
      _count: { select: { participants: true } },
    },
  });

  return NextResponse.json(successResponse(programs));
}
