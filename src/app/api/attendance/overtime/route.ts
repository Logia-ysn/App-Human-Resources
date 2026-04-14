import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { apiGuard, isGuardError } from "@/lib/api-guard";
import { successResponse, errorResponse } from "@/types/api";
import { overtimeRequestSchema } from "@/lib/validators/attendance";
import { hasMinRole } from "@/lib/utils/permissions";

const overtimeQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  employeeId: z.string().optional(),
  status: z.enum(["PENDING", "APPROVED", "REJECTED"]).optional(),
});

export async function GET(req: NextRequest) {
  const session = await apiGuard();
  if (isGuardError(session)) return session;

  const params = Object.fromEntries(req.nextUrl.searchParams);
  const parsed = overtimeQuerySchema.safeParse(params);
  if (!parsed.success) {
    return NextResponse.json(errorResponse("Parameter tidak valid"), { status: 400 });
  }

  const { page, limit, employeeId, status } = parsed.data;
  const skip = (page - 1) * limit;

  const isManagerUp = hasMinRole(session.user.role, "MANAGER");
  const effectiveEmployeeId = isManagerUp
    ? employeeId ?? undefined
    : session.user.employeeId ?? undefined;

  const where = {
    ...(effectiveEmployeeId && { employeeId: effectiveEmployeeId }),
    ...(status && { status: parsed.data.status }),
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
