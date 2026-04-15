import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { apiGuard, isGuardError } from "@/lib/api-guard";
import { successResponse, errorResponse } from "@/types/api";

const generateSchema = z.object({
  year: z.number().int().min(2000).max(2100),
  employeeId: z.string().optional(),
  leaveTypeId: z.string().optional(),
  carryOverFromPrevYear: z.boolean().default(false),
});

export async function POST(req: NextRequest) {
  const session = await apiGuard({ minRole: "HR_ADMIN" });
  if (isGuardError(session)) return session;

  const body = await req.json();
  const parsed = generateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(errorResponse(parsed.error.issues[0].message), { status: 400 });
  }

  const { year, employeeId, leaveTypeId, carryOverFromPrevYear } = parsed.data;

  const employees = await prisma.employee.findMany({
    where: {
      isDeleted: false,
      status: "ACTIVE",
      ...(employeeId && { id: employeeId }),
    },
    select: { id: true },
  });

  const leaveTypes = await prisma.leaveType.findMany({
    where: {
      isActive: true,
      ...(leaveTypeId && { id: leaveTypeId }),
    },
    select: { id: true, defaultQuota: true, isCarryOver: true, maxCarryOver: true },
  });

  if (employees.length === 0 || leaveTypes.length === 0) {
    return NextResponse.json(errorResponse("Tidak ada karyawan atau tipe cuti yang aktif"), { status: 400 });
  }

  let created = 0;
  let skipped = 0;

  for (const emp of employees) {
    for (const lt of leaveTypes) {
      const existing = await prisma.leaveBalance.findUnique({
        where: {
          employeeId_leaveTypeId_year: {
            employeeId: emp.id,
            leaveTypeId: lt.id,
            year,
          },
        },
      });

      if (existing) {
        skipped += 1;
        continue;
      }

      let carried = 0;
      if (carryOverFromPrevYear && lt.isCarryOver) {
        const prev = await prisma.leaveBalance.findUnique({
          where: {
            employeeId_leaveTypeId_year: {
              employeeId: emp.id,
              leaveTypeId: lt.id,
              year: year - 1,
            },
          },
        });
        if (prev) {
          const remaining = prev.entitlement + prev.carried - prev.used - prev.pending;
          carried = Math.max(0, Math.min(remaining, lt.maxCarryOver ?? remaining));
        }
      }

      await prisma.leaveBalance.create({
        data: {
          employeeId: emp.id,
          leaveTypeId: lt.id,
          year,
          entitlement: lt.defaultQuota,
          carried,
          used: 0,
          pending: 0,
        },
      });
      created += 1;
    }
  }

  return NextResponse.json(
    successResponse({ created, skipped, employees: employees.length, leaveTypes: leaveTypes.length }),
    { status: 201 },
  );
}
