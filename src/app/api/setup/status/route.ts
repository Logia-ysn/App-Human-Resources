import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { apiGuard, isGuardError } from "@/lib/api-guard";
import { successResponse } from "@/types/api";

export async function GET() {
  const session = await apiGuard();
  if (isGuardError(session)) return session;

  const [companyCount, departmentCount, positionCount, employeeCount, leaveTypeCount] =
    await Promise.all([
      prisma.company.count(),
      prisma.department.count({ where: { isActive: true } }),
      prisma.position.count({ where: { isActive: true } }),
      prisma.employee.count({ where: { isDeleted: false } }),
      prisma.leaveType.count({ where: { isActive: true } }),
    ]);

  return NextResponse.json(
    successResponse({
      company: companyCount > 0,
      departments: departmentCount,
      positions: positionCount,
      employees: employeeCount,
      leaveTypes: leaveTypeCount,
      complete:
        companyCount > 0 &&
        departmentCount > 0 &&
        positionCount > 0 &&
        employeeCount > 0,
    })
  );
}
