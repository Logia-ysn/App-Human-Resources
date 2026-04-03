import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { apiGuard, isGuardError } from "@/lib/api-guard";
import { successResponse, errorResponse } from "@/types/api";
import { createPayrollPeriodSchema } from "@/lib/validators/payroll";

export async function GET(req: NextRequest) {
  const session = await apiGuard({ minRole: "MANAGER" });
  if (isGuardError(session)) return session;

  const year = parseInt(req.nextUrl.searchParams.get("year") ?? String(new Date().getFullYear()));

  const periods = await prisma.payrollPeriod.findMany({
    where: { year },
    orderBy: { month: "desc" },
    include: {
      processedBy: { select: { id: true, firstName: true, lastName: true } },
      approvedBy: { select: { id: true, firstName: true, lastName: true } },
    },
  });

  return NextResponse.json(successResponse(periods));
}

export async function POST(req: NextRequest) {
  const session = await apiGuard({ minRole: "HR_ADMIN" });
  if (isGuardError(session)) return session;

  const body = await req.json();
  const parsed = createPayrollPeriodSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(errorResponse(parsed.error.issues[0].message), { status: 400 });
  }

  const { month, year } = parsed.data;

  const existing = await prisma.payrollPeriod.findUnique({
    where: { month_year: { month, year } },
  });
  if (existing) {
    return NextResponse.json(errorResponse(`Periode payroll ${month}/${year} sudah ada`), { status: 409 });
  }

  const company = await prisma.company.findFirst();
  const cutOffDate = company?.cutOffDate ?? 25;

  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0);
  const cutOff = new Date(year, month - 1, cutOffDate);

  const activeCount = await prisma.employee.count({
    where: { isDeleted: false, status: "ACTIVE" },
  });

  const period = await prisma.payrollPeriod.create({
    data: {
      month,
      year,
      startDate,
      endDate,
      cutOffDate: cutOff,
      totalEmployees: activeCount,
    },
  });

  return NextResponse.json(successResponse(period), { status: 201 });
}
