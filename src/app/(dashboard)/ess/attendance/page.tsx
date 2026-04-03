"use client";

import { useState } from "react";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import { useAuth } from "@/components/providers/auth-context";
import { useAttendanceRecords, useTodayAttendance, useCheckIn, useCheckOut } from "@/hooks/use-attendance";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/shared/status-badge";
import { Clock, Loader2 } from "lucide-react";
import { toast } from "sonner";

function formatTime(dateStr: string | Date | null): string {
  if (!dateStr) return "-";
  return format(new Date(dateStr), "HH:mm");
}

function formatWorkHours(minutes: number | null): string {
  if (!minutes || minutes === 0) return "-";
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}j ${mins}m` : `${hours}j`;
}

export default function EssAttendancePage() {
  const { employeeId } = useAuth();
  const { attendance: todayRecord, isLoading: todayLoading, mutate: mutateTodayAttendance } = useTodayAttendance(employeeId);
  const { records: myAttendance, isLoading: historyLoading } = useAttendanceRecords({
    employeeId: employeeId ?? undefined,
    limit: 30,
  });

  const checkInMutation = useCheckIn();
  const checkOutMutation = useCheckOut(todayRecord?.id ?? "");
  const [processing, setProcessing] = useState(false);

  const todayStr = new Date().toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

  if (todayLoading || historyLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!employeeId) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center space-y-2">
          <Clock className="h-12 w-12 text-muted-foreground/40 mx-auto" />
          <p className="text-lg font-medium">Data karyawan tidak ditemukan</p>
          <p className="text-sm text-muted-foreground">
            Akun Anda belum terhubung dengan data karyawan.
          </p>
        </div>
      </div>
    );
  }

  const hasCheckedIn = todayRecord?.checkIn != null;
  const hasCheckedOut = todayRecord?.checkOut != null;

  async function handleCheckIn() {
    setProcessing(true);
    try {
      await checkInMutation.trigger({ employeeId: employeeId! });
      toast.success(`Clock In berhasil — ${new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}`);
      await mutateTodayAttendance();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Gagal clock in");
    } finally {
      setProcessing(false);
    }
  }

  async function handleCheckOut() {
    if (!todayRecord) return;
    setProcessing(true);
    try {
      await checkOutMutation.trigger({});
      toast.success(`Clock Out berhasil — ${new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}`);
      await mutateTodayAttendance();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Gagal clock out");
    } finally {
      setProcessing(false);
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-lg sm:text-2xl font-bold tracking-tight">Absensi Saya</h1>

      <Card>
        <CardHeader><CardTitle>Clock In / Clock Out</CardTitle></CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
            <div className="flex items-center gap-3">
              <Clock className="h-8 w-8 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Hari ini, {todayStr}</p>
                {todayRecord ? (
                  <p className="text-lg font-semibold">
                    Check In: {formatTime(todayRecord.checkIn)} | Check Out: {formatTime(todayRecord.checkOut)}
                  </p>
                ) : (
                  <p className="text-lg font-semibold text-muted-foreground">Belum absen</p>
                )}
              </div>
            </div>
            <div className="sm:ml-auto">
              {!hasCheckedIn ? (
                <Button onClick={handleCheckIn} disabled={processing}>
                  {processing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Clock In
                </Button>
              ) : !hasCheckedOut ? (
                <Button variant="outline" onClick={handleCheckOut} disabled={processing}>
                  {processing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Clock Out
                </Button>
              ) : (
                <Button variant="outline" disabled>Sudah absen hari ini</Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Riwayat Kehadiran</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-3 md:hidden">
            {myAttendance.map((a) => (
              <div key={a.id} className="rounded-lg border p-3 space-y-1">
                <div className="flex items-center justify-between">
                  <p className="font-medium text-sm">
                    {format(new Date(a.date), "dd MMM yyyy", { locale: idLocale })}
                  </p>
                  <StatusBadge status={a.status} />
                </div>
                <div className="grid grid-cols-2 gap-1 text-xs text-muted-foreground">
                  <span>Masuk: {formatTime(a.checkIn)}</span>
                  <span>Keluar: {formatTime(a.checkOut)}</span>
                  <span>Kerja: {formatWorkHours(a.workMinutes)}</span>
                  <span>Lembur: {a.overtimeMinutes && a.overtimeMinutes > 0 ? `${a.overtimeMinutes}m` : "-"}</span>
                </div>
              </div>
            ))}
          </div>
          <div className="hidden md:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tanggal</TableHead>
                  <TableHead>Check In</TableHead>
                  <TableHead>Check Out</TableHead>
                  <TableHead>Terlambat</TableHead>
                  <TableHead>Jam Kerja</TableHead>
                  <TableHead>Lembur</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {myAttendance.map((a) => (
                  <TableRow key={a.id}>
                    <TableCell>{format(new Date(a.date), "dd MMM yyyy", { locale: idLocale })}</TableCell>
                    <TableCell>{formatTime(a.checkIn)}</TableCell>
                    <TableCell>{formatTime(a.checkOut)}</TableCell>
                    <TableCell>{a.lateMinutes > 0 ? `${a.lateMinutes} menit` : "-"}</TableCell>
                    <TableCell>{formatWorkHours(a.workMinutes)}</TableCell>
                    <TableCell>{a.overtimeMinutes && a.overtimeMinutes > 0 ? `${a.overtimeMinutes} menit` : "-"}</TableCell>
                    <TableCell><StatusBadge status={a.status} /></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
