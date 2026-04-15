import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { apiGuard, isGuardError } from "@/lib/api-guard";
import { successResponse } from "@/types/api";

export async function GET(req: NextRequest) {
  const session = await apiGuard({ minRole: "EMPLOYEE" });
  if (isGuardError(session)) return session;

  const employeeId = req.nextUrl.searchParams.get("employeeId");
  const activeOnly = req.nextUrl.searchParams.get("activeOnly") === "true";

  const where: Record<string, unknown> = {};
  if (employeeId) where.employeeId = employeeId;
  if (activeOnly) where.isActive = true;

  // Non-admin: only own assignments
  if (session.user.role === "EMPLOYEE" && session.user.employeeId) {
    where.employeeId = session.user.employeeId;
  }

  const assignments = await prisma.shiftAssignment.findMany({
    where,
    orderBy: [{ isActive: "desc" }, { startDate: "desc" }],
    include: {
      employee: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          employeeNumber: true,
          department: { select: { name: true } },
        },
      },
      shift: {
        select: {
          id: true,
          name: true,
          startTime: true,
          endTime: true,
          color: true,
        },
      },
    },
  });

  return NextResponse.json(successResponse(assignments));
}
