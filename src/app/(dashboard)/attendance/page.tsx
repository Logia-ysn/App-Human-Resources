"use client";

import { useState, useMemo } from "react";
import { Clock, CheckCircle, XCircle, AlertTriangle, Plus } from "lucide-react";
import { toast } from "sonner";

import { useAppStore } from "@/lib/store/app-store";
import {
  type AttendanceRecord,
  type OvertimeRecord,
  type HolidayRecord,
} from "@/lib/dummy-data";
import { useAuth } from "@/components/providers/auth-context";
import { StatusBadge } from "@/components/shared/status-badge";

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

const HOLIDAY_TYPE_LABELS: Record<string, string> = {
  NATIONAL: "Nasional",
  COMPANY: "Perusahaan",
  CUTI_BERSAMA: "Cuti Bersama",
};

function formatWorkHours(minutes: number): string {
  if (minutes === 0) return "-";
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}j ${mins}m` : `${hours}j`;
}

function formatOvertimeDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours} jam ${mins} menit` : `${hours} jam`;
}

export default function AttendancePage() {
  const attendanceRecords = useAppStore((s) => s.attendanceRecords);
  const overtimeList = useAppStore((s) => s.overtimeRecords);
  const holidayList = useAppStore((s) => s.holidays);
  const updateOvertimeRecord = useAppStore((s) => s.updateOvertimeRecord);
  const addHoliday = useAppStore((s) => s.addHoliday);

  const { email } = useAuth();
  const [holidayDialogOpen, setHolidayDialogOpen] = useState(false);
  const [newHolidayName, setNewHolidayName] = useState("");
  const [newHolidayDate, setNewHolidayDate] = useState("");
  const [newHolidayType, setNewHolidayType] = useState<string>("NATIONAL");

  const today = new Date().toISOString().split("T")[0];

  const todayRecords = useMemo(
    () => attendanceRecords.filter((r) => r.date === today),
    [attendanceRecords, today],
  );

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

  const handleApproveOvertime = (id: string) => {
    updateOvertimeRecord(id, { status: "APPROVED" as const, approvedBy: email });
    toast.success("Overtime disetujui");
  };

  const handleRejectOvertime = (id: string) => {
    updateOvertimeRecord(id, { status: "REJECTED" as const, approvedBy: email });
    toast.error("Overtime ditolak");
  };

  const handleAddHoliday = () => {
    if (!newHolidayName.trim() || !newHolidayDate) return;

    const newHoliday: HolidayRecord = {
      id: `hol-${Date.now()}`,
      name: newHolidayName.trim(),
      date: newHolidayDate,
      type: newHolidayType as HolidayRecord["type"],
    };

    addHoliday(newHoliday);
    setNewHolidayName("");
    setNewHolidayDate("");
    setNewHolidayType("NATIONAL");
    setHolidayDialogOpen(false);
    toast.success("Hari libur berhasil ditambahkan");
  };

  const sortedHolidays = useMemo(
    () => [...holidayList].sort((a, b) => a.date.localeCompare(b.date)),
    [holidayList],
  );

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10">
          <Clock className="size-5 text-primary" />
        </div>
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
            Manajemen Absensi
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground">
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
            {/* Stat Cards - 2 col mobile, 4 col desktop */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              <Card className="p-3 sm:p-4 shadow-sm border-l-4 border-l-green-500">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-green-100">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  </div>
                  <div>
                    <p className="text-xl sm:text-2xl font-bold">{summary.hadir}</p>
                    <p className="text-[11px] sm:text-xs text-muted-foreground">Hadir</p>
                  </div>
                </div>
              </Card>

              <Card className="p-3 sm:p-4 shadow-sm border-l-4 border-l-yellow-500">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-yellow-100">
                    <Clock className="h-4 w-4 text-yellow-600" />
                  </div>
                  <div>
                    <p className="text-xl sm:text-2xl font-bold">{summary.terlambat}</p>
                    <p className="text-[11px] sm:text-xs text-muted-foreground">Terlambat</p>
                  </div>
                </div>
              </Card>

              <Card className="p-3 sm:p-4 shadow-sm border-l-4 border-l-red-500">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-red-100">
                    <XCircle className="h-4 w-4 text-red-600" />
                  </div>
                  <div>
                    <p className="text-xl sm:text-2xl font-bold">{summary.tidakHadir}</p>
                    <p className="text-[11px] sm:text-xs text-muted-foreground">Tidak Hadir</p>
                  </div>
                </div>
              </Card>

              <Card className="p-3 sm:p-4 shadow-sm border-l-4 border-l-blue-500">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-100">
                    <AlertTriangle className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-xl sm:text-2xl font-bold">{summary.cutiSakitDinas}</p>
                    <p className="text-[11px] sm:text-xs text-muted-foreground">Cuti/Sakit/Dinas</p>
                  </div>
                </div>
              </Card>
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
                      <span className="font-medium text-sm">{record.employeeName}</span>
                      <StatusBadge status={record.status} />
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <p className="text-[11px] text-muted-foreground">Check In</p>
                        <p className="font-medium">{record.checkIn ?? "-"}</p>
                      </div>
                      <div>
                        <p className="text-[11px] text-muted-foreground">Check Out</p>
                        <p className="font-medium">{record.checkOut ?? "-"}</p>
                      </div>
                      <div>
                        <p className="text-[11px] text-muted-foreground">Jam Kerja</p>
                        <p className="font-medium">{formatWorkHours(record.workMinutes)}</p>
                      </div>
                      <div>
                        <p className="text-[11px] text-muted-foreground">Terlambat</p>
                        <p className="font-medium">
                          {record.lateMinutes > 0 ? (
                            <Badge variant="outline" className="text-yellow-700 border-yellow-300 bg-yellow-50 text-xs">
                              {record.lateMinutes} menit
                            </Badge>
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
                        <TableRow>
                          <TableCell
                            colSpan={7}
                            className="h-24 text-center text-muted-foreground"
                          >
                            Tidak ada data kehadiran hari ini.
                          </TableCell>
                        </TableRow>
                      ) : (
                        todayRecords.map((record) => (
                          <TableRow key={record.id} className="hover:bg-muted/50">
                            <TableCell className="font-medium">
                              {record.employeeName}
                            </TableCell>
                            <TableCell>{record.checkIn ?? "-"}</TableCell>
                            <TableCell>{record.checkOut ?? "-"}</TableCell>
                            <TableCell>
                              {record.lateMinutes > 0 ? (
                                <Badge variant="outline" className="text-yellow-700 border-yellow-300 bg-yellow-50">
                                  {record.lateMinutes}
                                </Badge>
                              ) : (
                                "-"
                              )}
                            </TableCell>
                            <TableCell>
                              {formatWorkHours(record.workMinutes)}
                            </TableCell>
                            <TableCell>
                              {record.overtimeMinutes > 0
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
                    <span className="font-medium text-sm">{ot.employeeName}</span>
                    <StatusBadge status={ot.status} />
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                    <div>
                      <p className="text-[11px] text-muted-foreground">Tanggal</p>
                      <p className="font-medium">{ot.date}</p>
                    </div>
                    <div>
                      <p className="text-[11px] text-muted-foreground">Durasi</p>
                      <p className="font-medium">{formatOvertimeDuration(ot.plannedMinutes)}</p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-[11px] text-muted-foreground">Waktu</p>
                      <p className="font-medium">{ot.startTime} - {ot.endTime}</p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-[11px] text-muted-foreground">Alasan</p>
                      <p className="text-sm text-muted-foreground line-clamp-2">{ot.reason}</p>
                    </div>
                  </div>
                  {ot.status === "PENDING" && (
                    <div className="flex items-center gap-2 pt-2 border-t">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 text-green-700 border-green-300 bg-green-50 hover:bg-green-100"
                        onClick={() => handleApproveOvertime(ot.id)}
                      >
                        Approve
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 text-red-700 border-red-300 bg-red-50 hover:bg-red-100"
                        onClick={() => handleRejectOvertime(ot.id)}
                      >
                        Reject
                      </Button>
                    </div>
                  )}
                  {ot.status !== "PENDING" && ot.approvedBy && (
                    <p className="text-xs text-muted-foreground pt-2 border-t">
                      oleh {ot.approvedBy}
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
                      <TableHead className="text-right">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {overtimeList.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={7}
                          className="h-24 text-center text-muted-foreground"
                        >
                          Tidak ada data overtime.
                        </TableCell>
                      </TableRow>
                    ) : (
                      overtimeList.map((ot) => (
                        <TableRow key={ot.id} className="hover:bg-muted/50">
                          <TableCell className="font-medium">
                            {ot.employeeName}
                          </TableCell>
                          <TableCell>{ot.date}</TableCell>
                          <TableCell>
                            {ot.startTime} - {ot.endTime}
                          </TableCell>
                          <TableCell>
                            {formatOvertimeDuration(ot.plannedMinutes)}
                          </TableCell>
                          <TableCell className="max-w-[200px] truncate">
                            {ot.reason}
                          </TableCell>
                          <TableCell>
                            <StatusBadge status={ot.status} />
                          </TableCell>
                          <TableCell className="text-right">
                            {ot.status === "PENDING" ? (
                              <div className="flex items-center justify-end gap-1">
                                <Button
                                  variant="ghost"
                                  size="xs"
                                  className="text-green-700 hover:text-green-800 hover:bg-green-50"
                                  onClick={() => handleApproveOvertime(ot.id)}
                                >
                                  Approve
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="xs"
                                  className="text-red-700 hover:text-red-800 hover:bg-red-50"
                                  onClick={() => handleRejectOvertime(ot.id)}
                                >
                                  Reject
                                </Button>
                              </div>
                            ) : (
                              <span className="text-xs text-muted-foreground">
                                {ot.approvedBy ?? "-"}
                              </span>
                            )}
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
                          <SelectItem value="CUTI_BERSAMA">
                            Cuti Bersama
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setHolidayDialogOpen(false)}
                    >
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
                        <p className="text-xs text-muted-foreground">{holiday.date}</p>
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
                        <TableRow>
                          <TableCell
                            colSpan={3}
                            className="h-24 text-center text-muted-foreground"
                          >
                            Tidak ada data hari libur.
                          </TableCell>
                        </TableRow>
                      ) : (
                        sortedHolidays.map((holiday) => (
                          <TableRow key={holiday.id} className="hover:bg-muted/50">
                            <TableCell className="font-medium">
                              {holiday.name}
                            </TableCell>
                            <TableCell>{holiday.date}</TableCell>
                            <TableCell>
                              <Badge variant="outline">
                                {HOLIDAY_TYPE_LABELS[holiday.type] ??
                                  holiday.type}
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
