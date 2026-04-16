import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { apiGuard, isGuardError } from "@/lib/api-guard";
import { successResponse, errorResponse } from "@/types/api";
import { createLeaveTypeSchema } from "@/lib/validators/leave";

export async function GET(req: NextRequest) {
  const session = await apiGuard();
  if (isGuardError(session)) return session;

  const includeInactive = req.nextUrl.searchParams.get("includeInactive") === "true";
  const leaveTypes = await prisma.leaveType.findMany({
    where: includeInactive ? {} : { isActive: true },
    orderBy: { name: "asc" },
  });

  return NextResponse.json(successResponse(leaveTypes));
}

export async function POST(req: NextRequest) {
  const session = await apiGuard({ minRole: "HR_ADMIN" });
  if (isGuardError(session)) return session;

  const body = await req.json().catch(() => null);
  const parsed = createLeaveTypeSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      errorResponse(parsed.error.issues[0]?.message ?? "Input tidak valid"),
      { status: 400 }
    );
  }

  try {
    const created = await prisma.leaveType.create({ data: parsed.data });
    return NextResponse.json(successResponse(created), { status: 201 });
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
      return NextResponse.json(errorResponse("Kode tipe cuti sudah digunakan"), { status: 409 });
    }
    return NextResponse.json(errorResponse("Gagal membuat tipe cuti"), { status: 500 });
  }
}
