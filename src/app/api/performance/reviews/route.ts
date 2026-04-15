import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { apiGuard, isGuardError } from "@/lib/api-guard";
import { successResponse } from "@/types/api";

export async function GET(req: NextRequest) {
  const session = await apiGuard({ minRole: "EMPLOYEE" });
  if (isGuardError(session)) return session;

  const cycleId = req.nextUrl.searchParams.get("cycleId");
  const employeeId = req.nextUrl.searchParams.get("employeeId");

  const where: Record<string, unknown> = {};
  if (cycleId) where.reviewCycleId = cycleId;
  if (employeeId) where.employeeId = employeeId;

  if (session.user.role === "EMPLOYEE" && session.user.employeeId) {
    where.employeeId = session.user.employeeId;
  }

  const reviews = await prisma.performanceReview.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: {
      reviewCycle: { select: { id: true, name: true, type: true } },
      employee: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          employeeNumber: true,
          department: { select: { name: true } },
        },
      },
      reviewer: {
        select: { id: true, firstName: true, lastName: true },
      },
      kpis: true,
    },
  });

  return NextResponse.json(successResponse(reviews));
}
