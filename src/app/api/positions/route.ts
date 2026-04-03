import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { apiGuard, isGuardError } from "@/lib/api-guard";
import { successResponse, errorResponse } from "@/types/api";
import { createPositionSchema } from "@/lib/validators/position";

export async function GET(req: NextRequest) {
  const session = await apiGuard();
  if (isGuardError(session)) return session;

  const departmentId = req.nextUrl.searchParams.get("departmentId");

  const positions = await prisma.position.findMany({
    where: {
      isActive: true,
      ...(departmentId && { departmentId }),
    },
    include: {
      department: { select: { id: true, name: true, code: true } },
      _count: { select: { employees: true } },
    },
    orderBy: [{ department: { name: "asc" } }, { name: "asc" }],
  });

  return NextResponse.json(successResponse(positions));
}

export async function POST(req: NextRequest) {
  const session = await apiGuard({ minRole: "HR_ADMIN" });
  if (isGuardError(session)) return session;

  const body = await req.json();
  const parsed = createPositionSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(errorResponse(parsed.error.issues[0].message), { status: 400 });
  }

  const existing = await prisma.position.findUnique({ where: { code: parsed.data.code } });
  if (existing) {
    return NextResponse.json(errorResponse("Kode jabatan sudah digunakan"), { status: 409 });
  }

  const position = await prisma.position.create({
    data: parsed.data,
    include: {
      department: { select: { id: true, name: true, code: true } },
      _count: { select: { employees: true } },
    },
  });

  return NextResponse.json(successResponse(position), { status: 201 });
}
