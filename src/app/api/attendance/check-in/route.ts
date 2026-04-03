import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { apiGuard, isGuardError } from "@/lib/api-guard";
import { successResponse, errorResponse } from "@/types/api";
import { checkInSchema } from "@/lib/validators/attendance";

export async function POST(req: NextRequest) {
  const session = await apiGuard();
  if (isGuardError(session)) return session;

  const body = await req.json();
  const parsed = checkInSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(errorResponse(parsed.error.issues[0].message), { status: 400 });
  }

  const { employeeId, note, latitude, longitude } = parsed.data;

  // Only allow self check-in or admin override
  if (employeeId !== session.user.employeeId && session.user.role === "EMPLOYEE") {
    return NextResponse.json(errorResponse("Tidak memiliki akses"), { status: 403 });
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const existing = await prisma.attendance.findFirst({
    where: { employeeId, date: today },
  });

  if (existing) {
    return NextResponse.json(errorResponse("Sudah melakukan check-in hari ini"), { status: 409 });
  }

  // Calculate late minutes (based on 08:00 default)
  const now = new Date();
  const scheduleStart = new Date(today);
  scheduleStart.setHours(8, 0, 0, 0);
  const lateMinutes = now > scheduleStart
    ? Math.floor((now.getTime() - scheduleStart.getTime()) / 60000)
    : 0;

  const status = lateMinutes > 15 ? "LATE" : "PRESENT";

  const attendance = await prisma.attendance.create({
    data: {
      employeeId,
      date: today,
      checkIn: now,
      lateMinutes,
      status,
      checkInNote: note,
      checkInLat: latitude,
      checkInLng: longitude,
    },
    include: {
      employee: { select: { id: true, firstName: true, lastName: true, employeeNumber: true } },
    },
  });

  return NextResponse.json(successResponse(attendance), { status: 201 });
}
