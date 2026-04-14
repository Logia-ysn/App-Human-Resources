import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { apiGuard, isGuardError } from "@/lib/api-guard";
import { successResponse } from "@/types/api";

export async function GET() {
  const session = await apiGuard();
  if (isGuardError(session)) return session;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const thisMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
  const [
    totalEmployees,
    activeEmployees,
    todayAttendance,
    todayPresent,
    todayLate,
    todayAbsent,
    todaySick,
    todayLeave,
    pendingLeave,
    newThisMonth,
    newLastMonth,
  ] = await Promise.all([
    prisma.employee.count({ where: { isDeleted: false } }),
    prisma.employee.count({ where: { isDeleted: false, status: "ACTIVE" } }),
    prisma.attendance.count({ where: { date: today } }),
    prisma.attendance.count({ where: { date: today, status: { in: ["PRESENT", "LATE"] } } }),
    prisma.attendance.count({ where: { date: today, status: "LATE" } }),
    prisma.attendance.count({ where: { date: today, status: "ABSENT" } }),
    prisma.attendance.count({ where: { date: today, status: "SICK" } }),
    prisma.attendance.count({ where: { date: today, status: "LEAVE" } }),
    prisma.leaveRequest.count({ where: { status: "PENDING" } }),
    prisma.employee.count({
      where: { isDeleted: false, joinDate: { gte: thisMonth } },
    }),
    prisma.employee.count({
      where: { isDeleted: false, joinDate: { gte: lastMonth, lt: thisMonth } },
    }),
  ]);

  const empTrend = newThisMonth - newLastMonth;

  return NextResponse.json(successResponse({
    totalEmployees,
    activeEmployees,
    attendance: {
      total: todayAttendance,
      present: todayPresent,
      late: todayLate,
      absent: todayAbsent,
      sick: todaySick,
      leave: todayLeave,
    },
    pendingLeave,
    newEmployees: {
      thisMonth: newThisMonth,
      lastMonth: newLastMonth,
      trend: empTrend,
    },
  }));
}
