"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Users,
  Building,
  Clock,
  CalendarDays,
  AlertTriangle,
  UserPlus,
  BarChart3,
  DollarSign,
  CalendarPlus,
  ClipboardList,
  CalendarClock,
  Briefcase,
  GraduationCap,
  UserCheck,
  HandCoins,
  Activity,
  TrendingUp,
  UserCircle,
  FileText,
  Wallet,
} from "lucide-react";
import { useAppStore } from "@/lib/store/app-store";
import { useAuth } from "@/components/providers/auth-context";
import { hasMinRole } from "@/lib/utils/permissions";
import type { ActivityItem } from "@/lib/dummy-data";
import { format, differenceInDays } from "date-fns";
import { id } from "date-fns/locale";
import Link from "next/link";
import { AttendanceChart, LeaveChart } from "./dashboard-charts";
import { WelcomeBanner } from "./welcome-banner";

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 11) return "Selamat Pagi";
  if (hour < 15) return "Selamat Siang";
  return "Selamat Sore";
}

function getFormattedDate(): string {
  const today = new Date();
  return format(today, "EEEE, dd MMMM yyyy", { locale: id });
}

const ACTIVITY_BORDER_MAP: Record<ActivityItem["type"], string> = {
  leave: "border-l-purple-500",
  employee: "border-l-blue-500",
  payroll: "border-l-emerald-500",
  attendance: "border-l-amber-500",
  recruitment: "border-l-indigo-500",
  training: "border-l-pink-500",
};

const ACTIVITY_ICON_MAP: Record<
  ActivityItem["type"],
  { icon: typeof Users; color: string; bg: string }
> = {
  leave: { icon: CalendarClock, color: "text-purple-600", bg: "bg-purple-50" },
  employee: { icon: UserCheck, color: "text-blue-600", bg: "bg-blue-50" },
  payroll: { icon: HandCoins, color: "text-emerald-600", bg: "bg-emerald-50" },
  attendance: { icon: Clock, color: "text-amber-600", bg: "bg-amber-50" },
  recruitment: { icon: Briefcase, color: "text-indigo-600", bg: "bg-indigo-50" },
  training: { icon: GraduationCap, color: "text-pink-600", bg: "bg-pink-50" },
};

function formatRelativeTime(timestamp: string): string {
  const now = new Date();
  const date = new Date(timestamp);
  const diffMs = now.getTime() - date.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffHours / 24);

  if (diffHours < 1) return "Baru saja";
  if (diffHours < 24) return `${diffHours} jam lalu`;
  if (diffDays === 1) return "Kemarin";
  return `${diffDays} hari lalu`;
}

const DEPT_BAR_COLORS = [
  "bg-blue-500",
  "bg-emerald-500",
  "bg-amber-500",
  "bg-rose-500",
  "bg-indigo-500",
  "bg-cyan-500",
];

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
}

// ============================================================
//  EMPLOYEE DASHBOARD — personal data only
// ============================================================
function EmployeeDashboard() {
  const { employeeId } = useAuth();
  const employees = useAppStore((s) => s.employees);
  const leaveBalances = useAppStore((s) => s.leaveBalances);
  const leaveRequests = useAppStore((s) => s.leaveRequests);
  const attendanceRecords = useAppStore((s) => s.attendanceRecords);
  const payslips = useAppStore((s) => s.payslips);
  const performanceReviews = useAppStore((s) => s.performanceReviews);
  const trainings = useAppStore((s) => s.trainings);
  const trainingParticipants = useAppStore((s) => s.trainingParticipants);

  const me = employees.find((e) => e.id === employeeId && !e.isDeleted);

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

  const myLeaveBalance = leaveBalances.find(
    (lb) => lb.employeeId === me.id && lb.leaveTypeId === "lt-1",
  );
  const myPendingLeaves = leaveRequests.filter(
    (lr) => lr.employeeId === me.id && lr.status === "PENDING",
  );
  const myAttendanceThisMonth = attendanceRecords.filter(
    (ar) => ar.employeeId === me.id,
  );
  const myLatestPayslip = payslips.find((p) => p.employeeId === me.id);
  const myLatestReview = performanceReviews.find(
    (pr) => pr.employeeId === me.id,
  );
  const myTrainings = trainingParticipants
    .filter((tp) => tp.employeeId === me.id)
    .map((tp) => {
      const training = trainings.find((t) => t.id === tp.trainingId);
      return { ...tp, trainingName: training?.title ?? "-" };
    });

  const quickLinks = [
    { label: "Profil Saya", icon: UserCircle, href: "/ess/profile", iconColor: "text-blue-600", iconBg: "bg-blue-50" },
    { label: "Slip Gaji", icon: FileText, href: "/ess/payslips", iconColor: "text-emerald-600", iconBg: "bg-emerald-50" },
    { label: "Ajukan Cuti", icon: CalendarPlus, href: "/ess/leave", iconColor: "text-purple-600", iconBg: "bg-purple-50" },
    { label: "Absensi Saya", icon: Clock, href: "/ess/attendance", iconColor: "text-amber-600", iconBg: "bg-amber-50" },
  ];

  return (
    <div className="space-y-4 lg:space-y-6">
      <GreetingBanner subtitle={`${me.positionName} — ${me.departmentName}`} />

      {/* Profile Summary Card */}
      <Card>
        <CardContent className="flex items-center gap-4 p-4 sm:p-5">
          <div className="flex size-14 shrink-0 items-center justify-center rounded-full bg-primary text-lg font-semibold text-primary-foreground">
            {me.firstName.charAt(0)}{me.lastName.charAt(0)}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-lg font-bold truncate">
              {me.firstName} {me.lastName}
            </p>
            <p className="text-sm text-muted-foreground">
              {me.positionName} — {me.departmentName}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5 font-mono">
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
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-purple-100">
              <CalendarDays className="size-5 text-purple-600" />
            </div>
            <div className="min-w-0">
              <p className="text-2xl font-bold leading-none">
                {myLeaveBalance
                  ? myLeaveBalance.entitlement + myLeaveBalance.carried - myLeaveBalance.used - myLeaveBalance.pending
                  : "-"}
              </p>
              <p className="mt-1 text-xs font-medium text-muted-foreground truncate">
                Sisa Cuti
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground/70 truncate">
                dari {myLeaveBalance ? myLeaveBalance.entitlement + myLeaveBalance.carried : 0} hari
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-amber-100">
              <Clock className="size-5 text-amber-600" />
            </div>
            <div className="min-w-0">
              <p className="text-2xl font-bold leading-none">
                {myAttendanceThisMonth.length}
              </p>
              <p className="mt-1 text-xs font-medium text-muted-foreground truncate">
                Hari Hadir
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground/70 truncate">
                bulan ini
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-rose-100">
              <CalendarClock className="size-5 text-rose-600" />
            </div>
            <div className="min-w-0">
              <p className="text-2xl font-bold leading-none">
                {myPendingLeaves.length}
              </p>
              <p className="mt-1 text-xs font-medium text-muted-foreground truncate">
                Cuti Pending
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground/70 truncate">
                menunggu approval
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100">
              <Wallet className="size-5 text-emerald-600" />
            </div>
            <div className="min-w-0">
              <p className="text-xl font-bold leading-none truncate">
                {myLatestPayslip
                  ? formatCurrency(myLatestPayslip.netSalary)
                  : "-"}
              </p>
              <p className="mt-1 text-xs font-medium text-muted-foreground truncate">
                Gaji Terakhir
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground/70 truncate">
                {myLatestPayslip?.periodLabel ?? "-"}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {quickLinks.map((action) => {
          const Icon = action.icon;
          return (
            <Link key={action.label} href={action.href}>
              <Card className="cursor-pointer transition-all duration-200 hover:scale-[1.02] hover:shadow-md">
                <CardContent className="flex flex-col items-center justify-center gap-2 p-4 text-center">
                  <div className={`flex size-10 items-center justify-center rounded-xl ${action.iconBg}`}>
                    <Icon className={`size-5 ${action.iconColor}`} />
                  </div>
                  <p className="text-xs font-medium sm:text-sm">{action.label}</p>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>

      {/* Bottom Grid */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {/* Kinerja */}
        <Card>
          <CardHeader className="flex flex-row items-center gap-2 space-y-0">
            <div className="flex size-7 items-center justify-center rounded-lg bg-blue-50">
              <BarChart3 className="size-4 text-blue-500" />
            </div>
            <CardTitle className="text-sm font-semibold sm:text-base">
              Penilaian Kinerja
            </CardTitle>
          </CardHeader>
          <CardContent>
            {myLatestReview ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{myLatestReview.cycleName}</span>
                  <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-700">
                    {myLatestReview.status.replace("_", " ")}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <p className="text-xs text-muted-foreground">Self Score</p>
                    <p className="text-lg font-bold">{myLatestReview.selfScore ?? "-"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Manager</p>
                    <p className="text-lg font-bold">{myLatestReview.managerScore ?? "-"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Final</p>
                    <p className="text-lg font-bold">{myLatestReview.finalScore ?? "-"}</p>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Belum ada penilaian kinerja.</p>
            )}
          </CardContent>
        </Card>

        {/* Training */}
        <Card>
          <CardHeader className="flex flex-row items-center gap-2 space-y-0">
            <div className="flex size-7 items-center justify-center rounded-lg bg-pink-50">
              <GraduationCap className="size-4 text-pink-500" />
            </div>
            <CardTitle className="text-sm font-semibold sm:text-base">
              Training Saya
            </CardTitle>
          </CardHeader>
          <CardContent>
            {myTrainings.length === 0 ? (
              <p className="text-sm text-muted-foreground">Belum ada training terdaftar.</p>
            ) : (
              <div className="space-y-2.5">
                {myTrainings.slice(0, 3).map((tp) => (
                  <div key={tp.id} className="flex items-center justify-between gap-2">
                    <p className="truncate text-sm font-medium">{tp.trainingName}</p>
                    <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${
                      tp.status === "COMPLETED_TRAINING"
                        ? "bg-emerald-100 text-emerald-700"
                        : tp.status === "ATTENDED"
                          ? "bg-blue-100 text-blue-700"
                          : "bg-gray-100 text-gray-700"
                    }`}>
                      {tp.status === "COMPLETED_TRAINING" ? "Selesai" : tp.status === "ATTENDED" ? "Hadir" : "Terdaftar"}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// ============================================================
//  GREETING BANNER (shared)
// ============================================================
function GreetingBanner({ subtitle }: { subtitle: string }) {
  return (
    <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-indigo-600 via-blue-600 to-cyan-500 px-4 py-4 text-white shadow-lg sm:px-6 sm:py-5">
      <div
        className="pointer-events-none absolute inset-0 opacity-10"
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.3) 1px, transparent 0)",
          backgroundSize: "20px 20px",
        }}
      />
      <div className="relative">
        <h1 className="text-xl font-bold tracking-tight sm:text-2xl">
          {getGreeting()}
        </h1>
        <p className="mt-1 text-sm text-white/80">{getFormattedDate()}</p>
        <p className="mt-0.5 text-xs text-white/70 sm:text-sm">{subtitle}</p>
      </div>
    </div>
  );
}

// ============================================================
//  ADMIN DASHBOARD — full company overview (Manager+)
// ============================================================
function AdminDashboard() {
  const employees = useAppStore((s) => s.employees);
  const departments = useAppStore((s) => s.departments);
  const positions = useAppStore((s) => s.positions);
  const attendanceTrend = useAppStore((s) => s.attendanceTrend);
  const leaveDistribution = useAppStore((s) => s.leaveDistribution);
  const activityFeed = useAppStore((s) => s.activityFeed);

  const today = new Date();
  const activeEmployees = employees.filter(
    (e) => e.status === "ACTIVE" && !e.isDeleted,
  );
  const activeDepartments = departments.filter((d) => d.isActive);
  const threeMonthsLater = new Date();
  threeMonthsLater.setMonth(threeMonthsLater.getMonth() + 3);
  const contractExpiring = employees.filter(
    (e) => e.endDate && new Date(e.endDate) <= threeMonthsLater,
  );

  const deptCounts = activeDepartments.slice(0, 6).map((dept) => {
    const count = employees.filter(
      (e) => e.departmentId === dept.id && !e.isDeleted,
    ).length;
    return { ...dept, count };
  });
  const maxDeptCount = Math.max(...deptCounts.map((d) => d.count), 1);

  const recentEmployees = [...employees]
    .sort(
      (a, b) =>
        new Date(b.joinDate).getTime() - new Date(a.joinDate).getTime(),
    )
    .slice(0, 5);

  const statCards = [
    {
      label: "Total Karyawan",
      value: activeEmployees.length,
      trend: "+2 dari bulan lalu",
      icon: Users,
      iconBg: "bg-blue-100",
      iconColor: "text-blue-600",
      href: "/employees" as string | undefined,
    },
    {
      label: "Departemen",
      value: activeDepartments.length,
      trend: `${positions.length} jabatan`,
      icon: Building,
      iconBg: "bg-emerald-100",
      iconColor: "text-emerald-600",
      href: "/departments" as string | undefined,
    },
    {
      label: "Hadir Hari Ini",
      value: 12,
      trend: `Dari ${activeEmployees.length} karyawan`,
      icon: Clock,
      iconBg: "bg-amber-100",
      iconColor: "text-amber-600",
      href: undefined as string | undefined,
    },
    {
      label: "Pengajuan Cuti",
      value: 3,
      trend: "Menunggu persetujuan",
      icon: CalendarDays,
      iconBg: "bg-rose-100",
      iconColor: "text-rose-600",
      href: undefined as string | undefined,
    },
  ];

  const quickActions = [
    { label: "Tambah Karyawan", icon: UserPlus, href: "/employees", iconColor: "text-blue-600", iconBg: "bg-blue-50" },
    { label: "Proses Payroll", icon: DollarSign, href: "/payroll", iconColor: "text-emerald-600", iconBg: "bg-emerald-50" },
    { label: "Ajukan Cuti", icon: CalendarPlus, href: "/leave", iconColor: "text-purple-600", iconBg: "bg-purple-50" },
    { label: "Lihat Absensi", icon: ClipboardList, href: "/attendance", iconColor: "text-amber-600", iconBg: "bg-amber-50" },
  ] as const;

  return (
    <div className="space-y-4 lg:space-y-6">
      <WelcomeBanner />
      <GreetingBanner subtitle="Berikut ringkasan data karyawan hari ini" />

      {/* Stat Cards */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {statCards.map((card) => {
          const Icon = card.icon;
          const inner = (
            <Card
              key={card.label}
              className={`transition-all hover:shadow-md ${card.href ? "cursor-pointer" : ""}`}
            >
              <CardContent className="flex items-center gap-3 p-4">
                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${card.iconBg}`}>
                  <Icon className={`h-5 w-5 ${card.iconColor}`} />
                </div>
                <div className="min-w-0">
                  <p className="text-2xl font-bold leading-none">{card.value}</p>
                  <p className="mt-1 truncate text-xs font-medium text-muted-foreground">{card.label}</p>
                  <p className="mt-0.5 flex items-center gap-1 truncate text-xs text-muted-foreground/70">
                    <TrendingUp className="h-3 w-3 shrink-0" />
                    <span className="truncate">{card.trend}</span>
                  </p>
                </div>
              </CardContent>
            </Card>
          );
          if (card.href) {
            return <Link key={card.label} href={card.href}>{inner}</Link>;
          }
          return <div key={card.label}>{inner}</div>;
        })}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {quickActions.map((action) => {
          const Icon = action.icon;
          return (
            <Link key={action.label} href={action.href}>
              <Card className="cursor-pointer transition-all duration-200 hover:scale-[1.02] hover:shadow-md">
                <CardContent className="flex flex-col items-center justify-center gap-2 p-4 text-center">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${action.iconBg}`}>
                    <Icon className={`h-5 w-5 ${action.iconColor}`} />
                  </div>
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
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-50">
              <BarChart3 className="h-4 w-4 text-blue-500" />
            </div>
            <CardTitle className="text-sm font-semibold sm:text-base">Tren Kehadiran (7 Hari)</CardTitle>
          </CardHeader>
          <CardContent>
            <AttendanceChart data={attendanceTrend} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center gap-2 space-y-0">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-purple-50">
              <CalendarDays className="h-4 w-4 text-purple-500" />
            </div>
            <CardTitle className="text-sm font-semibold sm:text-base">Distribusi Cuti</CardTitle>
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
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-orange-50">
              <AlertTriangle className="h-4 w-4 text-orange-500" />
            </div>
            <CardTitle className="text-sm font-semibold sm:text-base">Kontrak Segera Berakhir</CardTitle>
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
                        <p className="text-xs text-muted-foreground">{emp.positionName}</p>
                      </div>
                      <div className="shrink-0 text-right">
                        <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-semibold ${isPast ? "bg-red-100 text-red-700" : isUrgent ? "bg-orange-100 text-orange-700" : "bg-amber-50 text-amber-700"}`}>
                          {isPast ? "Sudah berakhir" : `${daysLeft} hari lagi`}
                        </span>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          {format(endDate, "dd MMM yyyy", { locale: id })}
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
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-50">
              <BarChart3 className="h-4 w-4 text-blue-500" />
            </div>
            <CardTitle className="text-sm font-semibold sm:text-base">Karyawan per Departemen</CardTitle>
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
                      <span className="text-xs font-semibold sm:text-sm">{dept.count}</span>
                    </div>
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                      <div className={`h-full rounded-full ${barColor} transition-all`} style={{ width: `${widthPercent}%` }} />
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
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-50">
              <UserPlus className="h-4 w-4 text-emerald-500" />
            </div>
            <CardTitle className="text-sm font-semibold sm:text-base">Karyawan Baru</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2.5">
              {recentEmployees.map((emp) => (
                <div key={emp.id} className="flex items-center justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{emp.firstName} {emp.lastName}</p>
                    <p className="text-xs text-muted-foreground">{emp.departmentName}</p>
                  </div>
                  <span className="shrink-0 text-xs text-muted-foreground">
                    {format(new Date(emp.joinDate), "dd MMM yyyy", { locale: id })}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Activity Feed */}
      <Card>
        <CardHeader className="flex flex-row items-center gap-2 space-y-0">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-50">
            <Activity className="h-4 w-4 text-blue-500" />
          </div>
          <CardTitle className="text-sm font-semibold sm:text-base">Aktivitas Terbaru</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 overflow-x-auto">
            {activityFeed.map((item) => {
              const config = ACTIVITY_ICON_MAP[item.type];
              const borderClass = ACTIVITY_BORDER_MAP[item.type];
              const Icon = config.icon;
              return (
                <div key={item.id} className={`flex gap-3 rounded-lg border-l-2 py-2 pl-3 ${borderClass}`}>
                  <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${config.bg}`}>
                    <Icon className={`h-3.5 w-3.5 ${config.color}`} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-sm font-medium leading-tight">{item.action}</p>
                        <p className="text-xs text-muted-foreground">{item.description}</p>
                      </div>
                      <span className="shrink-0 text-xs text-muted-foreground">
                        {formatRelativeTime(item.timestamp)}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ============================================================
//  MAIN — route to correct dashboard by role
// ============================================================
export default function DashboardPage() {
  const { role } = useAuth();
  const isManager = hasMinRole(role, "MANAGER");

  return isManager ? <AdminDashboard /> : <EmployeeDashboard />;
}
