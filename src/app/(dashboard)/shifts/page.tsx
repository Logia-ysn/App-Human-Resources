"use client";

import { useState, useMemo } from "react";
import { format, startOfWeek, addDays } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import { RefreshCw, Plus, Users, Clock } from "lucide-react";
import { toast } from "sonner";

import { useAppStore } from "@/lib/store/app-store";
import {
  type ShiftType,
  type ShiftAssignment,
} from "@/lib/dummy-data";
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
  DialogDescription,
  DialogFooter,
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

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const DAYS_SHORT = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"] as const;

const EMPTY_SHIFT: Omit<ShiftType, "id"> = {
  name: "",
  startTime: "08:00",
  endTime: "17:00",
  breakDuration: 60,
  color: "#3B82F6",
  isActive: true,
};

const EMPTY_ASSIGNMENT: Omit<ShiftAssignment, "id"> = {
  employeeId: "",
  employeeName: "",
  departmentName: "",
  shiftId: "",
  shiftName: "",
  startDate: "",
  endDate: null,
  isActive: true,
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getEmployeeCountForShift(
  assignments: ShiftAssignment[],
  shiftId: string,
): number {
  return assignments.filter((a) => a.shiftId === shiftId && a.isActive).length;
}

function getWeekDates(): Date[] {
  const monday = startOfWeek(new Date(), { weekStartsOn: 1 });
  return Array.from({ length: 7 }, (_, i) => addDays(monday, i));
}

function getShiftForDay(
  assignments: ShiftAssignment[],
  employeeId: string,
  _day: Date,
): ShiftAssignment | undefined {
  return assignments.find(
    (a) => a.employeeId === employeeId && a.isActive,
  );
}

// ---------------------------------------------------------------------------
// Employee list for assignment dialog
// ---------------------------------------------------------------------------
const AVAILABLE_EMPLOYEES = [
  { id: "emp-005", name: "Andi Prasetyo", department: "Information Technology" },
  { id: "emp-006", name: "Lina Marlina", department: "Operations" },
  { id: "emp-007", name: "Rina Wulandari", department: "Marketing" },
  { id: "emp-008", name: "Bambang Gunawan", department: "Operations" },
  { id: "emp-009", name: "Agus Setiawan", department: "Sales" },
  { id: "emp-012", name: "Wati Susanto", department: "Operations" },
  { id: "emp-013", name: "Hendra Wijaya", department: "Operations" },
];

// ---------------------------------------------------------------------------
// Page component
// ---------------------------------------------------------------------------

export default function ShiftsPage() {
  const shiftTypeList = useAppStore((s) => s.shiftTypes);
  const assignments = useAppStore((s) => s.shiftAssignments);
  const storeAddShiftType = useAppStore((s) => s.addShiftType);
  const storeAddShiftAssignment = useAppStore((s) => s.addShiftAssignment);

  // Dialogs
  const [shiftDialogOpen, setShiftDialogOpen] = useState(false);
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [newShift, setNewShift] =
    useState<Omit<ShiftType, "id">>(EMPTY_SHIFT);
  const [newAssignment, setNewAssignment] =
    useState<Omit<ShiftAssignment, "id">>(EMPTY_ASSIGNMENT);

  // Stats
  const stats = useMemo(() => {
    const totalTypes = shiftTypeList.length;
    const activeAssignments = assignments.filter((a) => a.isActive).length;
    const uniqueEmployees = new Set(
      assignments.filter((a) => a.isActive).map((a) => a.employeeId),
    ).size;
    return { totalTypes, activeAssignments, uniqueEmployees };
  }, [shiftTypeList, assignments]);

  // Roster data
  const weekDates = useMemo(() => getWeekDates(), []);
  const rosterEmployees = useMemo(() => {
    const uniqueIds = [
      ...new Set(assignments.filter((a) => a.isActive).map((a) => a.employeeId)),
    ];
    return uniqueIds.map((empId) => {
      const assignment = assignments.find(
        (a) => a.employeeId === empId && a.isActive,
      );
      return {
        employeeId: empId,
        employeeName: assignment?.employeeName ?? empId,
        assignment,
      };
    });
  }, [assignments]);

  // Handlers
  const handleAddShift = () => {
    if (!newShift.name.trim()) {
      toast.error("Nama shift wajib diisi");
      return;
    }

    const created: ShiftType = {
      ...newShift,
      id: `shift-${Date.now()}`,
    };

    storeAddShiftType(created);
    setNewShift(EMPTY_SHIFT);
    setShiftDialogOpen(false);
    toast.success(`Shift "${created.name}" berhasil ditambahkan`);
  };

  const handleAddAssignment = () => {
    if (!newAssignment.employeeId || !newAssignment.shiftId || !newAssignment.startDate) {
      toast.error("Karyawan, Shift, dan Tanggal Mulai wajib diisi");
      return;
    }

    const employee = AVAILABLE_EMPLOYEES.find(
      (e) => e.id === newAssignment.employeeId,
    );
    const shiftType = shiftTypeList.find(
      (s) => s.id === newAssignment.shiftId,
    );

    const created: ShiftAssignment = {
      ...newAssignment,
      id: `sa-${Date.now()}`,
      employeeName: employee?.name ?? "",
      departmentName: employee?.department ?? "",
      shiftName: shiftType?.name ?? "",
    };

    storeAddShiftAssignment(created);
    setNewAssignment(EMPTY_ASSIGNMENT);
    setAssignDialogOpen(false);
    toast.success(`Shift berhasil ditugaskan ke ${created.employeeName}`);
  };

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
            Manajemen Shift
          </h1>
          <p className="text-sm text-muted-foreground">
            Kelola tipe shift, penugasan, dan roster mingguan
          </p>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="shadow-sm border-l-4 border-l-blue-500">
          <CardContent>
            <div className="flex items-center gap-3">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-blue-100">
                <RefreshCw className="size-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Tipe Shift</p>
                <p className="text-2xl font-bold">{stats.totalTypes}</p>
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
                <p className="text-sm text-muted-foreground">
                  Penugasan Aktif
                </p>
                <p className="text-2xl font-bold">{stats.activeAssignments}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-l-4 border-l-purple-500">
          <CardContent>
            <div className="flex items-center gap-3">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-purple-100">
                <Users className="size-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">
                  Karyawan Bershift
                </p>
                <p className="text-2xl font-bold">{stats.uniqueEmployees}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="types">
        <TabsList>
          <TabsTrigger value="types">Tipe Shift</TabsTrigger>
          <TabsTrigger value="assignments">Penugasan Shift</TabsTrigger>
          <TabsTrigger value="roster">Roster Mingguan</TabsTrigger>
        </TabsList>

        {/* ==============================================================
            TAB 1 -- Tipe Shift
        ============================================================== */}
        <TabsContent value="types" className="space-y-4">
          <Card className="shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Daftar Tipe Shift</CardTitle>
              <Dialog open={shiftDialogOpen} onOpenChange={setShiftDialogOpen}>
                <DialogTrigger render={<Button />}>
                  <Plus data-icon="inline-start" />
                  Tambah Shift
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>Tambah Tipe Shift Baru</DialogTitle>
                    <DialogDescription>
                      Isi data shift yang akan ditambahkan.
                    </DialogDescription>
                  </DialogHeader>

                  <div className="grid gap-4 py-2">
                    <div className="grid gap-2">
                      <Label htmlFor="shift-name">Nama Shift</Label>
                      <Input
                        id="shift-name"
                        placeholder="Shift Pagi"
                        value={newShift.name}
                        onChange={(e) =>
                          setNewShift((prev) => ({
                            ...prev,
                            name: e.target.value,
                          }))
                        }
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="shift-start">Jam Mulai</Label>
                        <Input
                          id="shift-start"
                          type="time"
                          value={newShift.startTime}
                          onChange={(e) =>
                            setNewShift((prev) => ({
                              ...prev,
                              startTime: e.target.value,
                            }))
                          }
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="shift-end">Jam Selesai</Label>
                        <Input
                          id="shift-end"
                          type="time"
                          value={newShift.endTime}
                          onChange={(e) =>
                            setNewShift((prev) => ({
                              ...prev,
                              endTime: e.target.value,
                            }))
                          }
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="shift-break">Istirahat (menit)</Label>
                        <Input
                          id="shift-break"
                          type="number"
                          min={0}
                          value={newShift.breakDuration}
                          onChange={(e) =>
                            setNewShift((prev) => ({
                              ...prev,
                              breakDuration: Number(e.target.value),
                            }))
                          }
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="shift-color">Warna</Label>
                        <Input
                          id="shift-color"
                          type="color"
                          value={newShift.color}
                          onChange={(e) =>
                            setNewShift((prev) => ({
                              ...prev,
                              color: e.target.value,
                            }))
                          }
                          className="h-10 cursor-pointer"
                        />
                      </div>
                    </div>
                  </div>

                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => setShiftDialogOpen(false)}
                    >
                      Batal
                    </Button>
                    <Button onClick={handleAddShift}>Simpan</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardHeader>

            <CardContent className="px-0">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead>Nama Shift</TableHead>
                    <TableHead>Jam Kerja</TableHead>
                    <TableHead className="text-center">
                      Istirahat
                    </TableHead>
                    <TableHead className="text-center">Warna</TableHead>
                    <TableHead className="text-center">
                      Jumlah Karyawan
                    </TableHead>
                    <TableHead className="text-center">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {shiftTypeList.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={6}
                        className="h-24 text-center text-muted-foreground"
                      >
                        Tidak ada tipe shift.
                      </TableCell>
                    </TableRow>
                  ) : (
                    shiftTypeList.map((shift) => (
                      <TableRow key={shift.id} className="hover:bg-muted/50">
                        <TableCell className="font-medium">
                          {shift.name}
                        </TableCell>
                        <TableCell>
                          {shift.startTime} &ndash; {shift.endTime}
                        </TableCell>
                        <TableCell className="text-center">
                          {shift.breakDuration} menit
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex items-center justify-center gap-2">
                            <span
                              className="inline-block h-4 w-4 rounded-full border"
                              style={{ backgroundColor: shift.color }}
                            />
                            <span className="text-xs text-muted-foreground font-mono">
                              {shift.color}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge variant="outline">
                            {getEmployeeCountForShift(assignments, shift.id)}{" "}
                            orang
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          {shift.isActive ? (
                            <Badge
                              variant="outline"
                              className="bg-green-50 text-green-700 border-green-200"
                            >
                              Aktif
                            </Badge>
                          ) : (
                            <Badge
                              variant="outline"
                              className="bg-gray-50 text-gray-600 border-gray-200"
                            >
                              Nonaktif
                            </Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ==============================================================
            TAB 2 -- Penugasan Shift
        ============================================================== */}
        <TabsContent value="assignments" className="space-y-4">
          <Card className="shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Penugasan Shift Karyawan</CardTitle>
              <Dialog
                open={assignDialogOpen}
                onOpenChange={setAssignDialogOpen}
              >
                <DialogTrigger render={<Button />}>
                  <Plus data-icon="inline-start" />
                  Tugaskan Shift
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>Tugaskan Shift Baru</DialogTitle>
                    <DialogDescription>
                      Pilih karyawan dan shift yang akan ditugaskan.
                    </DialogDescription>
                  </DialogHeader>

                  <div className="grid gap-4 py-2">
                    <div className="grid gap-2">
                      <Label>Karyawan</Label>
                      <Select
                        value={newAssignment.employeeId}
                        onValueChange={(val: string | null) =>
                          setNewAssignment((prev) => ({
                            ...prev,
                            employeeId: val ?? "",
                          }))
                        }
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Pilih karyawan" />
                        </SelectTrigger>
                        <SelectContent>
                          {AVAILABLE_EMPLOYEES.map((emp) => (
                            <SelectItem key={emp.id} value={emp.id}>
                              {emp.name} - {emp.department}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="grid gap-2">
                      <Label>Tipe Shift</Label>
                      <Select
                        value={newAssignment.shiftId}
                        onValueChange={(val: string | null) =>
                          setNewAssignment((prev) => ({
                            ...prev,
                            shiftId: val ?? "",
                          }))
                        }
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Pilih shift" />
                        </SelectTrigger>
                        <SelectContent>
                          {shiftTypeList
                            .filter((s) => s.isActive)
                            .map((s) => (
                              <SelectItem key={s.id} value={s.id}>
                                {s.name} ({s.startTime} - {s.endTime})
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="assign-start">Tanggal Mulai</Label>
                        <Input
                          id="assign-start"
                          type="date"
                          value={newAssignment.startDate}
                          onChange={(e) =>
                            setNewAssignment((prev) => ({
                              ...prev,
                              startDate: e.target.value,
                            }))
                          }
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="assign-end">
                          Tanggal Selesai
                        </Label>
                        <Input
                          id="assign-end"
                          type="date"
                          value={newAssignment.endDate ?? ""}
                          onChange={(e) =>
                            setNewAssignment((prev) => ({
                              ...prev,
                              endDate: e.target.value || null,
                            }))
                          }
                        />
                      </div>
                    </div>
                  </div>

                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => setAssignDialogOpen(false)}
                    >
                      Batal
                    </Button>
                    <Button onClick={handleAddAssignment}>Simpan</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardHeader>

            <CardContent className="px-0">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead>Karyawan</TableHead>
                    <TableHead>Departemen</TableHead>
                    <TableHead>Tipe Shift</TableHead>
                    <TableHead>Tanggal Efektif</TableHead>
                    <TableHead>Tanggal Berakhir</TableHead>
                    <TableHead className="text-center">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {assignments.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={6}
                        className="h-24 text-center text-muted-foreground"
                      >
                        Tidak ada penugasan shift.
                      </TableCell>
                    </TableRow>
                  ) : (
                    assignments.map((sa) => (
                      <TableRow key={sa.id} className="hover:bg-muted/50">
                        <TableCell className="font-medium">
                          {sa.employeeName}
                        </TableCell>
                        <TableCell>{sa.departmentName}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span
                              className="inline-block h-3 w-3 rounded-full"
                              style={{
                                backgroundColor:
                                  shiftTypeList.find(
                                    (s) => s.id === sa.shiftId,
                                  )?.color ?? "#94A3B8",
                              }}
                            />
                            {sa.shiftName}
                          </div>
                        </TableCell>
                        <TableCell>
                          {format(
                            new Date(sa.startDate),
                            "dd MMM yyyy",
                            { locale: idLocale },
                          )}
                        </TableCell>
                        <TableCell>
                          {sa.endDate
                            ? format(
                                new Date(sa.endDate),
                                "dd MMM yyyy",
                                { locale: idLocale },
                              )
                            : "\u2014"}
                        </TableCell>
                        <TableCell className="text-center">
                          {sa.isActive ? (
                            <StatusBadge status="ACTIVE" />
                          ) : (
                            <StatusBadge status="CANCELLED" />
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ==============================================================
            TAB 3 -- Roster Mingguan
        ============================================================== */}
        <TabsContent value="roster" className="space-y-4">
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>
                Roster Minggu Ini &mdash;{" "}
                {format(weekDates[0], "dd MMM", { locale: idLocale })} s/d{" "}
                {format(weekDates[6], "dd MMM yyyy", { locale: idLocale })}
              </CardTitle>
            </CardHeader>
            <CardContent className="px-0">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="min-w-[160px]">Nama</TableHead>
                    {DAYS_SHORT.map((day, idx) => (
                      <TableHead key={day} className="text-center">
                        <div>{day}</div>
                        <div className="text-[10px] font-normal text-muted-foreground">
                          {format(weekDates[idx], "dd/MM")}
                        </div>
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rosterEmployees.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={8}
                        className="h-24 text-center text-muted-foreground"
                      >
                        Tidak ada data roster.
                      </TableCell>
                    </TableRow>
                  ) : (
                    rosterEmployees.map(({ employeeId, employeeName, assignment }) => {
                      const shiftType = assignment
                        ? shiftTypeList.find(
                            (s) => s.id === assignment.shiftId,
                          )
                        : undefined;

                      return (
                        <TableRow key={employeeId} className="hover:bg-muted/50">
                          <TableCell className="font-medium">
                            {employeeName}
                          </TableCell>
                          {weekDates.map((date, dayIdx) => {
                            const isWeekend = dayIdx >= 5;
                            const hasShift =
                              shiftType &&
                              !isWeekend &&
                              getShiftForDay(assignments, employeeId, date);

                            return (
                              <TableCell
                                key={dayIdx}
                                className="text-center p-1"
                              >
                                {hasShift ? (
                                  <div
                                    className="mx-auto rounded-md px-2 py-1.5 text-[11px] font-medium text-white"
                                    style={{
                                      backgroundColor: shiftType.color,
                                    }}
                                  >
                                    {shiftType.name.replace("Shift ", "")}
                                  </div>
                                ) : isWeekend ? (
                                  <span className="text-[11px] text-muted-foreground">
                                    Libur
                                  </span>
                                ) : (
                                  <span className="text-[11px] text-muted-foreground">
                                    &mdash;
                                  </span>
                                )}
                              </TableCell>
                            );
                          })}
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Legend */}
          <Card className="shadow-sm">
            <CardContent className="pt-4">
              <p className="text-sm font-medium text-muted-foreground mb-3">
                Keterangan Warna
              </p>
              <div className="flex flex-wrap gap-4">
                {shiftTypeList.map((shift) => (
                  <div key={shift.id} className="flex items-center gap-2">
                    <span
                      className="inline-block h-3 w-3 rounded-full"
                      style={{ backgroundColor: shift.color }}
                    />
                    <span className="text-sm">
                      {shift.name} ({shift.startTime} - {shift.endTime})
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
