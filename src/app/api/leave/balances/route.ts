import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { apiGuard, isGuardError } from "@/lib/api-guard";
import { successResponse } from "@/types/api";
import { hasMinRole } from "@/lib/utils/permissions";

export async function GET(req: NextRequest) {
  const session = await apiGuard();
  if (isGuardError(session)) return session;

  const employeeId = req.nextUrl.searchParams.get("employeeId");
  const year = parseInt(req.nextUrl.searchParams.get("year") ?? String(new Date().getFullYear()));

  const isManagerUp = hasMinRole(session.user.role, "MANAGER");

  // If no employeeId and user is MANAGER+, return all balances
  // If no employeeId and user is EMPLOYEE, return own balances
  const effectiveEmployeeId = employeeId
    ? employeeId
    : isManagerUp
      ? undefined
      : session.user.employeeId ?? undefined;

  const where = {
    year,
    ...(effectiveEmployeeId && { employeeId: effectiveEmployeeId }),
  };

  const balances = await prisma.leaveBalance.findMany({
    where,
    include: {
      employee: { select: { id: true, firstName: true, lastName: true, employeeNumber: true } },
      leaveType: { select: { id: true, name: true, code: true, defaultQuota: true } },
    },
    orderBy: [{ employee: { firstName: "asc" } }, { leaveType: { name: "asc" } }],
  });

  return NextResponse.json(successResponse(balances));
}
