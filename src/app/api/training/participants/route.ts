import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { apiGuard, isGuardError } from "@/lib/api-guard";
import { successResponse } from "@/types/api";

export async function GET(req: NextRequest) {
  const session = await apiGuard({ minRole: "EMPLOYEE" });
  if (isGuardError(session)) return session;

  const employeeId = req.nextUrl.searchParams.get("employeeId");
  const trainingId = req.nextUrl.searchParams.get("trainingId");

  const where: Record<string, unknown> = {};
  if (employeeId) where.employeeId = employeeId;
  if (trainingId) where.trainingId = trainingId;

  if (session.user.role === "EMPLOYEE" && session.user.employeeId) {
    where.employeeId = session.user.employeeId;
  }

  const participants = await prisma.trainingParticipant.findMany({
    where,
    orderBy: { enrolledAt: "desc" },
    include: {
      training: {
        select: {
          id: true,
          title: true,
          category: true,
          method: true,
          startDate: true,
          endDate: true,
          status: true,
        },
      },
      employee: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          employeeNumber: true,
          department: { select: { name: true } },
        },
      },
    },
  });

  return NextResponse.json(successResponse(participants));
}
