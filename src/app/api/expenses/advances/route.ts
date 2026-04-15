import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { apiGuard, isGuardError } from "@/lib/api-guard";
import { successResponse } from "@/types/api";

export async function GET(req: NextRequest) {
  const session = await apiGuard({ minRole: "EMPLOYEE" });
  if (isGuardError(session)) return session;

  const status = req.nextUrl.searchParams.get("status");
  const employeeId = req.nextUrl.searchParams.get("employeeId");

  const where: Record<string, unknown> = {};
  if (status) where.status = status;
  if (employeeId) where.employeeId = employeeId;

  if (session.user.role === "EMPLOYEE" && session.user.employeeId) {
    where.employeeId = session.user.employeeId;
  }

  const advances = await prisma.employeeAdvance.findMany({
    where,
    orderBy: { requestDate: "desc" },
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
      approvedBy: {
        select: { id: true, firstName: true, lastName: true },
      },
    },
  });

  return NextResponse.json(successResponse(advances));
}
