import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { apiGuard, isGuardError } from "@/lib/api-guard";
import { successResponse } from "@/types/api";
import { hasMinRole } from "@/lib/utils/permissions";

const DEFAULT_LIMIT = 50;
const MAX_LIMIT = 200;

export async function GET(req: NextRequest) {
  const session = await apiGuard();
  if (isGuardError(session)) return session;

  const searchParams = req.nextUrl.searchParams;
  const employeeId = searchParams.get("employeeId");
  const year = parseInt(searchParams.get("year") ?? String(new Date().getFullYear()));
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1"));
  const rawLimit = parseInt(searchParams.get("limit") ?? String(DEFAULT_LIMIT));
  const limit = Math.min(Math.max(1, rawLimit), MAX_LIMIT);
  const skip = (page - 1) * limit;

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

  const [balances, total] = await Promise.all([
    prisma.leaveBalance.findMany({
      where,
      include: {
        employee: { select: { id: true, firstName: true, lastName: true, employeeNumber: true } },
        leaveType: { select: { id: true, name: true, code: true, defaultQuota: true } },
      },
      orderBy: [{ employee: { firstName: "asc" } }, { leaveType: { name: "asc" } }],
      skip,
      take: limit,
    }),
    prisma.leaveBalance.count({ where }),
  ]);

  const meta = { total, page, limit, totalPages: Math.ceil(total / limit) };

  return NextResponse.json(successResponse({ balances, meta }));
}
