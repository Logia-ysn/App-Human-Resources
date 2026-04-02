"use client";

import { useState } from "react";
import { useAppStore } from "@/lib/store/app-store";
import { useAuth } from "@/components/providers/auth-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CalendarDays, Plus } from "lucide-react";
import { toast } from "sonner";

type LeaveFormData = {
  leaveTypeId: string;
  startDate: string;
  endDate: string;
  reason: string;
};

const EMPTY_LEAVE_FORM: LeaveFormData = {
  leaveTypeId: "",
  startDate: "",
  endDate: "",
  reason: "",
};

function calculateDays(start: string, end: string): number {
  if (!start || !end) return 0;
  const startMs = new Date(start).getTime();
  const endMs = new Date(end).getTime();
  if (endMs < startMs) return 0;
  return Math.round((endMs - startMs) / (1000 * 60 * 60 * 24)) + 1;
}

export default function EssLeavePage() {
  const { employeeId } = useAuth();
  const employees = useAppStore((s) => s.employees);
  const leaveBalances = useAppStore((s) => s.leaveBalances);
  const leaveRequests = useAppStore((s) => s.leaveRequests);
  const leaveTypes = useAppStore((s) => s.leaveTypes);
  const addLeaveRequest = useAppStore((s) => s.addLeaveRequest);

  const currentEmployee = employees.find((e) => e.id === employeeId);
  const myBalances = leaveBalances.filter((b) => b.employeeId === currentEmployee?.id);
  const myRequests = leaveRequests.filter((r) => r.employeeId === currentEmployee?.id);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState<LeaveFormData>(EMPTY_LEAVE_FORM);

  const activeLeaveTypes = leaveTypes.filter((lt) => lt.isActive);

  function handleOpenDialog() {
    setForm(EMPTY_LEAVE_FORM);
    setDialogOpen(true);
  }

  function handleSubmit() {
    if (!currentEmployee) {
      toast.error("Data karyawan tidak ditemukan. Tidak dapat mengajukan cuti.");
      return;
    }

    if (!form.leaveTypeId || !form.startDate || !form.endDate || !form.reason.trim()) {
      toast.error("Semua field wajib diisi");
      return;
    }

    const totalDays = calculateDays(form.startDate, form.endDate);
    if (totalDays <= 0) {
      toast.error("Tanggal selesai harus setelah atau sama dengan tanggal mulai");
      return;
    }

    const leaveType = leaveTypes.find((lt) => lt.id === form.leaveTypeId);
    const empName = `${currentEmployee.firstName} ${currentEmployee.lastName}`;

    addLeaveRequest({
      id: `lr-${Date.now()}`,
      employeeId: currentEmployee.id,
      employeeName: empName,
      departmentName: currentEmployee.departmentName ?? "",
      leaveTypeId: form.leaveTypeId,
      leaveTypeName: leaveType?.name ?? "",
      startDate: form.startDate,
      endDate: form.endDate,
      totalDays,
      reason: form.reason.trim(),
      status: "PENDING",
      createdAt: new Date().toISOString().slice(0, 10),
      approvedBy: null,
      approverNote: null,
    });

    toast.success("Pengajuan cuti berhasil dikirim");
    setDialogOpen(false);
  }

  if (!currentEmployee) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center space-y-2">
          <CalendarDays className="h-12 w-12 text-muted-foreground/40 mx-auto" />
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
      <div className="flex flex-wrap items-center justify-between">
        <h1 className="text-lg sm:text-2xl font-bold tracking-tight">Cuti Saya</h1>
        <Button onClick={handleOpenDialog}>
          <Plus className="mr-1 h-4 w-4" />
          Ajukan Cuti
        </Button>
      </div>

      <div className="grid gap-4 grid-cols-2 md:grid-cols-3">
        {myBalances.map((b) => (
          <Card key={b.id}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{b.leaveTypeName}</CardTitle>
              <CalendarDays className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{b.entitlement + b.carried - b.used - b.pending}</div>
              <p className="text-xs text-muted-foreground">
                Sisa dari {b.entitlement + b.carried} hari (terpakai {b.used}, pending {b.pending})
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader><CardTitle>Riwayat Pengajuan Cuti</CardTitle></CardHeader>
        <CardContent>
          {/* Mobile card view */}
          <div className="space-y-3 md:hidden">
            {myRequests.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">Belum ada pengajuan cuti.</div>
            ) : (
              myRequests.map((r) => (
                <div key={r.id} className="rounded-lg border p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="font-medium text-sm">{r.leaveTypeName}</p>
                    <StatusBadge status={r.status} />
                  </div>
                  <p className="text-xs text-muted-foreground">{r.startDate} — {r.endDate} ({r.totalDays} hari)</p>
                  <p className="text-xs text-muted-foreground line-clamp-2">{r.reason}</p>
                </div>
              ))
            )}
          </div>
          <div className="hidden md:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tipe Cuti</TableHead>
                  <TableHead>Tanggal</TableHead>
                  <TableHead>Jumlah Hari</TableHead>
                  <TableHead>Alasan</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {myRequests.length === 0 ? (
                  <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-8">Belum ada pengajuan cuti.</TableCell></TableRow>
                ) : (
                  myRequests.map((r) => (
                    <TableRow key={r.id}>
                      <TableCell>{r.leaveTypeName}</TableCell>
                      <TableCell>{r.startDate} — {r.endDate}</TableCell>
                      <TableCell>{r.totalDays} hari</TableCell>
                      <TableCell>{r.reason}</TableCell>
                      <TableCell><StatusBadge status={r.status} /></TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Dialog Ajukan Cuti */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Ajukan Cuti</DialogTitle>
            <DialogDescription>
              Isi form di bawah untuk mengajukan cuti baru.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-2">
            <div className="grid gap-2">
              <Label>Tipe Cuti</Label>
              <Select
                value={form.leaveTypeId || undefined}
                onValueChange={(val) =>
                  setForm((prev) => ({ ...prev, leaveTypeId: val as string }))
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Pilih tipe cuti" />
                </SelectTrigger>
                <SelectContent>
                  {activeLeaveTypes.map((lt) => (
                    <SelectItem key={lt.id} value={lt.id}>
                      {lt.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="leave-start">Tanggal Mulai</Label>
                <Input
                  id="leave-start"
                  type="date"
                  value={form.startDate}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, startDate: e.target.value }))
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="leave-end">Tanggal Selesai</Label>
                <Input
                  id="leave-end"
                  type="date"
                  value={form.endDate}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, endDate: e.target.value }))
                  }
                />
              </div>
            </div>

            {form.startDate && form.endDate && calculateDays(form.startDate, form.endDate) > 0 && (
              <p className="text-sm text-muted-foreground">
                Total: {calculateDays(form.startDate, form.endDate)} hari
              </p>
            )}

            <div className="grid gap-2">
              <Label htmlFor="leave-reason">Alasan</Label>
              <Textarea
                id="leave-reason"
                placeholder="Tuliskan alasan pengajuan cuti..."
                value={form.reason}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, reason: e.target.value }))
                }
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Batal
            </Button>
            <Button onClick={handleSubmit}>Ajukan</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
