import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { apiGuard, isGuardError } from "@/lib/api-guard";
import { successResponse } from "@/types/api";

export async function GET(req: NextRequest) {
  const session = await apiGuard({ minRole: "EMPLOYEE" });
  if (isGuardError(session)) return session;

  const employeeId = req.nextUrl.searchParams.get("employeeId");
  const status = req.nextUrl.searchParams.get("status");

  const where: Record<string, unknown> = {};
  if (employeeId) where.employeeId = employeeId;
  if (status) where.status = status;

  if (session.user.role === "EMPLOYEE" && session.user.employeeId) {
    where.employeeId = session.user.employeeId;
  }

  const onboardings = await prisma.employeeOnboarding.findMany({
    where,
    orderBy: { startDate: "desc" },
    include: {
      employee: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          employeeNumber: true,
          department: { select: { name: true } },
          position: { select: { name: true } },
        },
      },
      template: { select: { id: true, name: true } },
      tasks: {
        include: {
          task: { select: { id: true, title: true, category: true, dueDay: true } },
        },
      },
    },
  });

  const withProgress = onboardings.map((o) => {
    const total = o.tasks.length;
    const completed = o.tasks.filter((t) => t.isCompleted).length;
    const progress = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { ...o, progress, totalTasks: total, completedTasks: completed };
  });

  return NextResponse.json(successResponse(withProgress));
}
