"use client";
import { LoadingState } from "@/components/shared/loading-state";

import { useState, useMemo } from "react";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import { Clock, CheckCircle, XCircle, AlertTriangle, Plus } from "lucide-react";
import { toast } from "sonner";

import { useAttendanceRecords, useOvertimeRequests } from "@/hooks/use-attendance";
import { useHolidays } from "@/hooks/use-holidays";
import { StatusBadge } from "@/components/shared/status-badge";
import { StatCard } from "@/components/shared/stat-card";

import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { EmptyRow } from "@/components/shared/empty-row";

const HOLIDAY_TYPE_LABELS: Record<string, string> = {
  NATIONAL: "Nasional",
  COMPANY: "Perusahaan",
  CUTI_BERSAMA: "Cuti Bersama",
};

function formatWorkHours(minutes: number | null): string {
  if (!minutes || minutes === 0) return "-";
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}j ${mins}m` : `${hours}j`;
}

function formatOvertimeDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours} jam ${mins} menit` : `${hours} jam`;
}

function formatTime(dateStr: string | Date | null): string {
  if (!dateStr) return "-";
  const d = new Date(dateStr);
  return format(d, "HH:mm");
}

export default function AttendancePage() {
  const today = new Date().toISOString().split("T")[0];

  const { records: todayRecords, isLoading: attendanceLoading } = useAttendanceRecords({
    startDate: today,
    endDate: today,
    limit: 100,
  });
  const { requests: overtimeList, isLoading: overtimeLoading } = useOvertimeRequests();
  const { holidays: holidayList, isLoading: holidaysLoading } = useHolidays();

  const [holidayDialogOpen, setHolidayDialogOpen] = useState(false);
  const [newHolidayName, setNewHolidayName] = useState("");
  const [newHolidayDate, setNewHolidayDate] = useState("");
  const [newHolidayType, setNewHolidayType] = useState<string>("NATIONAL");

  const summary = useMemo(() => {
    const hadir = todayRecords.filter(
      (r) => r.status === "PRESENT" || r.status === "LATE",
    ).length;
    const terlambat = todayRecords.filter((r) => r.status === "LATE").length;
    const tidakHadir = todayRecords.filter((r) => r.status === "ABSENT").length;
    const cutiSakitDinas = todayRecords.filter(
      (r) =>
        r.status === "LEAVE" ||
        r.status === "SICK" ||
        r.status === "BUSINESS_TRIP",
    ).length;
    return { hadir, terlambat, tidakHadir, cutiSakitDinas };
  }, [todayRecords]);

  const handleAddHoliday = () => {
    if (!newHolidayName.trim() || !newHolidayDate) return;
    // TODO: Call API to create holiday when endpoint is ready
    toast.info("Fitur tambah hari libur via API belum tersedia");
    setNewHolidayName("");
    setNewHolidayDate("");
    setNewHolidayType("NATIONAL");
    setHolidayDialogOpen(false);
  };

  const sortedHolidays = useMemo(
    () => [...holidayList].sort((a, b) =>
      new Date(a.date).getTime() - new Date(b.date).getTime()
    ),
    [holidayList],
  );

  const isLoading = attendanceLoading || overtimeLoading || holidaysLoading;

  if (isLoading) {
    return (
      <LoadingState />
    );
  }

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex items-center gap-2.5 border-b border-border pb-4">
        <Clock className="size-5 text-muted-foreground" strokeWidth={1.75} />
        <div>
          <h1 className="text-xl font-semibold tracking-tight">
            Manajemen Absensi
          </h1>
          <p className="text-xs text-muted-foreground">
            Kelola kehadiran, overtime, dan hari libur karyawan
          </p>
        </div>
      </div>

      <Tabs defaultValue="kehadiran">
        <TabsList>
          <TabsTrigger value="kehadiran">Kehadiran Hari Ini</TabsTrigger>
          <TabsTrigger value="overtime">Overtime</TabsTrigger>
          <TabsTrigger value="libur">Hari Libur</TabsTrigger>
        </TabsList>

        {/* Tab 1: Kehadiran Hari Ini */}
        <TabsContent value="kehadiran">
          <div className="space-y-4">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              <StatCard title="Hadir" value={summary.hadir} icon={CheckCircle} />
              <StatCard title="Terlambat" value={summary.terlambat} icon={Clock} />
              <StatCard title="Tidak Hadir" value={summary.tidakHadir} icon={XCircle} />
              <StatCard title="Cuti/Sakit/Dinas" value={summary.cutiSakitDinas} icon={AlertTriangle} />
            </div>

            {/* Mobile card view */}
            <div className="md:hidden space-y-3">
              {todayRecords.length === 0 ? (
                <Card className="p-4">
                  <p className="text-center text-sm text-muted-foreground">
                    Tidak ada data kehadiran hari ini.
                  </p>
                </Card>
              ) : (
                todayRecords.map((record) => (
                  <Card key={record.id} className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-sm">
                        {record.employee.firstName} {record.employee.lastName}
                      </span>
                      <StatusBadge status={record.status} />
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <p className="text-[11px] text-muted-foreground">Check In</p>
                        <p className="font-medium">{formatTime(record.checkIn)}</p>
                      </div>
                      <div>
                        <p className="text-[11px] text-muted-foreground">Check Out</p>
                        <p className="font-medium">{formatTime(record.checkOut)}</p>
                      </div>
                      <div>
                        <p className="text-[11px] text-muted-foreground">Jam Kerja</p>
                        <p className="font-medium">{formatWorkHours(record.workMinutes)}</p>
                      </div>
                      <div>
                        <p className="text-[11px] text-muted-foreground">Terlambat</p>
                        <p className="font-medium">
                          {record.lateMinutes && record.lateMinutes > 0 ? (
                            <span className="inline-flex items-center gap-1.5 rounded-sm border border-border bg-muted/60 px-2 py-0.5 text-[11px] font-medium">
                              <span className="h-1.5 w-1.5 rounded-full bg-[var(--warning)]" />
                              {record.lateMinutes} menit
                            </span>
                          ) : (
                            "-"
                          )}
                        </p>
                      </div>
                    </div>
                  </Card>
                ))
              )}
            </div>

            {/* Desktop table view */}
            <div className="hidden md:block">
              <Card className="shadow-sm">
                <CardContent className="px-0">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/50">
                        <TableHead>Nama</TableHead>
                        <TableHead>Check In</TableHead>
                        <TableHead>Check Out</TableHead>
                        <TableHead>Terlambat (menit)</TableHead>
                        <TableHead>Jam Kerja</TableHead>
                        <TableHead>Lembur</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {todayRecords.length === 0 ? (
                        <EmptyRow colSpan={7}>Tidak ada data kehadiran hari ini.</EmptyRow>
                      ) : (
                        todayRecords.map((record) => (
                          <TableRow key={record.id} className="hover:bg-muted/50">
                            <TableCell className="font-medium">
                              {record.employee.firstName} {record.employee.lastName}
                            </TableCell>
                            <TableCell>{formatTime(record.checkIn)}</TableCell>
                            <TableCell>{formatTime(record.checkOut)}</TableCell>
                            <TableCell>
                              {record.lateMinutes && record.lateMinutes > 0 ? (
                                <span className="inline-flex items-center gap-1.5 rounded-sm border border-border bg-muted/60 px-2 py-0.5 text-[11px] font-medium">
                                  <span className="h-1.5 w-1.5 rounded-full bg-[var(--warning)]" />
                                  {record.lateMinutes}
                                </span>
                              ) : (
                                "-"
                              )}
                            </TableCell>
                            <TableCell>
                              {formatWorkHours(record.workMinutes)}
                            </TableCell>
                            <TableCell>
                              {record.overtimeMinutes && record.overtimeMinutes > 0
                                ? formatWorkHours(record.overtimeMinutes)
                                : "-"}
                            </TableCell>
                            <TableCell>
                              <StatusBadge status={record.status} />
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Tab 2: Overtime */}
        <TabsContent value="overtime">
          {/* Mobile card view */}
          <div className="md:hidden space-y-3">
            {overtimeList.length === 0 ? (
              <Card className="p-4">
                <p className="text-center text-sm text-muted-foreground">
                  Tidak ada data overtime.
                </p>
              </Card>
            ) : (
              overtimeList.map((ot) => (
                <Card key={ot.id} className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-sm">
                      {ot.employee.firstName} {ot.employee.lastName}
                    </span>
                    <StatusBadge status={ot.status} />
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                    <div>
                      <p className="text-[11px] text-muted-foreground">Tanggal</p>
                      <p className="font-medium">
                        {format(new Date(ot.date), "dd MMM yyyy", { locale: idLocale })}
                      </p>
                    </div>
                    <div>
                      <p className="text-[11px] text-muted-foreground">Durasi</p>
                      <p className="font-medium">{formatOvertimeDuration(ot.plannedMinutes)}</p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-[11px] text-muted-foreground">Waktu</p>
                      <p className="font-medium">{ot.startTime} - {ot.endTime}</p>
                    </div>
                    {ot.reason && (
                      <div className="col-span-2">
                        <p className="text-[11px] text-muted-foreground">Alasan</p>
                        <p className="text-sm text-muted-foreground line-clamp-2">{ot.reason}</p>
                      </div>
                    )}
                  </div>
                  {ot.status !== "PENDING" && ot.approvedBy && (
                    <p className="text-xs text-muted-foreground pt-2 border-t">
                      oleh {ot.approvedBy.firstName} {ot.approvedBy.lastName}
                    </p>
                  )}
                </Card>
              ))
            )}
          </div>

          {/* Desktop table view */}
          <div className="hidden md:block">
            <Card className="shadow-sm">
              <CardContent className="px-0">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead>Nama</TableHead>
                      <TableHead>Tanggal</TableHead>
                      <TableHead>Waktu</TableHead>
                      <TableHead>Durasi</TableHead>
                      <TableHead>Alasan</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Diproses oleh</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {overtimeList.length === 0 ? (
                      <EmptyRow colSpan={7}>Tidak ada data overtime.</EmptyRow>
                    ) : (
                      overtimeList.map((ot) => (
                        <TableRow key={ot.id} className="hover:bg-muted/50">
                          <TableCell className="font-medium">
                            {ot.employee.firstName} {ot.employee.lastName}
                          </TableCell>
                          <TableCell>
                            {format(new Date(ot.date), "dd MMM yyyy", { locale: idLocale })}
                          </TableCell>
                          <TableCell>
                            {ot.startTime} - {ot.endTime}
                          </TableCell>
                          <TableCell>
                            {formatOvertimeDuration(ot.plannedMinutes)}
                          </TableCell>
                          <TableCell className="max-w-[200px] truncate">
                            {ot.reason ?? "-"}
                          </TableCell>
                          <TableCell>
                            <StatusBadge status={ot.status} />
                          </TableCell>
                          <TableCell className="text-right">
                            <span className="text-xs text-muted-foreground">
                              {ot.approvedBy
                                ? `${ot.approvedBy.firstName} ${ot.approvedBy.lastName}`
                                : "-"}
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
        </TabsContent>

        {/* Tab 3: Hari Libur */}
        <TabsContent value="libur">
          <div className="space-y-4">
            <div className="flex justify-end">
              <Dialog
                open={holidayDialogOpen}
                onOpenChange={setHolidayDialogOpen}
              >
                <DialogTrigger
                  render={
                    <Button>
                      <Plus data-icon="inline-start" />
                      Tambah Libur
                    </Button>
                  }
                />
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Tambah Hari Libur</DialogTitle>
                  </DialogHeader>
                  <div className="grid gap-4 py-2">
                    <div className="grid gap-2">
                      <Label htmlFor="holiday-name">Nama</Label>
                      <Input
                        id="holiday-name"
                        placeholder="Nama hari libur"
                        value={newHolidayName}
                        onChange={(e) => setNewHolidayName(e.target.value)}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="holiday-date">Tanggal</Label>
                      <Input
                        id="holiday-date"
                        type="date"
                        value={newHolidayDate}
                        onChange={(e) => setNewHolidayDate(e.target.value)}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label>Tipe</Label>
                      <Select
                        value={newHolidayType}
                        onValueChange={(val: string | null) =>
                          setNewHolidayType(val ?? "NATIONAL")
                        }
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Pilih tipe" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="NATIONAL">Nasional</SelectItem>
                          <SelectItem value="COMPANY">Perusahaan</SelectItem>
                          <SelectItem value="CUTI_BERSAMA">Cuti Bersama</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setHolidayDialogOpen(false)}>
                      Batal
                    </Button>
                    <Button
                      onClick={handleAddHoliday}
                      disabled={!newHolidayName.trim() || !newHolidayDate}
                    >
                      Simpan
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            {/* Mobile card view for holidays */}
            <div className="md:hidden space-y-3">
              {sortedHolidays.length === 0 ? (
                <Card className="p-4">
                  <p className="text-center text-sm text-muted-foreground">
                    Tidak ada data hari libur.
                  </p>
                </Card>
              ) : (
                sortedHolidays.map((holiday) => (
                  <Card key={holiday.id} className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-sm">{holiday.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(holiday.date), "dd MMMM yyyy", { locale: idLocale })}
                        </p>
                      </div>
                      <Badge variant="outline">
                        {HOLIDAY_TYPE_LABELS[holiday.type] ?? holiday.type}
                      </Badge>
                    </div>
                  </Card>
                ))
              )}
            </div>

            {/* Desktop table view for holidays */}
            <div className="hidden md:block">
              <Card className="shadow-sm">
                <CardContent className="px-0">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/50">
                        <TableHead>Nama</TableHead>
                        <TableHead>Tanggal</TableHead>
                        <TableHead>Tipe</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {sortedHolidays.length === 0 ? (
                        <EmptyRow colSpan={3}>Tidak ada data hari libur.</EmptyRow>
                      ) : (
                        sortedHolidays.map((holiday) => (
                          <TableRow key={holiday.id} className="hover:bg-muted/50">
                            <TableCell className="font-medium">{holiday.name}</TableCell>
                            <TableCell>
                              {format(new Date(holiday.date), "dd MMMM yyyy", { locale: idLocale })}
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline">
                                {HOLIDAY_TYPE_LABELS[holiday.type] ?? holiday.type}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
