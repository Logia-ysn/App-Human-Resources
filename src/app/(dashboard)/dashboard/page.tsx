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
  ArrowRight,
  CalendarClock,
  Briefcase,
  GraduationCap,
  UserCheck,
  HandCoins,
  Activity,
} from "lucide-react";
import {
  employees,
  departments,
  positions,
  attendanceTrend,
  leaveDistribution,
  activityFeed,
} from "@/lib/dummy-data";
import type { ActivityItem } from "@/lib/dummy-data";
import { format, differenceInDays } from "date-fns";
import { id } from "date-fns/locale";
import Link from "next/link";
import { AttendanceChart, LeaveChart } from "./dashboard-charts";

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 11) return "Selamat Pagi";
  if (hour < 15) return "Selamat Siang";
  return "Selamat Sore";
}

function getFormattedDate(): string {
  const today = new Date("2026-03-24");
  return format(today, "EEEE, dd MMMM yyyy", { locale: id });
}

const ACTIVITY_ICON_MAP: Record<ActivityItem["type"], { icon: typeof Users; color: string; bg: string }> = {
  leave: { icon: CalendarClock, color: "text-purple-600", bg: "bg-purple-50" },
  employee: { icon: UserCheck, color: "text-blue-600", bg: "bg-blue-50" },
  payroll: { icon: HandCoins, color: "text-emerald-600", bg: "bg-emerald-50" },
  attendance: { icon: Clock, color: "text-amber-600", bg: "bg-amber-50" },
  recruitment: { icon: Briefcase, color: "text-indigo-600", bg: "bg-indigo-50" },
  training: { icon: GraduationCap, color: "text-pink-600", bg: "bg-pink-50" },
};

function formatRelativeTime(timestamp: string): string {
  const now = new Date("2026-03-24T09:00:00");
  const date = new Date(timestamp);
  const diffMs = now.getTime() - date.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffHours / 24);

  if (diffHours < 1) return "Baru saja";
  if (diffHours < 24) return `${diffHours} jam lalu`;
  if (diffDays === 1) return "Kemarin";
  return `${diffDays} hari lalu`;
}

export default async function DashboardPage() {
  const today = new Date("2026-03-24");
  const activeEmployees = employees.filter(
    (e) => e.status === "ACTIVE" && !e.isDeleted
  );
  const activeDepartments = departments.filter((d) => d.isActive);
  const contractExpiring = employees.filter(
    (e) => e.endDate && new Date(e.endDate) <= new Date("2026-06-30")
  );
  const probationEmployees = employees.filter(
    (e) => e.status === "PROBATION"
  );

  const deptCounts = activeDepartments.slice(0, 6).map((dept) => {
    const count = employees.filter(
      (e) => e.departmentId === dept.id && !e.isDeleted
    ).length;
    return { ...dept, count };
  });
  const maxDeptCount = Math.max(...deptCounts.map((d) => d.count), 1);

  const recentEmployees = [...employees]
    .sort(
      (a, b) =>
        new Date(b.joinDate).getTime() - new Date(a.joinDate).getTime()
    )
    .slice(0, 5);

  const statCards = [
    {
      label: "Total Karyawan",
      value: activeEmployees.length,
      subtitle: `${probationEmployees.length} dalam masa probation`,
      icon: Users,
      borderColor: "border-l-blue-500",
      iconBg: "bg-blue-50 text-blue-600",
      href: "/employees",
    },
    {
      label: "Departemen",
      value: activeDepartments.length,
      subtitle: `${positions.length} jabatan terdaftar`,
      icon: Building,
      borderColor: "border-l-emerald-500",
      iconBg: "bg-emerald-50 text-emerald-600",
      href: "/departments",
    },
    {
      label: "Hadir Hari Ini",
      value: 12,
      subtitle: `Dari ${activeEmployees.length} karyawan`,
      icon: Clock,
      borderColor: "border-l-amber-500",
      iconBg: "bg-amber-50 text-amber-600",
      href: undefined,
    },
    {
      label: "Pengajuan Cuti",
      value: 3,
      subtitle: "Menunggu persetujuan",
      icon: CalendarDays,
      borderColor: "border-l-red-500",
      iconBg: "bg-red-50 text-red-600",
      href: undefined,
    },
  ] as const;

  const quickActions = [
    {
      label: "Tambah Karyawan",
      icon: UserPlus,
      href: "/employees",
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      label: "Proses Payroll",
      icon: DollarSign,
      href: "/payroll",
      color: "text-emerald-600",
      bg: "bg-emerald-50",
    },
    {
      label: "Ajukan Cuti",
      icon: CalendarPlus,
      href: "/leave",
      color: "text-purple-600",
      bg: "bg-purple-50",
    },
    {
      label: "Lihat Absensi",
      icon: ClipboardList,
      href: "/attendance",
      color: "text-amber-600",
      bg: "bg-amber-50",
    },
  ] as const;

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 px-6 py-5 text-white shadow-sm">
        <h1 className="text-2xl font-bold tracking-tight">
          {getGreeting()} 👋
        </h1>
        <p className="mt-1 text-sm text-blue-100">{getFormattedDate()}</p>
        <p className="mt-0.5 text-sm text-blue-100">
          Berikut ringkasan data karyawan hari ini
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((card) => {
          const Icon = card.icon;
          const inner = (
            <Card
              key={card.label}
              className={`border-l-4 ${card.borderColor} transition-colors hover:bg-muted/50 ${card.href ? "cursor-pointer" : ""}`}
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {card.label}
                </CardTitle>
                <div
                  className={`flex h-9 w-9 items-center justify-center rounded-full ${card.iconBg}`}
                >
                  <Icon className="h-4 w-4" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{card.value}</div>
                <p className="mt-1 text-xs text-muted-foreground">
                  {card.subtitle}
                </p>
              </CardContent>
            </Card>
          );

          if (card.href) {
            return (
              <Link key={card.label} href={card.href}>
                {inner}
              </Link>
            );
          }
          return <div key={card.label}>{inner}</div>;
        })}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {quickActions.map((action) => {
          const Icon = action.icon;
          return (
            <Link key={action.label} href={action.href}>
              <Card className="group cursor-pointer transition-all hover:shadow-md">
                <CardContent className="flex items-center gap-3 py-4">
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${action.bg}`}
                  >
                    <Icon className={`h-5 w-5 ${action.color}`} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium">{action.label}</p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>

      {/* Charts Row */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Attendance Trend */}
        <Card>
          <CardHeader className="flex flex-row items-center gap-2 space-y-0">
            <BarChart3 className="h-4 w-4 text-blue-500" />
            <CardTitle className="text-base font-semibold">
              Tren Kehadiran (7 Hari Terakhir)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <AttendanceChart data={attendanceTrend} />
          </CardContent>
        </Card>

        {/* Leave Distribution */}
        <Card>
          <CardHeader className="flex flex-row items-center gap-2 space-y-0">
            <CalendarDays className="h-4 w-4 text-purple-500" />
            <CardTitle className="text-base font-semibold">
              Distribusi Cuti
            </CardTitle>
          </CardHeader>
          <CardContent>
            <LeaveChart data={leaveDistribution} />
          </CardContent>
        </Card>
      </div>

      {/* Bottom Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Kontrak Segera Berakhir */}
        <Card>
          <CardHeader className="flex flex-row items-center gap-2 space-y-0">
            <AlertTriangle className="h-4 w-4 text-orange-500" />
            <CardTitle className="text-base font-semibold">
              Kontrak Segera Berakhir
            </CardTitle>
          </CardHeader>
          <CardContent>
            {contractExpiring.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Tidak ada kontrak yang segera berakhir
              </p>
            ) : (
              <div className="space-y-4">
                {contractExpiring.map((emp) => {
                  const endDate = new Date(emp.endDate!);
                  const daysLeft = differenceInDays(endDate, today);
                  const isPast = daysLeft < 0;
                  return (
                    <div
                      key={emp.id}
                      className="flex items-center justify-between gap-2"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">
                          {emp.firstName} {emp.lastName}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {emp.positionName}
                        </p>
                      </div>
                      <div className="shrink-0 text-right">
                        <p className="text-sm font-semibold text-orange-600">
                          {format(endDate, "dd MMM yyyy", { locale: id })}
                        </p>
                        <p
                          className={`text-xs font-medium ${isPast ? "text-red-500" : "text-muted-foreground"}`}
                        >
                          {isPast ? "Sudah berakhir" : `${daysLeft} hari lagi`}
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
            <BarChart3 className="h-4 w-4 text-blue-500" />
            <CardTitle className="text-base font-semibold">
              Karyawan per Departemen
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {deptCounts.map((dept) => {
                const widthPercent = Math.round(
                  (dept.count / maxDeptCount) * 100
                );
                return (
                  <div key={dept.id} className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">{dept.name}</span>
                      <span className="text-sm font-semibold">
                        {dept.count}
                      </span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full bg-blue-500 transition-all"
                        style={{ width: `${widthPercent}%` }}
                      />
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
            <UserPlus className="h-4 w-4 text-emerald-500" />
            <CardTitle className="text-base font-semibold">
              Karyawan Baru
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentEmployees.map((emp) => (
                <div
                  key={emp.id}
                  className="flex items-center justify-between gap-2"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">
                      {emp.firstName} {emp.lastName}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {emp.departmentName}
                    </p>
                  </div>
                  <span className="shrink-0 text-xs font-medium text-muted-foreground">
                    {format(new Date(emp.joinDate), "dd MMM yyyy", {
                      locale: id,
                    })}
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
          <Activity className="h-4 w-4 text-blue-500" />
          <CardTitle className="text-base font-semibold">
            Aktivitas Terbaru
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {activityFeed.map((item) => {
              const config = ACTIVITY_ICON_MAP[item.type];
              const Icon = config.icon;
              return (
                <div key={item.id} className="flex gap-3">
                  <div
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${config.bg}`}
                  >
                    <Icon className={`h-4 w-4 ${config.color}`} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-sm font-medium">{item.action}</p>
                        <p className="text-xs text-muted-foreground">
                          {item.description}
                        </p>
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
