import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { apiGuard, isGuardError } from "@/lib/api-guard";
import { successResponse, errorResponse } from "@/types/api";
import { checkOutSchema } from "@/lib/validators/attendance";
import { loadAppConfig, validateGpsRadius } from "@/lib/attendance-gps";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(req: NextRequest, { params }: Params) {
  const session = await apiGuard();
  if (isGuardError(session)) return session;

  const { id } = await params;
  const body = await req.json();
  const parsed = checkOutSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(errorResponse(parsed.error.issues[0].message), { status: 400 });
  }

  const attendance = await prisma.attendance.findUnique({ where: { id } });
  if (!attendance) {
    return NextResponse.json(errorResponse("Data absensi tidak ditemukan"), { status: 404 });
  }

  if (attendance.checkOut) {
    return NextResponse.json(errorResponse("Sudah melakukan check-out"), { status: 409 });
  }

  // Only allow self check-out or admin override
  if (attendance.employeeId !== session.user.employeeId && session.user.role === "EMPLOYEE") {
    return NextResponse.json(errorResponse("Tidak memiliki akses"), { status: 403 });
  }

  const appConfig = await loadAppConfig();
  const gpsCheck = validateGpsRadius(appConfig, parsed.data.latitude, parsed.data.longitude);
  if (!gpsCheck.ok) {
    return NextResponse.json(errorResponse(gpsCheck.message), { status: 400 });
  }

  const now = new Date();
  const checkIn = attendance.checkIn!;
  const workMinutes = Math.floor((now.getTime() - checkIn.getTime()) / 60000);

  const [endH, endM] = appConfig.defaultEndTime.split(":").map(Number);
  const scheduleEnd = new Date(attendance.date);
  scheduleEnd.setHours(endH, endM, 0, 0);
  const earlyLeaveMin = now < scheduleEnd
    ? Math.floor((scheduleEnd.getTime() - now.getTime()) / 60000)
    : 0;

  // Calculate overtime (after 17:00)
  const overtimeMinutes = now > scheduleEnd
    ? Math.floor((now.getTime() - scheduleEnd.getTime()) / 60000)
    : 0;

  const updated = await prisma.attendance.update({
    where: { id },
    data: {
      checkOut: now,
      workMinutes: Math.min(workMinutes, 480),
      earlyLeaveMin,
      overtimeMinutes,
      checkOutNote: parsed.data.note,
      checkOutLat: parsed.data.latitude,
      checkOutLng: parsed.data.longitude,
    },
    include: {
      employee: { select: { id: true, firstName: true, lastName: true, employeeNumber: true } },
    },
  });

  return NextResponse.json(successResponse(updated));
}
