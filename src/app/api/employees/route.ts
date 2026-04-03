import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { apiGuard, isGuardError } from "@/lib/api-guard";
import { successResponse, errorResponse } from "@/types/api";
import { createEmployeeSchema, employeeQuerySchema } from "@/lib/validators/employee";

export async function GET(req: NextRequest) {
  const session = await apiGuard({ minRole: "MANAGER" });
  if (isGuardError(session)) return session;

  const params = Object.fromEntries(req.nextUrl.searchParams);
  const parsed = employeeQuerySchema.safeParse(params);
  if (!parsed.success) {
    return NextResponse.json(errorResponse("Parameter tidak valid"), { status: 400 });
  }

  const { page, limit, search, departmentId, status, type, sort, order } = parsed.data;
  const skip = (page - 1) * limit;

  const where = {
    isDeleted: false,
    ...(search && {
      OR: [
        { firstName: { contains: search, mode: "insensitive" as const } },
        { lastName: { contains: search, mode: "insensitive" as const } },
        { employeeNumber: { contains: search, mode: "insensitive" as const } },
        { email: { contains: search, mode: "insensitive" as const } },
      ],
    }),
    ...(departmentId && { departmentId }),
    ...(status && { status: status as never }),
    ...(type && { type: type as never }),
  };

  const [employees, total] = await Promise.all([
    prisma.employee.findMany({
      where,
      include: {
        department: { select: { id: true, name: true, code: true } },
        position: { select: { id: true, name: true, code: true } },
        manager: { select: { id: true, firstName: true, lastName: true } },
      },
      orderBy: { [sort]: order },
      skip,
      take: limit,
    }),
    prisma.employee.count({ where }),
  ]);

  const meta = { total, page, limit, totalPages: Math.ceil(total / limit) };

  return NextResponse.json(
    successResponse({ employees, meta })
  );
}

export async function POST(req: NextRequest) {
  const session = await apiGuard({ minRole: "HR_ADMIN" });
  if (isGuardError(session)) return session;

  const body = await req.json();
  const parsed = createEmployeeSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(errorResponse(parsed.error.issues[0].message), { status: 400 });
  }

  const data = parsed.data;

  const existing = await prisma.employee.findFirst({
    where: {
      OR: [
        { employeeNumber: data.employeeNumber },
        { email: data.email },
        { nik: data.nik },
      ],
    },
  });

  if (existing) {
    const field = existing.employeeNumber === data.employeeNumber
      ? "Nomor karyawan"
      : existing.email === data.email
        ? "Email"
        : "NIK";
    return NextResponse.json(errorResponse(`${field} sudah terdaftar`), { status: 409 });
  }

  const employee = await prisma.employee.create({
    data: {
      ...data,
      dateOfBirth: new Date(data.dateOfBirth),
      joinDate: new Date(data.joinDate),
      endDate: data.endDate ? new Date(data.endDate) : undefined,
    },
    include: {
      department: { select: { id: true, name: true, code: true } },
      position: { select: { id: true, name: true, code: true } },
      manager: { select: { id: true, firstName: true, lastName: true } },
    },
  });

  return NextResponse.json(successResponse(employee), { status: 201 });
}
