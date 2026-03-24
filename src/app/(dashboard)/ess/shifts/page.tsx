"use client";

import { useMemo } from "react";
import {
  format,
  startOfWeek,
  addDays,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  getDay,
  isSameMonth,
  isToday,
} from "date-fns";
import { id as idLocale } from "date-fns/locale";
import { RefreshCw, Clock, CalendarDays, Sun } from "lucide-react";

import {
  shiftTypes,
  shiftAssignments,
  type ShiftType,
} from "@/lib/dummy-data";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const DEMO_EMPLOYEE_ID = "emp-006";

const DAYS_SHORT = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"] as const;
const CALENDAR_DAYS = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"] as const;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getMyShift(): { assignment: typeof shiftAssignments[0] | undefined; shiftType: ShiftType | undefined } {
  const assignment = shiftAssignments.find(
    (a) => a.employeeId === DEMO_EMPLOYEE_ID && a.isActive,
  );
  const shiftType = assignment
    ? shiftTypes.find((s) => s.id === assignment.shiftId)
    : undefined;
  return { assignment, shiftType };
}

function getWeekDates(): Date[] {
  const monday = startOfWeek(new Date(), { weekStartsOn: 1 });
  return Array.from({ length: 7 }, (_, i) => addDays(monday, i));
}

function getCalendarDays(date: Date): (Date | null)[] {
  const monthStart = startOfMonth(date);
  const monthEnd = endOfMonth(date);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Pad the beginning (Sunday = 0, Monday = 1, etc.)
  const startDayOfWeek = getDay(monthStart); // 0=Sun, 1=Mon, ...
  const padding: (Date | null)[] = Array.from(
    { length: startDayOfWeek },
    () => null,
  );

  return [...padding, ...days];
}

function isWeekend(date: Date): boolean {
  const day = getDay(date);
  return day === 0 || day === 6;
}

// ---------------------------------------------------------------------------
// Page component
// ---------------------------------------------------------------------------

export default function EssShiftsPage() {
  const { assignment, shiftType } = useMemo(() => getMyShift(), []);
  const weekDates = useMemo(() => getWeekDates(), []);
  const now = new Date();
  const calendarDays = useMemo(() => getCalendarDays(now), []);

  // Next shift: find the next weekday from today
  const nextShiftDate = useMemo(() => {
    const today = new Date();
    for (let i = 1; i <= 7; i++) {
      const candidate = addDays(today, i);
      if (!isWeekend(candidate)) return candidate;
    }
    return addDays(today, 1);
  }, []);

  // -----------------------------------------------------------------------
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10">
          <RefreshCw className="size-5 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Jadwal Shift Saya
          </h1>
          <p className="text-sm text-muted-foreground">
            Lihat jadwal shift dan roster mingguan Anda
          </p>
        </div>
      </div>

      {/* Current shift info */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="shadow-sm border-l-4 border-l-blue-500">
          <CardContent>
            <div className="flex items-center gap-3">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-blue-100">
                <RefreshCw className="size-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Shift Saat Ini</p>
                {shiftType ? (
                  <div className="flex items-center gap-2 mt-1">
                    <span
                      className="inline-block h-3 w-3 rounded-full"
                      style={{ backgroundColor: shiftType.color }}
                    />
                    <p className="text-lg font-bold">{shiftType.name}</p>
                  </div>
                ) : (
                  <p className="text-lg font-bold text-muted-foreground">
                    Tidak ada
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-l-4 border-l-green-500">
          <CardContent>
            <div className="flex items-center gap-3">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-green-100">
                <Clock className="size-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Jam Kerja</p>
                {shiftType ? (
                  <p className="text-lg font-bold">
                    {shiftType.startTime} &ndash; {shiftType.endTime}
                  </p>
                ) : (
                  <p className="text-lg font-bold text-muted-foreground">
                    &mdash;
                  </p>
                )}
                {shiftType && (
                  <p className="text-xs text-muted-foreground">
                    Istirahat {shiftType.breakDuration} menit
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-l-4 border-l-purple-500">
          <CardContent>
            <div className="flex items-center gap-3">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-purple-100">
                <CalendarDays className="size-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">
                  Shift Selanjutnya
                </p>
                <p className="text-lg font-bold">
                  {format(nextShiftDate, "EEEE", { locale: idLocale })}
                </p>
                <p className="text-xs text-muted-foreground">
                  {format(nextShiftDate, "dd MMM yyyy", { locale: idLocale })}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Period info */}
      {assignment && (
        <Card className="shadow-sm">
          <CardContent className="pt-5">
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">Berlaku mulai:</span>
                <Badge variant="outline">
                  {format(new Date(assignment.startDate), "dd MMM yyyy", {
                    locale: idLocale,
                  })}
                </Badge>
              </div>
              {assignment.endDate && (
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">Sampai:</span>
                  <Badge variant="outline">
                    {format(new Date(assignment.endDate), "dd MMM yyyy", {
                      locale: idLocale,
                    })}
                  </Badge>
                </div>
              )}
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">Departemen:</span>
                <Badge variant="outline">{assignment.departmentName}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="weekly">
        <TabsList>
          <TabsTrigger value="weekly">Jadwal Mingguan</TabsTrigger>
          <TabsTrigger value="monthly">Kalender Bulanan</TabsTrigger>
        </TabsList>

        {/* ==============================================================
            TAB 1 -- Jadwal Mingguan
        ============================================================== */}
        <TabsContent value="weekly" className="space-y-4">
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>
                Minggu Ini &mdash;{" "}
                {format(weekDates[0], "dd MMM", { locale: idLocale })} s/d{" "}
                {format(weekDates[6], "dd MMM yyyy", { locale: idLocale })}
              </CardTitle>
            </CardHeader>
            <CardContent className="px-0">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    {DAYS_SHORT.map((day, idx) => (
                      <TableHead key={day} className="text-center">
                        <div className="font-medium">{day}</div>
                        <div className="text-[10px] font-normal text-muted-foreground">
                          {format(weekDates[idx], "dd MMM", {
                            locale: idLocale,
                          })}
                        </div>
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    {weekDates.map((date, idx) => {
                      const weekend = isWeekend(date);
                      const today = isToday(date);

                      return (
                        <TableCell
                          key={idx}
                          className={`text-center p-2 ${today ? "bg-primary/5" : ""}`}
                        >
                          {weekend ? (
                            <div className="flex flex-col items-center gap-1 py-3">
                              <Sun className="h-4 w-4 text-muted-foreground/50" />
                              <span className="text-xs text-muted-foreground">
                                Libur
                              </span>
                            </div>
                          ) : shiftType ? (
                            <div className="flex flex-col items-center gap-1 py-2">
                              <div
                                className="rounded-md px-3 py-1.5 text-xs font-medium text-white"
                                style={{
                                  backgroundColor: shiftType.color,
                                }}
                              >
                                {shiftType.name}
                              </div>
                              <span className="text-[10px] text-muted-foreground">
                                {shiftType.startTime} - {shiftType.endTime}
                              </span>
                              {today && (
                                <Badge
                                  variant="outline"
                                  className="text-[9px] px-1.5 py-0 bg-primary/10 text-primary border-primary/20"
                                >
                                  Hari Ini
                                </Badge>
                              )}
                            </div>
                          ) : (
                            <div className="py-3 text-xs text-muted-foreground">
                              &mdash;
                            </div>
                          )}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ==============================================================
            TAB 2 -- Kalender Bulanan
        ============================================================== */}
        <TabsContent value="monthly" className="space-y-4">
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>
                {format(now, "MMMM yyyy", { locale: idLocale })}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* Day headers */}
              <div className="grid grid-cols-7 gap-1 mb-1">
                {CALENDAR_DAYS.map((day) => (
                  <div
                    key={day}
                    className="text-center text-xs font-medium text-muted-foreground py-2"
                  >
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar grid */}
              <div className="grid grid-cols-7 gap-1">
                {calendarDays.map((date, idx) => {
                  if (!date) {
                    return <div key={`empty-${idx}`} className="h-16" />;
                  }

                  const weekend = isWeekend(date);
                  const today = isToday(date);
                  const inCurrentMonth = isSameMonth(date, now);
                  const hasShift = shiftType && !weekend && inCurrentMonth;

                  return (
                    <div
                      key={idx}
                      className={`h-16 rounded-md border p-1 text-center ${
                        today
                          ? "border-primary bg-primary/5"
                          : weekend
                            ? "bg-muted/30 border-transparent"
                            : "border-muted"
                      }`}
                    >
                      <p
                        className={`text-xs font-medium ${
                          today
                            ? "text-primary"
                            : weekend
                              ? "text-muted-foreground/60"
                              : "text-foreground"
                        }`}
                      >
                        {format(date, "d")}
                      </p>
                      {hasShift ? (
                        <div
                          className="mt-0.5 rounded px-1 py-0.5 text-[9px] font-medium text-white truncate"
                          style={{ backgroundColor: shiftType.color }}
                        >
                          {shiftType.name.replace("Shift ", "")}
                        </div>
                      ) : weekend && inCurrentMonth ? (
                        <p className="mt-1 text-[9px] text-muted-foreground/50">
                          Libur
                        </p>
                      ) : null}
                    </div>
                  );
                })}
              </div>

              {/* Legend */}
              <div className="flex items-center gap-4 mt-4 pt-3 border-t">
                <p className="text-xs text-muted-foreground">Keterangan:</p>
                {shiftType && (
                  <div className="flex items-center gap-1.5">
                    <span
                      className="inline-block h-3 w-3 rounded"
                      style={{ backgroundColor: shiftType.color }}
                    />
                    <span className="text-xs">
                      {shiftType.name} ({shiftType.startTime} -{" "}
                      {shiftType.endTime})
                    </span>
                  </div>
                )}
                <div className="flex items-center gap-1.5">
                  <span className="inline-block h-3 w-3 rounded bg-muted" />
                  <span className="text-xs">Libur</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="inline-block h-3 w-3 rounded border-2 border-primary" />
                  <span className="text-xs">Hari Ini</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
