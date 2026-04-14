import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { apiGuard, isGuardError } from "@/lib/api-guard";
import { successResponse, errorResponse } from "@/types/api";
import { hasMinRole } from "@/lib/utils/permissions";

export async function GET(req: NextRequest) {
  const session = await apiGuard();
  if (isGuardError(session)) return session;

  const isManagerUp = hasMinRole(session.user.role, "MANAGER");
  const requestedEmployeeId = req.nextUrl.searchParams.get("employeeId");

  let employeeId: string | null;
  if (isManagerUp) {
    // MANAGER+ may query any employeeId; fall back to their own
    employeeId = requestedEmployeeId ?? session.user.employeeId;
  } else {
    // Non-MANAGER: always use own employeeId; reject attempts to access others
    if (requestedEmployeeId && requestedEmployeeId !== session.user.employeeId) {
      return NextResponse.json(errorResponse("Akses ditolak"), { status: 403 });
    }
    employeeId = session.user.employeeId;
  }

  if (!employeeId) {
    return NextResponse.json(errorResponse("employeeId wajib diisi"), { status: 400 });
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const attendance = await prisma.attendance.findFirst({
    where: {
      employeeId,
      date: today,
    },
    include: {
      employee: { select: { id: true, firstName: true, lastName: true, employeeNumber: true } },
    },
  });

  return NextResponse.json(successResponse(attendance));
}
