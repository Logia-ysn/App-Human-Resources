"use client";

import { useState } from "react";
import { useAppStore } from "@/lib/store/app-store";
import { useAuth } from "@/components/providers/auth-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/shared/status-badge";
import { Clock } from "lucide-react";
import { toast } from "sonner";

export default function EssAttendancePage() {
  const employees = useAppStore((s) => s.employees);
  const attendanceRecords = useAppStore((s) => s.attendanceRecords);
  const { employeeId } = useAuth();
  const currentEmployee = employees.find((e) => e.id === employeeId);
  const myAttendance = attendanceRecords.filter((a) => a.employeeId === currentEmployee?.id);
  const [clockedIn, setClockedIn] = useState(myAttendance.some((a) => a.checkIn && !a.checkOut));

  const todayRecord = myAttendance.find((a) => a.date === "2026-03-23");

  if (!currentEmployee) {
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
                <p className="text-sm text-muted-foreground">Hari ini, 23 Maret 2026</p>
                {todayRecord ? (
                  <p className="text-lg font-semibold">
                    Check In: {todayRecord.checkIn || "-"} | Check Out: {todayRecord.checkOut || "-"}
                  </p>
                ) : (
                  <p className="text-lg font-semibold text-muted-foreground">Belum absen</p>
                )}
              </div>
            </div>
            <div className="sm:ml-auto">
              {!clockedIn ? (
                <Button onClick={() => { setClockedIn(true); toast.success("Clock In berhasil — 08:00"); }}>
                  Clock In
                </Button>
              ) : (
                <Button variant="outline" onClick={() => { setClockedIn(false); toast.success("Clock Out berhasil — 17:00"); }}>
                  Clock Out
                </Button>
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
                  <p className="font-medium text-sm">{a.date}</p>
                  <StatusBadge status={a.status} />
                </div>
                <div className="grid grid-cols-2 gap-1 text-xs text-muted-foreground">
                  <span>Masuk: {a.checkIn || "-"}</span>
                  <span>Keluar: {a.checkOut || "-"}</span>
                  <span>Kerja: {a.workMinutes > 0 ? `${Math.floor(a.workMinutes / 60)}j ${a.workMinutes % 60}m` : "-"}</span>
                  <span>Lembur: {a.overtimeMinutes > 0 ? `${a.overtimeMinutes}m` : "-"}</span>
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
                    <TableCell>{a.date}</TableCell>
                    <TableCell>{a.checkIn || "-"}</TableCell>
                    <TableCell>{a.checkOut || "-"}</TableCell>
                    <TableCell>{a.lateMinutes > 0 ? `${a.lateMinutes} menit` : "-"}</TableCell>
                    <TableCell>{a.workMinutes > 0 ? `${Math.floor(a.workMinutes / 60)}j ${a.workMinutes % 60}m` : "-"}</TableCell>
                    <TableCell>{a.overtimeMinutes > 0 ? `${a.overtimeMinutes} menit` : "-"}</TableCell>
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
