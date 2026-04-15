"use client";

import Link from "next/link";
import { format, formatDistanceToNow } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import { toast } from "sonner";
import { Bell, CheckCheck, Info, AlertCircle, CheckCircle2, XCircle } from "lucide-react";

import {
  useNotifications,
  markNotificationRead,
  markAllNotificationsRead,
} from "@/hooks/use-notifications";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { LoadingState } from "@/components/shared/loading-state";

const TYPE_META: Record<string, { icon: typeof Bell; dot: string }> = {
  INFO: { icon: Info, dot: "bg-[var(--info)]" },
  SUCCESS: { icon: CheckCircle2, dot: "bg-[var(--success)]" },
  WARNING: { icon: AlertCircle, dot: "bg-[var(--warning)]" },
  ERROR: { icon: XCircle, dot: "bg-destructive" },
  LEAVE: { icon: Bell, dot: "bg-primary" },
  ATTENDANCE: { icon: Bell, dot: "bg-primary" },
  PAYROLL: { icon: Bell, dot: "bg-[var(--success)]" },
  ANNOUNCEMENT: { icon: Bell, dot: "bg-[var(--info)]" },
};

export default function NotificationsPage() {
  const { notifications, unreadCount, isLoading, mutate } = useNotifications();

  async function handleMarkRead(id: string) {
    try {
      await markNotificationRead(id);
      await mutate();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gagal menandai sebagai dibaca");
    }
  }

  async function handleMarkAll() {
    try {
      await markAllNotificationsRead();
      toast.success("Semua notifikasi ditandai sebagai dibaca");
      await mutate();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gagal");
    }
  }

  if (isLoading) {
    return (
      <LoadingState />
    );
  }

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex items-center justify-between gap-3 border-b border-border pb-4">
        <div className="flex items-center gap-2.5">
          <Bell className="size-5 text-muted-foreground" strokeWidth={1.75} />
          <div>
            <h1 className="text-xl font-semibold tracking-tight">Notifikasi</h1>
            <p className="text-xs text-muted-foreground">
              {unreadCount > 0
                ? `${unreadCount} notifikasi belum dibaca`
                : "Tidak ada notifikasi baru"}
            </p>
          </div>
        </div>
        {unreadCount > 0 && (
          <Button variant="outline" size="sm" onClick={handleMarkAll}>
            <CheckCheck data-icon="inline-start" />
            Tandai semua dibaca
          </Button>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Daftar Notifikasi</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {notifications.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">
              <Bell className="mx-auto h-10 w-10 opacity-30 mb-3" />
              <p className="text-sm">Belum ada notifikasi.</p>
            </div>
          ) : (
            <ul className="divide-y">
              {notifications.map((n) => {
                const meta = TYPE_META[n.type] ?? TYPE_META.INFO;
                const Icon = meta.icon;
                return (
                  <li
                    key={n.id}
                    className={cn(
                      "flex gap-3 p-4 hover:bg-muted/40 transition-colors",
                      !n.isRead && "bg-primary/[0.03]",
                    )}
                  >
                    <div className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-sm border border-border bg-muted/60">
                      <Icon className="h-4 w-4 text-muted-foreground" strokeWidth={1.75} />
                      <span className={cn("absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full ring-2 ring-background", meta.dot)} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <p className={cn("text-sm font-medium", !n.isRead && "font-semibold")}>
                              {n.title}
                            </p>
                            {!n.isRead && (
                              <span className="inline-flex items-center gap-1 rounded-sm border border-border bg-muted/60 px-1.5 py-0 text-[10px] font-medium text-muted-foreground">
                                <span className="h-1.5 w-1.5 rounded-full bg-[var(--primary)]" aria-hidden />
                                Baru
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground mt-0.5">{n.message}</p>
                          <div className="flex items-center gap-3 mt-1.5 text-xs text-muted-foreground">
                            <span title={format(new Date(n.createdAt), "dd MMM yyyy HH:mm", { locale: idLocale })}>
                              {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true, locale: idLocale })}
                            </span>
                            {n.actionUrl && (
                              <Link
                                href={n.actionUrl}
                                className="text-primary hover:underline"
                              >
                                Lihat detail
                              </Link>
                            )}
                          </div>
                        </div>
                        {!n.isRead && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleMarkRead(n.id)}
                          >
                            Tandai dibaca
                          </Button>
                        )}
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
