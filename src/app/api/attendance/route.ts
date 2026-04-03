import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { apiGuard, isGuardError } from "@/lib/api-guard";
import { successResponse, errorResponse } from "@/types/api";
import { attendanceQuerySchema } from "@/lib/validators/attendance";
import { hasMinRole } from "@/lib/utils/permissions";

export async function GET(req: NextRequest) {
  const session = await apiGuard();
  if (isGuardError(session)) return session;

  const params = Object.fromEntries(req.nextUrl.searchParams);
  const parsed = attendanceQuerySchema.safeParse(params);
  if (!parsed.success) {
    return NextResponse.json(errorResponse("Parameter tidak valid"), { status: 400 });
  }

  const { page, limit, employeeId, status, startDate, endDate } = parsed.data;
  const skip = (page - 1) * limit;

  const isManagerUp = hasMinRole(session.user.role, "MANAGER");
  const effectiveEmployeeId = isManagerUp
    ? employeeId
    : session.user.employeeId ?? undefined;

  const where = {
    ...(effectiveEmployeeId && { employeeId: effectiveEmployeeId }),
    ...(status && { status: status as never }),
    ...(startDate && { date: { gte: new Date(startDate) } }),
    ...(endDate && { date: { ...((startDate ? { gte: new Date(startDate) } : {})), lte: new Date(endDate) } }),
  };

  const [records, total] = await Promise.all([
    prisma.attendance.findMany({
      where,
      include: {
        employee: { select: { id: true, firstName: true, lastName: true, employeeNumber: true } },
      },
      orderBy: { date: "desc" },
      skip,
      take: limit,
    }),
    prisma.attendance.count({ where }),
  ]);

  return NextResponse.json(
    successResponse(
      { records },
      { total, page, limit, totalPages: Math.ceil(total / limit) }
    )
  );
}
