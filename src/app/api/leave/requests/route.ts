import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { apiGuard, isGuardError } from "@/lib/api-guard";
import { successResponse, errorResponse } from "@/types/api";
import { createLeaveRequestSchema, leaveQuerySchema } from "@/lib/validators/leave";
import { hasMinRole } from "@/lib/utils/permissions";

export async function GET(req: NextRequest) {
  const session = await apiGuard();
  if (isGuardError(session)) return session;

  const params = Object.fromEntries(req.nextUrl.searchParams);
  const parsed = leaveQuerySchema.safeParse(params);
  if (!parsed.success) {
    return NextResponse.json(errorResponse("Parameter tidak valid"), { status: 400 });
  }

  const { page, limit, status, employeeId, leaveTypeId, year } = parsed.data;
  const skip = (page - 1) * limit;

  // Employees can only see their own leave requests
  const isManagerUp = hasMinRole(session.user.role, "MANAGER");
  const effectiveEmployeeId = isManagerUp
    ? employeeId
    : session.user.employeeId ?? undefined;

  const where = {
    ...(effectiveEmployeeId && { employeeId: effectiveEmployeeId }),
    ...(status && { status: status as never }),
    ...(leaveTypeId && { leaveTypeId }),
    ...(year && {
      startDate: {
        gte: new Date(`${year}-01-01`),
        lt: new Date(`${year + 1}-01-01`),
      },
    }),
  };

  const [requests, total] = await Promise.all([
    prisma.leaveRequest.findMany({
      where,
      include: {
        employee: {
          select: {
            id: true, firstName: true, lastName: true, employeeNumber: true,
            department: { select: { id: true, name: true } },
          },
        },
        leaveType: { select: { id: true, name: true, code: true } },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.leaveRequest.count({ where }),
  ]);

  const meta = { total, page, limit, totalPages: Math.ceil(total / limit) };

  return NextResponse.json(
    successResponse({ requests, meta })
  );
}

export async function POST(req: NextRequest) {
  const session = await apiGuard();
  if (isGuardError(session)) return session;

  if (!session.user.employeeId) {
    return NextResponse.json(errorResponse("Akun tidak terhubung dengan data karyawan"), { status: 400 });
  }

  const body = await req.json();
  const parsed = createLeaveRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(errorResponse(parsed.error.issues[0].message), { status: 400 });
  }

  const data = parsed.data;

  // Check leave balance
  const year = new Date(data.startDate).getFullYear();
  const balance = await prisma.leaveBalance.findFirst({
    where: {
      employeeId: session.user.employeeId,
      leaveTypeId: data.leaveTypeId,
      year,
    },
  });

  if (balance) {
    const available = balance.entitlement + balance.carried - balance.used - balance.pending;
    if (data.totalDays > available) {
      return NextResponse.json(errorResponse(`Sisa cuti tidak cukup (tersedia: ${available} hari)`), { status: 400 });
    }
  }

  const request = await prisma.leaveRequest.create({
    data: {
      employeeId: session.user.employeeId,
      leaveTypeId: data.leaveTypeId,
      startDate: new Date(data.startDate),
      endDate: new Date(data.endDate),
      totalDays: data.totalDays,
      isHalfDay: data.isHalfDay,
      halfDayType: data.halfDayType,
      reason: data.reason,
      delegateToId: data.delegateToId,
    },
    include: {
      employee: { select: { id: true, firstName: true, lastName: true, employeeNumber: true } },
      leaveType: { select: { id: true, name: true, code: true } },
    },
  });

  // Update pending count in balance
  if (balance) {
    await prisma.leaveBalance.update({
      where: { id: balance.id },
      data: { pending: { increment: Math.ceil(data.totalDays) } },
    });
  }

  return NextResponse.json(successResponse(request), { status: 201 });
}
