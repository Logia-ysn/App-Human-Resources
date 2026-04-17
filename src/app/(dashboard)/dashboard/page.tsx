"use client";

import { useMemo } from "react";
import Link from "next/link";
import { format, differenceInDays } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Users, Building, Clock, CalendarDays, AlertTriangle, UserPlus, BarChart3, DollarSign, CalendarPlus, ClipboardList, CalendarClock, UserCircle, FileText, Wallet } from "lucide-react";
import { useAuth } from "@/components/providers/auth-context";
import { hasMinRole } from "@/lib/utils/permissions";
import { useDashboardStats } from "@/hooks/use-dashboard";
import { useEmployees } from "@/hooks/use-employees";
import { useDepartments } from "@/hooks/use-departments";
import { usePositions } from "@/hooks/use-positions";
import { useEmployee } from "@/hooks/use-employees";
import { useLeaveBalances, useLeaveRequests } from "@/hooks/use-leave";
import { useAttendanceRecords } from "@/hooks/use-attendance";
import { AttendanceChart, LeaveChart } from "./dashboard-charts";
import type { AttendanceTrendPoint, LeaveDistribution } from "./dashboard-charts";
import { WelcomeBanner } from "./welcome-banner";
import { StatCard } from "@/components/shared/stat-card";
import { LoadingState } from "@/components/shared/loading-state";

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 11) return "Selamat Pagi";
  if (hour < 15) return "Selamat Siang";
  return "Selamat Sore";
}

function getFormattedDate(): string {
  return format(new Date(), "EEEE, dd MMMM yyyy", { locale: idLocale });
}

// ============================================================
//  GREETING BANNER (shared)
// ============================================================
function GreetingBanner({ subtitle }: { subtitle: string }) {
  return (
    <div className="border-b border-border pb-4">
      <h1 className="text-xl font-semibold tracking-tight text-foreground">
        {getGreeting()}
      </h1>
      <p className="mt-1 text-xs text-muted-foreground">{getFormattedDate()}</p>
      <p className="text-sm text-foreground/80">{subtitle}</p>
    </div>
  );
}

// ============================================================
//  EMPLOYEE DASHBOARD
// ============================================================
function EmployeeDashboard() {
  const { employeeId } = useAuth();
  const { employee: me, isLoading: empLoading } = useEmployee(employeeId);
  const { balances: myBalances, isLoading: balLoading } = useLeaveBalances({ employeeId });
  const { requests: myLeaveRequests, isLoading: reqLoading } = useLeaveRequests({ employeeId: employeeId ?? undefined });
  const { records: myAttendance, isLoading: attLoading } = useAttendanceRecords({ employeeId: employeeId ?? undefined, limit: 30 });

  const isLoading = empLoading || balLoading || reqLoading || attLoading;

  if (isLoading) {
    return (
      <LoadingState />
    );
  }

  if (!me) {
    return (
      <div className="space-y-4 lg:space-y-6">
        <GreetingBanner subtitle="Selamat datang di HRIS" />
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <UserCircle className="size-12 text-muted-foreground/40 mb-3" />
            <p className="text-lg font-semibold">Akun belum terhubung</p>
            <p className="text-sm text-muted-foreground mt-1">
              Akun Anda belum terhubung dengan data karyawan. Hubungi HR Admin.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const positionName = me.position?.name ?? "-";
  const departmentName = me.department?.name ?? "-";
  const myLeaveBalance = myBalances[0] ?? null;
  const pendingLeaves = myLeaveRequests.filter((lr) => lr.status === "PENDING");

  const quickLinks = [
    { label: "Profil Saya", icon: UserCircle, href: "/ess/profile" },
    { label: "Slip Gaji", icon: FileText, href: "/ess/payslips" },
    { label: "Ajukan Cuti", icon: CalendarPlus, href: "/ess/leave" },
    { label: "Absensi Saya", icon: Clock, href: "/ess/attendance" },
  ];

  return (
    <div className="space-y-6">
      <GreetingBanner subtitle={`${positionName} — ${departmentName}`} />

      {/* Profile Summary Card */}
      <Card>
        <CardContent className="flex items-center gap-4 p-4">
          <div className="flex size-12 shrink-0 items-center justify-center rounded-sm bg-primary text-base font-semibold text-primary-foreground">
            {me.firstName.charAt(0)}{me.lastName.charAt(0)}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-base font-semibold truncate">
              {me.firstName} {me.lastName}
            </p>
            <p className="text-sm text-muted-foreground">
              {positionName} — {departmentName}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5 font-mono font-tabular">
              {me.employeeNumber}
            </p>
          </div>
          <Link
            href="/ess/profile"
            className="shrink-0 text-xs font-medium text-primary hover:underline"
          >
            Lihat Profil
          </Link>
        </CardContent>
      </Card>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard
          title="Sisa Cuti"
          value={
            myLeaveBalance
              ? myLeaveBalance.entitlement + myLeaveBalance.carried - myLeaveBalance.used - myLeaveBalance.pending
              : "-"
          }
          subtitle={`dari ${myLeaveBalance ? myLeaveBalance.entitlement + myLeaveBalance.carried : 0} hari`}
          icon={CalendarDays}
        />
        <StatCard
          title="Hari Hadir"
          value={myAttendance.length}
          subtitle="bulan ini"
          icon={Clock}
        />
        <StatCard
          title="Cuti Pending"
          value={pendingLeaves.length}
          subtitle="menunggu approval"
          icon={CalendarClock}
        />
        <StatCard
          title="Gaji Terakhir"
          value="-"
          subtitle="-"
          icon={Wallet}
        />
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {quickLinks.map((action) => {
          const Icon = action.icon;
          return (
            <Link key={action.label} href={action.href}>
              <Card className="cursor-pointer transition-colors hover:bg-muted/40">
                <CardContent className="flex flex-col items-center justify-center gap-2 p-4 text-center">
                  <Icon className="size-5 text-muted-foreground" strokeWidth={1.75} />
                  <p className="text-xs font-medium sm:text-sm">{action.label}</p>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

// ============================================================
//  ADMIN DASHBOARD
// ============================================================

const DEPT_BAR_COLORS = [
  "bg-primary",
  "bg-[var(--success)]",
  "bg-[var(--warning)]",
  "bg-[var(--info)]",
  "bg-primary/70",
  "bg-[var(--success)]/70",
];

function AdminDashboard() {
  const { stats, isLoading: statsLoading } = useDashboardStats();
  const { employees, isLoading: empLoading } = useEmployees({});
  const { departments, isLoading: deptLoading } = useDepartments();
  const { positions } = usePositions();
  const { records: attendanceRecords } = useAttendanceRecords({ limit: 200 });
  const { requests: leaveRequests } = useLeaveRequests({});

  const isLoading = statsLoading || empLoading || deptLoading;

  const today = new Date();

  const activeDepartments = departments.filter((d) => d.isActive);

  // Contract expiring in next 3 months
  const contractExpiring = useMemo(() => {
    const threeMonthsLater = new Date();
    threeMonthsLater.setMonth(threeMonthsLater.getMonth() + 3);
    return employees.filter(
      (e) => e.endDate && new Date(e.endDate) <= threeMonthsLater,
    );
  }, [employees]);

  // Attendance trend (last 7 days) from attendance records
  const attendanceTrend: AttendanceTrendPoint[] = useMemo(() => {
    const todayStr = format(new Date(), "yyyy-MM-dd");
    const baseDate = new Date(todayStr + "T00:00:00");
    const days: AttendanceTrendPoint[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(baseDate);
      d.setDate(d.getDate() - i);
      const dateStr = format(d, "yyyy-MM-dd");
      const dayLabel = format(d, "dd MMM", { locale: idLocale });
      const dayRecords = attendanceRecords.filter(
        (r) => format(new Date(r.date), "yyyy-MM-dd") === dateStr,
      );
      days.push({
        date: dayLabel,
        hadir: dayRecords.filter((r) => r.status === "PRESENT").length,
        terlambat: dayRecords.filter((r) => r.status === "LATE").length,
        tidakHadir: dayRecords.filter((r) => r.status === "ABSENT").length,
        cuti: dayRecords.filter((r) => r.status === "LEAVE" || r.status === "SICK").length,
      });
    }
    return days;
  }, [attendanceRecords]);

  // Leave distribution
  const leaveDistribution: LeaveDistribution[] = useMemo(() => {
    const LEAVE_COLORS: Record<string, string> = {
      "Cuti Tahunan": "var(--primary)",
      "Cuti Sakit": "var(--warning)",
      "Cuti Melahirkan": "var(--info)",
      "Cuti Menikah": "var(--success)",
      "Cuti Duka": "var(--muted-foreground)",
      "Tanpa Gaji": "var(--destructive)",
    };
    const DEFAULT_COLOR = "var(--muted-foreground)";
    const counts: Record<string, number> = {};
    for (const lr of leaveRequests) {
      const name = lr.leaveType?.name || "Lainnya";
      counts[name] = (counts[name] || 0) + Number(lr.totalDays);
    }
    return Object.entries(counts).map(([name, value]) => ({
      name,
      value,
      color: LEAVE_COLORS[name] || DEFAULT_COLOR,
    }));
  }, [leaveRequests]);

  // Department employee counts
  const deptCounts = useMemo(() => {
    return activeDepartments.slice(0, 6).map((dept) => ({
      ...dept,
      count: dept._count?.employees ?? 0,
    }));
  }, [activeDepartments]);
  const maxDeptCount = Math.max(...deptCounts.map((d) => d.count), 1);

  // Recent employees
  const recentEmployees = useMemo(() => {
    return [...employees]
      .sort(
        (a, b) =>
          new Date(b.joinDate).getTime() - new Date(a.joinDate).getTime(),
      )
      .slice(0, 5);
  }, [employees]);

  if (isLoading) {
    return (
      <LoadingState />
    );
  }

  const empTrend = stats
    ? stats.newEmployees.trend > 0
      ? `+${stats.newEmployees.trend} dari bulan lalu`
      : stats.newEmployees.trend < 0
        ? `${stats.newEmployees.trend} dari bulan lalu`
        : "Sama dengan bulan lalu"
    : "";

  const statCards = [
    {
      title: "Total Karyawan",
      value: stats?.activeEmployees ?? 0,
      subtitle: empTrend,
      icon: Users,
      href: "/employees" as string | undefined,
    },
    {
      title: "Departemen",
      value: activeDepartments.length,
      subtitle: `${positions.length} jabatan`,
      icon: Building,
      href: "/departments" as string | undefined,
    },
    {
      title: "Hadir Hari Ini",
      value: stats?.attendance.present ?? 0,
      subtitle: `dari ${stats?.activeEmployees ?? 0} karyawan`,
      icon: Clock,
      href: "/attendance" as string | undefined,
    },
    {
      title: "Pengajuan Cuti",
      value: stats?.pendingLeave ?? 0,
      subtitle: (stats?.pendingLeave ?? 0) > 0 ? "Menunggu persetujuan" : "Tidak ada pending",
      icon: CalendarDays,
      href: "/leave" as string | undefined,
    },
  ];

  const quickActions = [
    { label: "Tambah Karyawan", icon: UserPlus, href: "/employees" },
    { label: "Proses Payroll", icon: DollarSign, href: "/payroll" },
    { label: "Ajukan Cuti", icon: CalendarPlus, href: "/leave" },
    { label: "Lihat Absensi", icon: ClipboardList, href: "/attendance" },
  ] as const;

  return (
    <div className="space-y-6">
      <WelcomeBanner />
      <GreetingBanner subtitle="Berikut ringkasan data karyawan hari ini" />

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 lg:grid-cols-4">
        {statCards.map((card) =>
          card.href ? (
            <Link key={card.title} href={card.href}>
              <StatCard
                title={card.title}
                value={card.value}
                subtitle={card.subtitle}
                icon={card.icon}
              />
            </Link>
          ) : (
            <StatCard
              key={card.title}
              title={card.title}
              value={card.value}
              subtitle={card.subtitle}
              icon={card.icon}
            />
          ),
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {quickActions.map((action) => {
          const Icon = action.icon;
          return (
            <Link key={action.label} href={action.href}>
              <Card className="cursor-pointer transition-colors hover:bg-muted/40">
                <CardContent className="flex flex-col items-center justify-center gap-2 p-4 text-center">
                  <Icon className="size-5 text-muted-foreground" strokeWidth={1.75} />
                  <p className="text-xs font-medium sm:text-sm">{action.label}</p>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center gap-2 space-y-0">
            <BarChart3 className="h-4 w-4 text-muted-foreground" strokeWidth={1.75} />
            <CardTitle>Tren Kehadiran (7 Hari)</CardTitle>
          </CardHeader>
          <CardContent>
            <AttendanceChart data={attendanceTrend} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center gap-2 space-y-0">
            <CalendarDays className="h-4 w-4 text-muted-foreground" strokeWidth={1.75} />
            <CardTitle>Distribusi Cuti</CardTitle>
          </CardHeader>
          <CardContent>
            <LeaveChart data={leaveDistribution} />
          </CardContent>
        </Card>
      </div>

      {/* Bottom Grid */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Kontrak Segera Berakhir */}
        <Card>
          <CardHeader className="flex flex-row items-center gap-2 space-y-0">
            <AlertTriangle className="h-4 w-4 text-[var(--warning)]" strokeWidth={1.75} />
            <CardTitle>Kontrak Segera Berakhir</CardTitle>
          </CardHeader>
          <CardContent>
            {contractExpiring.length === 0 ? (
              <p className="text-sm text-muted-foreground">Tidak ada kontrak yang segera berakhir</p>
            ) : (
              <div className="space-y-3 overflow-x-auto">
                {contractExpiring.map((emp) => {
                  const endDate = new Date(emp.endDate!);
                  const daysLeft = differenceInDays(endDate, today);
                  const isPast = daysLeft < 0;
                  const isUrgent = daysLeft >= 0 && daysLeft <= 30;
                  return (
                    <div key={emp.id} className="flex items-center justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">{emp.firstName} {emp.lastName}</p>
                        <p className="text-xs text-muted-foreground">{emp.position?.name ?? "-"}</p>
                      </div>
                      <div className="shrink-0 text-right">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-sm border border-border bg-muted/60 px-2 py-0.5 text-[11px] font-medium`}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${isPast ? "bg-destructive" : isUrgent ? "bg-[var(--warning)]" : "bg-muted-foreground/60"}`}
                          />
                          {isPast ? "Sudah berakhir" : `${daysLeft} hari lagi`}
                        </span>
                        <p className="mt-0.5 font-tabular text-xs text-muted-foreground">
                          {format(endDate, "dd MMM yyyy", { locale: idLocale })}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Karyawan per Departemen */}
        <Card>
          <CardHeader className="flex flex-row items-center gap-2 space-y-0">
            <BarChart3 className="h-4 w-4 text-muted-foreground" strokeWidth={1.75} />
            <CardTitle>Karyawan per Departemen</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2.5">
              {deptCounts.map((dept, idx) => {
                const widthPercent = Math.round((dept.count / maxDeptCount) * 100);
                const barColor = DEPT_BAR_COLORS[idx % DEPT_BAR_COLORS.length];
                return (
                  <div key={dept.id} className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs sm:text-sm">{dept.name}</span>
                      <span className="font-tabular text-xs font-semibold sm:text-sm">{dept.count}</span>
                    </div>
                    <div className="h-1.5 w-full overflow-hidden rounded-sm bg-muted">
                      <div className={`h-full ${barColor} transition-all`} style={{ width: `${widthPercent}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Karyawan Baru */}
        <Card>
          <CardHeader className="flex flex-row items-center gap-2 space-y-0">
            <UserPlus className="h-4 w-4 text-muted-foreground" strokeWidth={1.75} />
            <CardTitle>Karyawan Baru</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2.5">
              {recentEmployees.map((emp) => (
                <div key={emp.id} className="flex items-center justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{emp.firstName} {emp.lastName}</p>
                    <p className="text-xs text-muted-foreground">{emp.department?.name ?? "-"}</p>
                  </div>
                  <span className="shrink-0 font-tabular text-xs text-muted-foreground">
                    {format(new Date(emp.joinDate), "dd MMM yyyy", { locale: idLocale })}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// ============================================================
//  MAIN
// ============================================================
export default function DashboardPage() {
  const { role } = useAuth();
  const isManager = hasMinRole(role, "MANAGER");

  return isManager ? <AdminDashboard /> : <EmployeeDashboard />;
}
