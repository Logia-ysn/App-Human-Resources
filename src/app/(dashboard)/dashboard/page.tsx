import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Building, Clock, CalendarDays, AlertTriangle, UserPlus, BarChart3 } from "lucide-react";
import { employees, departments, positions } from "@/lib/dummy-data";
import { format, differenceInDays } from "date-fns";
import { id } from "date-fns/locale";
import Link from "next/link";

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 11) return "Selamat Pagi";
  if (hour < 15) return "Selamat Siang";
  return "Selamat Sore";
}

export default async function DashboardPage() {

  const today = new Date("2026-03-23");
  const activeEmployees = employees.filter((e) => e.status === "ACTIVE" && !e.isDeleted);
  const activeDepartments = departments.filter((d) => d.isActive);
  const contractExpiring = employees.filter((e) => e.endDate && new Date(e.endDate) <= new Date("2026-06-30"));
  const probationEmployees = employees.filter((e) => e.status === "PROBATION");

  const deptCounts = activeDepartments.slice(0, 6).map((dept) => {
    const count = employees.filter((e) => e.departmentId === dept.id && !e.isDeleted).length;
    return { ...dept, count };
  });
  const maxDeptCount = Math.max(...deptCounts.map((d) => d.count), 1);

  const recentEmployees = [...employees]
    .sort((a, b) => new Date(b.joinDate).getTime() - new Date(a.joinDate).getTime())
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

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{getGreeting()}</h1>
        <p className="text-muted-foreground">
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
              className={`border-l-4 ${card.borderColor} hover:bg-muted/50 transition-colors ${card.href ? "cursor-pointer" : ""}`}
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {card.label}
                </CardTitle>
                <div className={`flex h-9 w-9 items-center justify-center rounded-full ${card.iconBg}`}>
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

      {/* Bottom Section */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Kontrak Segera Berakhir */}
        <Card>
          <CardHeader className="flex flex-row items-center gap-2 space-y-0">
            <AlertTriangle className="h-4 w-4 text-orange-500" />
            <CardTitle className="text-base font-semibold">Kontrak Segera Berakhir</CardTitle>
          </CardHeader>
          <CardContent>
            {contractExpiring.length === 0 ? (
              <p className="text-sm text-muted-foreground">Tidak ada kontrak yang segera berakhir</p>
            ) : (
              <div className="space-y-4">
                {contractExpiring.map((emp) => {
                  const endDate = new Date(emp.endDate!);
                  const daysLeft = differenceInDays(endDate, today);
                  const isPast = daysLeft < 0;
                  return (
                    <div key={emp.id} className="flex items-center justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">
                          {emp.firstName} {emp.lastName}
                        </p>
                        <p className="text-xs text-muted-foreground">{emp.positionName}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-sm font-semibold text-orange-600">
                          {format(endDate, "dd MMM yyyy", { locale: id })}
                        </p>
                        <p className={`text-xs font-medium ${isPast ? "text-red-500" : "text-muted-foreground"}`}>
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
            <CardTitle className="text-base font-semibold">Karyawan per Departemen</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {deptCounts.map((dept) => {
                const widthPercent = Math.round((dept.count / maxDeptCount) * 100);
                return (
                  <div key={dept.id} className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">{dept.name}</span>
                      <span className="text-sm font-semibold">{dept.count}</span>
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
            <CardTitle className="text-base font-semibold">Karyawan Baru</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentEmployees.map((emp) => (
                <div key={emp.id} className="flex items-center justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">
                      {emp.firstName} {emp.lastName}
                    </p>
                    <p className="text-xs text-muted-foreground">{emp.departmentName}</p>
                  </div>
                  <span className="shrink-0 text-xs font-medium text-muted-foreground">
                    {format(new Date(emp.joinDate), "dd MMM yyyy", { locale: id })}
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
