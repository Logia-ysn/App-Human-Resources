"use client";

import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import { CalendarClock, Clock } from "lucide-react";

import { useShiftTypes, useShiftAssignments } from "@/hooks/use-shifts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { LoadingState } from "@/components/shared/loading-state";
import { EmptyRow } from "@/components/shared/empty-row";

export default function ShiftsPage() {
  const { shiftTypes, isLoading: typesLoading } = useShiftTypes();
  const { assignments, isLoading: assignLoading } = useShiftAssignments();

  if (typesLoading || assignLoading) {
    return (
      <LoadingState />
    );
  }

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex items-center gap-2.5 border-b border-border pb-4">
        <CalendarClock className="size-5 text-muted-foreground" strokeWidth={1.75} />
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Manajemen Shift</h1>
          <p className="text-xs text-muted-foreground">
            Kelola jenis shift dan penugasan karyawan
          </p>
        </div>
      </div>

      <Tabs defaultValue="types">
        <TabsList>
          <TabsTrigger value="types">Jenis Shift</TabsTrigger>
          <TabsTrigger value="assignments">Penugasan</TabsTrigger>
        </TabsList>

        <TabsContent value="types">
          <Card>
            <CardHeader>
              <CardTitle>Jenis Shift</CardTitle>
            </CardHeader>
            <CardContent className="px-0">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead>Nama</TableHead>
                    <TableHead>Jam Masuk</TableHead>
                    <TableHead>Jam Pulang</TableHead>
                    <TableHead className="text-center">Istirahat (menit)</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {shiftTypes.length === 0 ? (
                    <EmptyRow colSpan={5}>Belum ada jenis shift. Tambahkan melalui Prisma Studio.</EmptyRow>
                  ) : (
                    shiftTypes.map((s) => (
                      <TableRow key={s.id} className="hover:bg-muted/50">
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span
                              className="inline-block h-3 w-3 rounded-full"
                              style={{ backgroundColor: s.color }}
                            />
                            <span className="font-medium">{s.name}</span>
                          </div>
                        </TableCell>
                        <TableCell className="font-mono">
                          <Clock className="inline h-3.5 w-3.5 mr-1 text-muted-foreground" />
                          {s.startTime}
                        </TableCell>
                        <TableCell className="font-mono">{s.endTime}</TableCell>
                        <TableCell className="text-center">{s.breakDuration}</TableCell>
                        <TableCell>
                          <span className="inline-flex items-center gap-1.5 rounded-sm border border-border bg-muted/60 px-2 py-0.5 text-[11px] font-medium">
                            <span className={`h-1.5 w-1.5 rounded-full ${s.isActive ? "bg-[var(--success)]" : "bg-muted-foreground/60"}`} />
                            {s.isActive ? "Aktif" : "Nonaktif"}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="assignments">
          <Card>
            <CardHeader>
              <CardTitle>Penugasan Shift</CardTitle>
            </CardHeader>
            <CardContent className="px-0">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead>Karyawan</TableHead>
                    <TableHead>Departemen</TableHead>
                    <TableHead>Shift</TableHead>
                    <TableHead>Jam</TableHead>
                    <TableHead>Mulai</TableHead>
                    <TableHead>Berakhir</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {assignments.length === 0 ? (
                    <EmptyRow colSpan={7}>Belum ada penugasan shift.</EmptyRow>
                  ) : (
                    assignments.map((a) => (
                      <TableRow key={a.id} className="hover:bg-muted/50">
                        <TableCell className="font-medium">
                          {a.employee.firstName} {a.employee.lastName}
                          <div className="text-xs text-muted-foreground font-mono">
                            {a.employee.employeeNumber}
                          </div>
                        </TableCell>
                        <TableCell>{a.employee.department.name}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span
                              className="inline-block h-2.5 w-2.5 rounded-full"
                              style={{ backgroundColor: a.shift.color }}
                            />
                            {a.shift.name}
                          </div>
                        </TableCell>
                        <TableCell className="font-mono text-sm">
                          {a.shift.startTime} - {a.shift.endTime}
                        </TableCell>
                        <TableCell>
                          {format(new Date(a.startDate), "dd MMM yyyy", { locale: idLocale })}
                        </TableCell>
                        <TableCell>
                          {a.endDate
                            ? format(new Date(a.endDate), "dd MMM yyyy", { locale: idLocale })
                            : "-"}
                        </TableCell>
                        <TableCell>
                          <span className="inline-flex items-center gap-1.5 rounded-sm border border-border bg-muted/60 px-2 py-0.5 text-[11px] font-medium">
                            <span className={`h-1.5 w-1.5 rounded-full ${a.isActive ? "bg-[var(--success)]" : "bg-muted-foreground/60"}`} />
                            {a.isActive ? "Aktif" : "Berakhir"}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
