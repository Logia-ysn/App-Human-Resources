"use client";

import { useAppStore } from "@/lib/store/app-store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bell, CheckCircle, CalendarDays, Wallet, UserPlus, GraduationCap } from "lucide-react";
import { useState, useEffect, useCallback, useMemo } from "react";
import { format } from "date-fns";
import { id } from "date-fns/locale";

type Notification = {
  id: string;
  title: string;
  message: string;
  type: "leave" | "payroll" | "attendance" | "training" | "general";
  isRead: boolean;
  createdAt: string;
};

const READ_STATE_KEY = "hris-notifications-read";

const TYPE_ICON: Record<string, React.ElementType> = {
  leave: CalendarDays,
  payroll: Wallet,
  attendance: CheckCircle,
  training: GraduationCap,
  general: UserPlus,
};

const TYPE_COLOR: Record<string, string> = {
  leave: "bg-blue-100 text-blue-600",
  payroll: "bg-emerald-100 text-emerald-600",
  attendance: "bg-amber-100 text-amber-600",
  training: "bg-purple-100 text-purple-600",
  general: "bg-slate-100 text-slate-600",
};

function loadReadIds(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const stored = localStorage.getItem(READ_STATE_KEY);
    if (stored) return new Set(JSON.parse(stored));
  } catch {
    // fallback
  }
  return new Set();
}

function saveReadIds(ids: Set<string>) {
  try {
    localStorage.setItem(READ_STATE_KEY, JSON.stringify([...ids]));
  } catch {
    // localStorage full or unavailable
  }
}

export default function NotificationsPage() {
  const leaveRequests = useAppStore((s) => s.leaveRequests);
  const payrollPeriods = useAppStore((s) => s.payrollPeriods);
  const employees = useAppStore((s) => s.employees);
  const trainings = useAppStore((s) => s.trainings);
  const attendanceRecords = useAppStore((s) => s.attendanceRecords);

  const [readIds, setReadIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    setReadIds(loadReadIds());
  }, []);

  // Generate notifications dynamically from store data
  const notifications = useMemo<Notification[]>(() => {
    const items: Notification[] = [];

    // Pending leave requests
    for (const lr of leaveRequests.filter((r) => r.status === "PENDING")) {
      items.push({
        id: `notif-leave-${lr.id}`,
        title: "Pengajuan Cuti Baru",
        message: `${lr.employeeName} mengajukan ${lr.leaveTypeName} ${lr.startDate} - ${lr.endDate} (${lr.totalDays} hari)`,
        type: "leave",
        isRead: false,
        createdAt: lr.createdAt ? `${lr.createdAt}T08:00:00` : new Date().toISOString(),
      });
    }

    // Recently approved/rejected leave
    for (const lr of leaveRequests.filter((r) => r.status === "APPROVED" || r.status === "REJECTED")) {
      items.push({
        id: `notif-leave-result-${lr.id}`,
        title: `Cuti ${lr.status === "APPROVED" ? "Disetujui" : "Ditolak"}`,
        message: `${lr.leaveTypeName} ${lr.employeeName} (${lr.startDate} - ${lr.endDate}) telah ${lr.status === "APPROVED" ? "disetujui" : "ditolak"}`,
        type: "leave",
        isRead: false,
        createdAt: lr.createdAt ? `${lr.createdAt}T10:00:00` : new Date().toISOString(),
      });
    }

    // Payroll periods that are calculated/approved/paid
    const PAYROLL_LABEL: Record<string, string> = {
      CALCULATED: "Selesai Dihitung",
      APPROVED: "Disetujui",
      PAID: "Sudah Dibayar",
    };
    for (const pp of payrollPeriods.filter((p) => p.status === "CALCULATED" || p.status === "APPROVED" || p.status === "PAID")) {
      const periodLabel = `${["", "Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"][pp.month]} ${pp.year}`;
      items.push({
        id: `notif-payroll-${pp.id}`,
        title: `Payroll ${PAYROLL_LABEL[pp.status] ?? "Diproses"}`,
        message: `Payroll periode ${periodLabel} telah ${(PAYROLL_LABEL[pp.status] ?? "diproses").toLowerCase()}`,
        type: "payroll",
        isRead: false,
        createdAt: pp.processedAt ?? new Date().toISOString(),
      });
    }

    // New employees (joined in the last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const thirtyDaysAgoStr = thirtyDaysAgo.toISOString().split("T")[0];
    for (const emp of employees.filter((e) => !e.isDeleted && e.joinDate >= thirtyDaysAgoStr)) {
      items.push({
        id: `notif-emp-${emp.id}`,
        title: "Karyawan Baru Terdaftar",
        message: `${emp.firstName} ${emp.lastName} telah ditambahkan ke departemen ${emp.departmentName} sebagai ${emp.positionName}`,
        type: "general",
        isRead: false,
        createdAt: `${emp.joinDate}T09:00:00`,
      });
    }

    // Upcoming trainings (within 7 days)
    const sevenDaysLater = new Date();
    sevenDaysLater.setDate(sevenDaysLater.getDate() + 7);
    const todayStr = new Date().toISOString().split("T")[0];
    const sevenDaysStr = sevenDaysLater.toISOString().split("T")[0];
    for (const t of trainings.filter((tr) => tr.startDate >= todayStr && tr.startDate <= sevenDaysStr)) {
      items.push({
        id: `notif-training-${t.id}`,
        title: "Training Akan Dimulai",
        message: `Training '${t.title}' dimulai tanggal ${t.startDate}`,
        type: "training",
        isRead: false,
        createdAt: `${todayStr}T08:00:00`,
      });
    }

    // Incomplete attendance (yesterday - employees without clock-out)
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split("T")[0];
    const incompleteYesterday = attendanceRecords.filter(
      (r) => r.date === yesterdayStr && r.checkIn && !r.checkOut,
    );
    if (incompleteYesterday.length > 0) {
      items.push({
        id: `notif-attendance-${yesterdayStr}`,
        title: "Absensi Tidak Lengkap",
        message: `${incompleteYesterday.length} karyawan belum melakukan clock-out kemarin`,
        type: "attendance",
        isRead: false,
        createdAt: `${todayStr}T08:00:00`,
      });
    }

    // Sort by createdAt descending
    items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    // Apply read state from localStorage
    return items.map((n) => ({
      ...n,
      isRead: readIds.has(n.id),
    }));
  }, [leaveRequests, payrollPeriods, employees, trainings, attendanceRecords, readIds]);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const markAsRead = useCallback((notifId: string) => {
    setReadIds((prev) => {
      const next = new Set(prev);
      next.add(notifId);
      saveReadIds(next);
      return next;
    });
  }, []);

  const markAllRead = useCallback(() => {
    setReadIds((prev) => {
      const next = new Set(prev);
      for (const n of notifications) {
        next.add(n.id);
      }
      saveReadIds(next);
      return next;
    });
  }, [notifications]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <Bell className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Notifikasi</h1>
            <p className="text-sm text-muted-foreground">
              {unreadCount > 0 ? `${unreadCount} belum dibaca` : "Semua sudah dibaca"}
            </p>
          </div>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllRead}
            className="text-sm font-medium text-primary hover:underline"
          >
            Tandai semua dibaca
          </button>
        )}
      </div>

      <Card className="shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Semua Notifikasi</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {notifications.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">
              Tidak ada notifikasi
            </div>
          ) : (
            <div className="divide-y">
              {notifications.map((notif) => {
                const Icon = TYPE_ICON[notif.type] || Bell;
                const colorClass = TYPE_COLOR[notif.type] || TYPE_COLOR.general;
                return (
                  <button
                    key={notif.id}
                    onClick={() => markAsRead(notif.id)}
                    className={`flex w-full items-start gap-4 px-6 py-4 text-left transition-colors hover:bg-muted/50 ${
                      !notif.isRead ? "bg-primary/5" : ""
                    }`}
                  >
                    <div className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${colorClass}`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className={`text-sm ${!notif.isRead ? "font-semibold" : "font-medium"}`}>
                          {notif.title}
                        </p>
                        {!notif.isRead && (
                          <span className="h-2 w-2 shrink-0 rounded-full bg-primary" />
                        )}
                      </div>
                      <p className="mt-0.5 text-sm text-muted-foreground line-clamp-1">
                        {notif.message}
                      </p>
                    </div>
                    <span className="shrink-0 text-xs text-muted-foreground">
                      {format(new Date(notif.createdAt), "dd MMM, HH:mm", { locale: id })}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
