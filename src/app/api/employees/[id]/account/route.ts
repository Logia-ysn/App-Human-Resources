import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { apiGuard, isGuardError } from "@/lib/api-guard";
import { successResponse, errorResponse } from "@/types/api";
import {
  createEmployeeAccountSchema,
  updateEmployeeAccountSchema,
} from "@/lib/validators/user";
import { recordAudit, getRequestMeta } from "@/lib/audit";

type Params = { params: Promise<{ id: string }> };

const ACCOUNT_SELECT = {
  id: true,
  email: true,
  role: true,
  isActive: true,
  mustChangePassword: true,
  lastLoginAt: true,
  createdAt: true,
} as const;

export async function GET(_req: NextRequest, { params }: Params) {
  const session = await apiGuard({ minRole: "HR_ADMIN" });
  if (isGuardError(session)) return session;

  const { id } = await params;
  const account = await prisma.user.findUnique({
    where: { employeeId: id },
    select: ACCOUNT_SELECT,
  });

  return NextResponse.json(successResponse(account));
}

export async function POST(req: NextRequest, { params }: Params) {
  const session = await apiGuard({ minRole: "HR_ADMIN" });
  if (isGuardError(session)) return session;

  const { id } = await params;
  const body = await req.json().catch(() => null);
  const parsed = createEmployeeAccountSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      errorResponse(parsed.error.issues[0].message),
      { status: 400 },
    );
  }

  const employee = await prisma.employee.findFirst({
    where: { id, isDeleted: false },
    select: { id: true, email: true, firstName: true, lastName: true },
  });
  if (!employee) {
    return NextResponse.json(errorResponse("Karyawan tidak ditemukan"), {
      status: 404,
    });
  }

  const existing = await prisma.user.findUnique({ where: { employeeId: id } });
  if (existing) {
    return NextResponse.json(
      errorResponse("Karyawan ini sudah memiliki akun login"),
      { status: 409 },
    );
  }

  const email = parsed.data.email ?? employee.email;
  const emailOwner = await prisma.user.findUnique({ where: { email } });
  if (emailOwner) {
    return NextResponse.json(
      errorResponse("Email sudah digunakan oleh akun lain"),
      { status: 409 },
    );
  }

  const passwordHash = await bcrypt.hash(parsed.data.password, 10);
  const user = await prisma.user.create({
    data: {
      email,
      passwordHash,
      role: parsed.data.role,
      isActive: true,
      mustChangePassword: parsed.data.mustChangePassword,
      employeeId: employee.id,
    },
    select: ACCOUNT_SELECT,
  });

  await recordAudit({
    userId: session.user.id,
    action: "CREATE",
    entityType: "User",
    entityId: user.id,
    newValues: { email: user.email, role: user.role, employeeId: employee.id },
    redactFields: ["password", "passwordHash"],
    ...getRequestMeta(req.headers),
  });

  return NextResponse.json(successResponse(user), { status: 201 });
}

export async function PATCH(req: NextRequest, { params }: Params) {
  const session = await apiGuard({ minRole: "HR_ADMIN" });
  if (isGuardError(session)) return session;

  const { id } = await params;
  const body = await req.json().catch(() => null);
  const parsed = updateEmployeeAccountSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      errorResponse(parsed.error.issues[0].message),
      { status: 400 },
    );
  }

  const account = await prisma.user.findUnique({ where: { employeeId: id } });
  if (!account) {
    return NextResponse.json(errorResponse("Akun tidak ditemukan"), {
      status: 404,
    });
  }

  // Only SUPER_ADMIN can grant/demote SUPER_ADMIN role
  if (parsed.data.role === "SUPER_ADMIN" && session.user.role !== "SUPER_ADMIN") {
    return NextResponse.json(
      errorResponse("Hanya Super Admin yang dapat menetapkan role Super Admin"),
      { status: 403 },
    );
  }

  const updated = await prisma.user.update({
    where: { id: account.id },
    data: parsed.data,
    select: ACCOUNT_SELECT,
  });

  await recordAudit({
    userId: session.user.id,
    action: "UPDATE",
    entityType: "User",
    entityId: account.id,
    oldValues: { role: account.role, isActive: account.isActive },
    newValues: parsed.data,
    ...getRequestMeta(req.headers),
  });

  return NextResponse.json(successResponse(updated));
}

export async function DELETE(req: NextRequest, { params }: Params) {
  const session = await apiGuard({ minRole: "SUPER_ADMIN" });
  if (isGuardError(session)) return session;

  const { id } = await params;
  const account = await prisma.user.findUnique({ where: { employeeId: id } });
  if (!account) {
    return NextResponse.json(errorResponse("Akun tidak ditemukan"), {
      status: 404,
    });
  }

  if (account.id === session.user.id) {
    return NextResponse.json(
      errorResponse("Tidak dapat menghapus akun Anda sendiri"),
      { status: 400 },
    );
  }

  await prisma.user.delete({ where: { id: account.id } });

  await recordAudit({
    userId: session.user.id,
    action: "DELETE",
    entityType: "User",
    entityId: account.id,
    oldValues: { email: account.email, role: account.role },
    ...getRequestMeta(req.headers),
  });

  return NextResponse.json(successResponse({ deleted: true }));
}
