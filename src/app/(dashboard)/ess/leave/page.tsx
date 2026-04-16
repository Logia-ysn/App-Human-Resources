"use client";

import { useState } from "react";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import { useAuth } from "@/components/providers/auth-context";
import { useLeaveRequests, useLeaveTypes, useLeaveBalances, useCreateLeaveRequest } from "@/hooks/use-leave";
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
import { CalendarDays, Plus, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { LoadingState } from "@/components/shared/loading-state";
import { EmptyRow } from "@/components/shared/empty-row";

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

  const { requests: myRequests, isLoading: reqLoading, mutate: mutateRequests } = useLeaveRequests({
    employeeId: employeeId ?? undefined,
  });
  const { leaveTypes, isLoading: typesLoading } = useLeaveTypes();
  const { balances: myBalances, isLoading: balLoading } = useLeaveBalances({
    employeeId: employeeId,
  });
  const createLeave = useCreateLeaveRequest();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState<LeaveFormData>(EMPTY_LEAVE_FORM);
  const [saving, setSaving] = useState(false);

  const activeLeaveTypes = leaveTypes.filter((lt) => lt.isActive);

  const isLoading = reqLoading || typesLoading || balLoading;

  function handleOpenDialog() {
    setForm(EMPTY_LEAVE_FORM);
    setDialogOpen(true);
  }

  async function handleSubmit() {
    if (!form.leaveTypeId || !form.startDate || !form.endDate || !form.reason.trim()) {
      toast.error("Semua field wajib diisi");
      return;
    }

    const totalDays = calculateDays(form.startDate, form.endDate);
    if (totalDays <= 0) {
      toast.error("Tanggal selesai harus setelah atau sama dengan tanggal mulai");
      return;
    }

    setSaving(true);
    try {
      await createLeave.trigger({
        leaveTypeId: form.leaveTypeId,
        startDate: form.startDate,
        endDate: form.endDate,
        totalDays,
        isHalfDay: false,
        reason: form.reason.trim(),
      });
      toast.success("Pengajuan cuti berhasil dikirim");
      setDialogOpen(false);
      await mutateRequests();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Gagal mengajukan cuti");
    } finally {
      setSaving(false);
    }
  }

  if (isLoading) {
    return (
      <LoadingState />
    );
  }

  if (!employeeId) {
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
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-4">
        <div className="flex items-center gap-2.5">
          <CalendarDays className="size-5 text-muted-foreground" strokeWidth={1.75} />
          <div>
            <h1 className="text-xl font-semibold tracking-tight">Cuti Saya</h1>
            <p className="text-xs text-muted-foreground">Riwayat dan pengajuan cuti Anda</p>
          </div>
        </div>
        <Button onClick={handleOpenDialog}>
          <Plus className="mr-1 h-4 w-4" />
          Ajukan Cuti
        </Button>
      </div>

      <div className="grid gap-4 grid-cols-2 md:grid-cols-3">
        {myBalances.map((b) => (
          <Card key={b.id}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{b.leaveType.name}</CardTitle>
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
                <div key={r.id} className="rounded-sm border border-border p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="font-medium text-sm">{r.leaveType.name}</p>
                    <StatusBadge status={r.status} />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {format(new Date(r.startDate), "dd MMM", { locale: idLocale })} — {format(new Date(r.endDate), "dd MMM yyyy", { locale: idLocale })} ({Number(r.totalDays)} hari)
                  </p>
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
                  <EmptyRow colSpan={5}>Belum ada pengajuan cuti.</EmptyRow>
                ) : (
                  myRequests.map((r) => (
                    <TableRow key={r.id}>
                      <TableCell>{r.leaveType.name}</TableCell>
                      <TableCell>
                        {format(new Date(r.startDate), "dd MMM", { locale: idLocale })} — {format(new Date(r.endDate), "dd MMM yyyy", { locale: idLocale })}
                      </TableCell>
                      <TableCell>{Number(r.totalDays)} hari</TableCell>
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
              {activeLeaveTypes.length === 0 ? (
                <div className="rounded-sm border border-dashed border-border p-3 text-xs text-muted-foreground">
                  Belum ada jenis cuti yang aktif. Hubungi admin HR untuk mengatur
                  jenis cuti di <span className="font-medium">Settings → Cuti</span>.
                </div>
              ) : (
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
              )}
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
            <Button onClick={handleSubmit} disabled={saving}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Ajukan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
