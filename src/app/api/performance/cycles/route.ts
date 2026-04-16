import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { apiGuard, isGuardError } from "@/lib/api-guard";
import { successResponse } from "@/types/api";

export async function GET() {
  const session = await apiGuard({ minRole: "EMPLOYEE" });
  if (isGuardError(session)) return session;

  const cycles = await prisma.reviewCycle.findMany({
    orderBy: { startDate: "desc" },
    include: {
      _count: { select: { reviews: true } },
    },
  });

  return NextResponse.json(successResponse(cycles));
}
