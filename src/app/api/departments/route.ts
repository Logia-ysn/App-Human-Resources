import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { apiGuard, isGuardError } from "@/lib/api-guard";
import { successResponse, errorResponse } from "@/types/api";
import { createDepartmentSchema } from "@/lib/validators/department";

export async function GET() {
  const session = await apiGuard();
  if (isGuardError(session)) return session;

  const departments = await prisma.department.findMany({
    where: { isActive: true },
    include: {
      head: { select: { id: true, firstName: true, lastName: true } },
      parent: { select: { id: true, name: true, code: true } },
      _count: { select: { employees: true, positions: true } },
    },
    orderBy: { name: "asc" },
    take: 500,
  });

  return NextResponse.json(successResponse(departments));
}

export async function POST(req: NextRequest) {
  const session = await apiGuard({ minRole: "HR_ADMIN" });
  if (isGuardError(session)) return session;

  const body = await req.json();
  const parsed = createDepartmentSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(errorResponse(parsed.error.issues[0].message), { status: 400 });
  }

  const existing = await prisma.department.findUnique({ where: { code: parsed.data.code } });
  if (existing) {
    return NextResponse.json(errorResponse("Kode departemen sudah digunakan"), { status: 409 });
  }

  const department = await prisma.department.create({
    data: parsed.data,
    include: {
      head: { select: { id: true, firstName: true, lastName: true } },
      _count: { select: { employees: true, positions: true } },
    },
  });

  return NextResponse.json(successResponse(department), { status: 201 });
}
