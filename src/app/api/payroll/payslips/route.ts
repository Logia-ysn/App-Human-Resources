import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { apiGuard, isGuardError } from "@/lib/api-guard";
import { successResponse } from "@/types/api";

export async function GET(req: NextRequest) {
  const session = await apiGuard({ minRole: "EMPLOYEE" });
  if (isGuardError(session)) return session;

  const periodId = req.nextUrl.searchParams.get("periodId");
  const employeeId = req.nextUrl.searchParams.get("employeeId");
  const year = req.nextUrl.searchParams.get("year");

  const where: Record<string, unknown> = {};
  if (periodId) where.payrollPeriodId = periodId;
  if (employeeId) where.employeeId = employeeId;
  if (year) where.payrollPeriod = { year: Number(year) };

  // Non-admin: only own payslips
  const role = session.user.role;
  if (role === "EMPLOYEE" && session.user.employeeId) {
    where.employeeId = session.user.employeeId;
  }

  const payslips = await prisma.payslip.findMany({
    where,
    orderBy: [{ payrollPeriod: { year: "desc" } }, { payrollPeriod: { month: "desc" } }],
    include: {
      payrollPeriod: { select: { month: true, year: true, status: true } },
      employee: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          employeeNumber: true,
          department: { select: { name: true } },
        },
      },
    },
  });

  return NextResponse.json(successResponse(payslips));
}
