import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { apiGuard, isGuardError } from "@/lib/api-guard";
import { successResponse, errorResponse } from "@/types/api";
import { overtimeRequestSchema } from "@/lib/validators/attendance";
import { hasMinRole } from "@/lib/utils/permissions";

export async function GET(req: NextRequest) {
  const session = await apiGuard();
  if (isGuardError(session)) return session;

  const employeeId = req.nextUrl.searchParams.get("employeeId");
  const status = req.nextUrl.searchParams.get("status");
  const page = parseInt(req.nextUrl.searchParams.get("page") ?? "1");
  const limit = parseInt(req.nextUrl.searchParams.get("limit") ?? "20");
  const skip = (page - 1) * limit;

  const isManagerUp = hasMinRole(session.user.role, "MANAGER");
  const effectiveEmployeeId = isManagerUp
    ? employeeId ?? undefined
    : session.user.employeeId ?? undefined;

  const where = {
    ...(effectiveEmployeeId && { employeeId: effectiveEmployeeId }),
    ...(status && { status: status as never }),
  };

  const [requests, total] = await Promise.all([
    prisma.overtimeRequest.findMany({
      where,
      include: {
        employee: { select: { id: true, firstName: true, lastName: true, employeeNumber: true } },
        approvedBy: { select: { id: true, firstName: true, lastName: true } },
      },
      orderBy: { date: "desc" },
      skip,
      take: limit,
    }),
    prisma.overtimeRequest.count({ where }),
  ]);

  return NextResponse.json(
    successResponse(
      { requests },
      { total, page, limit, totalPages: Math.ceil(total / limit) }
    )
  );
}

export async function POST(req: NextRequest) {
  const session = await apiGuard();
  if (isGuardError(session)) return session;

  if (!session.user.employeeId) {
    return NextResponse.json(errorResponse("Akun tidak terhubung dengan data karyawan"), { status: 400 });
  }

  const body = await req.json();
  const parsed = overtimeRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(errorResponse(parsed.error.issues[0].message), { status: 400 });
  }

  const overtime = await prisma.overtimeRequest.create({
    data: {
      employeeId: session.user.employeeId,
      date: new Date(parsed.data.date),
      startTime: parsed.data.startTime,
      endTime: parsed.data.endTime,
      plannedMinutes: parsed.data.plannedMinutes,
      reason: parsed.data.reason,
    },
    include: {
      employee: { select: { id: true, firstName: true, lastName: true, employeeNumber: true } },
    },
  });

  return NextResponse.json(successResponse(overtime), { status: 201 });
}
