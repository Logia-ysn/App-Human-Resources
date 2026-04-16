import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { apiGuard, isGuardError } from "@/lib/api-guard";
import { successResponse, errorResponse } from "@/types/api";
import { createProfileChangeRequestSchema } from "@/lib/validators/profile-change-request";
import { hasMinRole } from "@/lib/utils/permissions";
import { notifyAdmins } from "@/lib/notify";

export async function GET(req: NextRequest) {
  const session = await apiGuard();
  if (isGuardError(session)) return session;

  const statusParam = req.nextUrl.searchParams.get("status");
  const isAdminView = hasMinRole(session.user.role, "HR_ADMIN");

  const where: Record<string, unknown> = {};
  if (!isAdminView) {
    if (!session.user.employeeId) {
      return NextResponse.json(successResponse({ requests: [] }));
    }
    where.employeeId = session.user.employeeId;
  }
  if (statusParam && ["PENDING", "RESOLVED", "REJECTED"].includes(statusParam)) {
    where.status = statusParam;
  }

  const requests = await prisma.profileChangeRequest.findMany({
    where,
    include: {
      employee: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          employeeNumber: true,
          department: { select: { id: true, name: true } },
        },
      },
      handler: {
        select: { id: true, firstName: true, lastName: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(successResponse({ requests }));
}

export async function POST(req: NextRequest) {
  const session = await apiGuard();
  if (isGuardError(session)) return session;

  if (!session.user.employeeId) {
    return NextResponse.json(
      errorResponse("Akun tidak terhubung dengan data karyawan"),
      { status: 400 }
    );
  }

  const body = await req.json().catch(() => ({}));
  const parsed = createProfileChangeRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      errorResponse(parsed.error.issues[0].message),
      { status: 400 }
    );
  }

  const employee = await prisma.employee.findUnique({
    where: { id: session.user.employeeId },
    select: { id: true, firstName: true, lastName: true, employeeNumber: true },
  });
  if (!employee) {
    return NextResponse.json(errorResponse("Data karyawan tidak ditemukan"), { status: 404 });
  }

  const created = await prisma.profileChangeRequest.create({
    data: {
      employeeId: employee.id,
      message: parsed.data.message,
    },
  });

  const fullName = `${employee.firstName} ${employee.lastName}`;
  await notifyAdmins({
    title: "Permintaan Perubahan Profil",
    message: `${fullName} (${employee.employeeNumber}) mengajukan perubahan profil.`,
    type: "GENERAL",
    actionUrl: "/profile-requests",
    roles: ["HR_ADMIN", "SUPER_ADMIN"],
    excludeUserId: session.user.id,
  }).catch(() => undefined);

  return NextResponse.json(successResponse(created), { status: 201 });
}
