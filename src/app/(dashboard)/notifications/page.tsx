"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bell, CheckCircle, CalendarDays, Wallet, UserPlus, GraduationCap } from "lucide-react";
import { useState } from "react";
import { format } from "date-fns";
import { id } from "date-fns/locale";

type Notification = {
  id: string;
  title: string;
  message: string;
  type: "leave" | "payroll" | "attendance" | "training" | "general";
  isRead: boolean;
  createdAt: Date;
};

const initialNotifications: Notification[] = [
  {
    id: "1",
    title: "Pengajuan Cuti Baru",
    message: "Budi Santoso mengajukan cuti tahunan 25-27 Mar 2026",
    type: "leave",
    isRead: false,
    createdAt: new Date("2026-03-23T08:30:00"),
  },
  {
    id: "2",
    title: "Payroll Maret Siap",
    message: "Payroll periode Maret 2026 telah selesai dihitung dan siap disetujui",
    type: "payroll",
    isRead: false,
    createdAt: new Date("2026-03-22T14:00:00"),
  },
  {
    id: "3",
    title: "Karyawan Baru Terdaftar",
    message: "Dewi Lestari telah ditambahkan ke departemen IT sebagai Software Developer",
    type: "general",
    isRead: true,
    createdAt: new Date("2026-03-21T10:15:00"),
  },
  {
    id: "4",
    title: "Training Reminder",
    message: "Training 'Leadership Workshop' dimulai besok pukul 09:00",
    type: "training",
    isRead: true,
    createdAt: new Date("2026-03-20T16:00:00"),
  },
  {
    id: "5",
    title: "Absensi Tidak Lengkap",
    message: "3 karyawan belum melakukan clock-out kemarin",
    type: "attendance",
    isRead: true,
    createdAt: new Date("2026-03-20T08:00:00"),
  },
];

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

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState(initialNotifications);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  function markAsRead(notifId: string) {
    setNotifications((prev) =>
      prev.map((n) => (n.id === notifId ? { ...n, isRead: true } : n))
    );
  }

  function markAllRead() {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  }

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
                      {format(notif.createdAt, "dd MMM, HH:mm", { locale: id })}
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
