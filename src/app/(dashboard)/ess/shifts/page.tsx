"use client";
import { LoadingState } from "@/components/shared/loading-state";

import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import { Clock } from "lucide-react";

import { useAuth } from "@/components/providers/auth-context";
import { useShiftAssignments } from "@/hooks/use-shifts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { EmptyRow } from "@/components/shared/empty-row";

export default function EssShiftsPage() {
  const { employeeId } = useAuth();
  const { assignments, isLoading } = useShiftAssignments({
    employeeId: employeeId ?? undefined,
  });

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

  if (isLoading) {
    return (
      <LoadingState />
    );
  }

  const activeAssignment = assignments.find((a) => a.isActive);

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex items-center gap-2.5 border-b border-border pb-4">
        <Clock className="size-5 text-muted-foreground" strokeWidth={1.75} />
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Jadwal Shift Saya</h1>
          <p className="text-xs text-muted-foreground">
            Penugasan shift Anda saat ini dan riwayatnya
          </p>
        </div>
      </div>

      {activeAssignment && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Shift Aktif</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div
                className="h-12 w-1.5 rounded-full"
                style={{ backgroundColor: activeAssignment.shift.color }}
              />
              <div className="flex-1">
                <p className="text-lg font-semibold">{activeAssignment.shift.name}</p>
                <p className="text-sm text-muted-foreground">
                  {activeAssignment.shift.startTime} – {activeAssignment.shift.endTime}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Berlaku sejak{" "}
                  {format(new Date(activeAssignment.startDate), "dd MMM yyyy", {
                    locale: idLocale,
                  })}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Riwayat Penugasan</CardTitle>
        </CardHeader>
        <CardContent className="px-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead>Shift</TableHead>
                <TableHead>Jam Kerja</TableHead>
                <TableHead>Mulai</TableHead>
                <TableHead>Selesai</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {assignments.length === 0 ? (
                <EmptyRow colSpan={5}>Belum ada penugasan shift.</EmptyRow>
              ) : (
                assignments.map((a) => (
                  <TableRow key={a.id} className="hover:bg-muted/50">
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <div
                          className="h-2.5 w-2.5 rounded-full"
                          style={{ backgroundColor: a.shift.color }}
                        />
                        {a.shift.name}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">
                      {a.shift.startTime} – {a.shift.endTime}
                    </TableCell>
                    <TableCell className="text-sm">
                      {format(new Date(a.startDate), "dd MMM yyyy", { locale: idLocale })}
                    </TableCell>
                    <TableCell className="text-sm">
                      {a.endDate
                        ? format(new Date(a.endDate), "dd MMM yyyy", { locale: idLocale })
                        : "-"}
                    </TableCell>
                    <TableCell>
                      <span className="inline-flex items-center gap-1.5 rounded-sm border border-border bg-muted/60 px-2 py-0.5 text-[11px] font-medium">
                        <span className={`h-1.5 w-1.5 rounded-full ${a.isActive ? "bg-[var(--success)]" : "bg-muted-foreground/60"}`} />
                        {a.isActive ? "Aktif" : "Selesai"}
                      </span>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
