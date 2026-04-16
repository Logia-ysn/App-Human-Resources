import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { apiGuard, isGuardError } from "@/lib/api-guard";
import { successResponse, errorResponse } from "@/types/api";
import { updateLeaveTypeSchema } from "@/lib/validators/leave";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(req: NextRequest, { params }: Params) {
  const session = await apiGuard({ minRole: "HR_ADMIN" });
  if (isGuardError(session)) return session;

  const { id } = await params;
  const body = await req.json().catch(() => null);
  const parsed = updateLeaveTypeSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      errorResponse(parsed.error.issues[0]?.message ?? "Input tidak valid"),
      { status: 400 }
    );
  }

  try {
    const updated = await prisma.leaveType.update({
      where: { id },
      data: parsed.data,
    });
    return NextResponse.json(successResponse(updated));
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError) {
      if (err.code === "P2002") {
        return NextResponse.json(errorResponse("Kode tipe cuti sudah digunakan"), { status: 409 });
      }
      if (err.code === "P2025") {
        return NextResponse.json(errorResponse("Tipe cuti tidak ditemukan"), { status: 404 });
      }
    }
    return NextResponse.json(errorResponse("Gagal memperbarui tipe cuti"), { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const session = await apiGuard({ minRole: "HR_ADMIN" });
  if (isGuardError(session)) return session;

  const { id } = await params;

  const [reqCount, balCount] = await Promise.all([
    prisma.leaveRequest.count({ where: { leaveTypeId: id } }),
    prisma.leaveBalance.count({ where: { leaveTypeId: id } }),
  ]);

  if (reqCount > 0 || balCount > 0) {
    const updated = await prisma.leaveType.update({
      where: { id },
      data: { isActive: false },
    });
    return NextResponse.json(
      successResponse({
        ...updated,
        softDeleted: true,
        message: "Tipe cuti masih dipakai, dinonaktifkan (soft delete)",
      })
    );
  }

  try {
    await prisma.leaveType.delete({ where: { id } });
    return NextResponse.json(successResponse({ deleted: true }));
  } catch (err) {
    if (
      err instanceof Prisma.PrismaClientKnownRequestError &&
      err.code === "P2025"
    ) {
      return NextResponse.json(errorResponse("Tipe cuti tidak ditemukan"), { status: 404 });
    }
    return NextResponse.json(errorResponse("Gagal menghapus tipe cuti"), { status: 500 });
  }
}
