"use client";

import { useState, useMemo } from "react";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import {
  CalendarDays,
  Clock,
  CheckCircle2,
  XCircle,
  Plus,
  FileText,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";

import {
  useLeaveRequests,
  useLeaveTypes,
  useLeaveBalances,
  useCreateLeaveType,
} from "@/hooks/use-leave";
import { useEmployees } from "@/hooks/use-employees";
import { apiClient } from "@/lib/api-client";
import { StatusBadge } from "@/components/shared/status-badge";
import { StatCard } from "@/components/shared/stat-card";

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
import { Textarea } from "@/components/ui/textarea";
import { LoadingState } from "@/components/shared/loading-state";
import { EmptyRow } from "@/components/shared/empty-row";

const STATUS_OPTIONS = [
  { value: "ALL", label: "Semua Status" },
  { value: "PENDING", label: "Menunggu" },
  { value: "APPROVED", label: "Disetujui" },
  { value: "REJECTED", label: "Ditolak" },
  { value: "CANCELLED", label: "Dibatalkan" },
];

type LeaveTypeForm = {
  name: string;
  code: string;
  defaultQuota: number;
  isPaid: boolean;
  isCarryOver: boolean;
  maxCarryOver: number;
  requiresDoc: boolean;
  allowHalfDay: boolean;
  isActive: boolean;
};

type GenerateForm = {
  year: number;
  employeeId: string;
  leaveTypeId: string;
  carryOverFromPrevYear: boolean;
};

const CURRENT_YEAR = new Date().getFullYear();
const EMPTY_GENERATE: GenerateForm = {
  year: CURRENT_YEAR,
  employeeId: "ALL",
  leaveTypeId: "ALL",
  carryOverFromPrevYear: false,
};

const EMPTY_LEAVE_TYPE: LeaveTypeForm = {
  name: "",
  code: "",
  defaultQuota: 12,
  isPaid: true,
  isCarryOver: false,
  maxCarryOver: 0,
  requiresDoc: false,
  allowHalfDay: false,
  isActive: true,
};

export default function LeavePage() {
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newType, setNewType] = useState<LeaveTypeForm>(EMPTY_LEAVE_TYPE);
  const [genOpen, setGenOpen] = useState(false);
  const [genForm, setGenForm] = useState<GenerateForm>(EMPTY_GENERATE);
  const [generating, setGenerating] = useState(false);
  const { requests, isLoading: requestsLoading, mutate: mutateRequests } = useLeaveRequests({
    status: statusFilter !== "ALL" ? statusFilter : undefined,
  });
  const { leaveTypes: types, isLoading: typesLoading, mutate: mutateTypes } = useLeaveTypes();
  const { trigger: triggerCreateLeaveType, isMutating: creatingLeaveType } = useCreateLeaveType();
  const { balances: leaveBalances, isLoading: balancesLoading, mutate: mutateBalances } = useLeaveBalances();
  const { employees: allEmployees } = useEmployees({ limit: 200, status: "ACTIVE" });

  const stats = useMemo(() => {
    const total = requests.length;
    const pending = requests.filter((r) => r.status === "PENDING").length;
    const approved = requests.filter((r) => r.status === "APPROVED").length;
    const rejected = requests.filter((r) => r.status === "REJECTED").length;
    return { total, pending, approved, rejected };
  }, [requests]);

  const handleStatusFilterChange = (value: string | null) => {
    setStatusFilter(value ?? "ALL");
  };

  async function handleApprove(id: string) {
    try {
      await apiClient(`/api/leave/requests/${id}/approve`, { method: "PATCH", body: { status: "APPROVED" } });
      toast.success("Pengajuan cuti berhasil disetujui");
      await mutateRequests();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Gagal menyetujui");
    }
  }

  async function handleReject(id: string) {
    try {
      await apiClient(`/api/leave/requests/${id}/approve`, { method: "PATCH", body: { status: "REJECTED" } });
      toast.error("Pengajuan cuti ditolak");
      await mutateRequests();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Gagal menolak");
    }
  }

  async function handleGenerateBalances() {
    setGenerating(true);
    try {
      const res = await apiClient<{ created: number; skipped: number }>(
        "/api/leave/balances/generate",
        {
          method: "POST",
          body: {
            year: genForm.year,
            employeeId: genForm.employeeId === "ALL" ? undefined : genForm.employeeId,
            leaveTypeId: genForm.leaveTypeId === "ALL" ? undefined : genForm.leaveTypeId,
            carryOverFromPrevYear: genForm.carryOverFromPrevYear,
          },
        },
      );
      toast.success(`Berhasil: ${res.created} dibuat, ${res.skipped} dilewati`);
      setGenOpen(false);
      setGenForm(EMPTY_GENERATE);
      await mutateBalances();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Gagal generate saldo");
    } finally {
      setGenerating(false);
    }
  }

  const handleAddType = async () => {
    if (!newType.name.trim() || !newType.code.trim()) {
      toast.error("Nama dan Kode wajib diisi");
      return;
    }
    try {
      await triggerCreateLeaveType({
        name: newType.name.trim(),
        code: newType.code.trim().toUpperCase(),
        defaultQuota: newType.defaultQuota,
        isPaid: newType.isPaid,
        isCarryOver: newType.isCarryOver,
        maxCarryOver: newType.maxCarryOver,
        requiresDoc: newType.requiresDoc,
        allowHalfDay: newType.allowHalfDay,
        isActive: newType.isActive,
      });
      toast.success("Tipe cuti berhasil ditambahkan");
      await mutateTypes();
      setNewType(EMPTY_LEAVE_TYPE);
      setDialogOpen(false);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Gagal menambah tipe cuti");
    }
  };

  const computeRemaining = (b: { entitlement: number; carried: number; used: number; pending: number }) =>
    Math.max(0, b.entitlement + b.carried - b.used - b.pending);

  const isLoading = requestsLoading || typesLoading || balancesLoading;

  if (isLoading) {
    return (
      <LoadingState />
    );
  }

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex items-center gap-2.5 border-b border-border pb-4">
        <CalendarDays className="size-5 text-muted-foreground" strokeWidth={1.75} />
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Manajemen Cuti</h1>
          <p className="text-xs text-muted-foreground">
            Kelola pengajuan, saldo, dan tipe cuti karyawan
          </p>
        </div>
      </div>

      <Tabs defaultValue="requests">
        <TabsList>
          <TabsTrigger value="requests">Pengajuan Cuti</TabsTrigger>
          <TabsTrigger value="balances">Saldo Cuti</TabsTrigger>
          <TabsTrigger value="types">Tipe Cuti</TabsTrigger>
        </TabsList>

        {/* TAB 1 — Pengajuan Cuti */}
        <TabsContent value="requests" className="space-y-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <StatCard title="Total Pengajuan" value={stats.total} icon={FileText} />
            <StatCard title="Menunggu" value={stats.pending} icon={Clock} />
            <StatCard title="Disetujui" value={stats.approved} icon={CheckCircle2} />
            <StatCard title="Ditolak" value={stats.rejected} icon={XCircle} />
          </div>

          <Card className="shadow-sm">
            <CardContent>
              <div className="flex items-center gap-4">
                <Select value={statusFilter} onValueChange={handleStatusFilterChange}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter Status" />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUS_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Mobile card view */}
          <div className="md:hidden space-y-3">
            {requests.length === 0 ? (
              <Card className="p-4">
                <p className="text-center text-sm text-muted-foreground">
                  Tidak ada pengajuan cuti ditemukan.
                </p>
              </Card>
            ) : (
              requests.map((req) => (
                <Card key={req.id} className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-sm">
                      {req.employee.firstName} {req.employee.lastName}
                    </span>
                    <StatusBadge status={req.status} />
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                    <div>
                      <p className="text-[11px] text-muted-foreground">Tipe Cuti</p>
                      <p className="font-medium">{req.leaveType.name}</p>
                    </div>
                    <div>
                      <p className="text-[11px] text-muted-foreground">Jumlah</p>
                      <p className="font-medium">{Number(req.totalDays)} hari</p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-[11px] text-muted-foreground">Tanggal</p>
                      <p className="font-medium">
                        {format(new Date(req.startDate), "dd MMM", { locale: idLocale })}
                        {" "}&ndash;{" "}
                        {format(new Date(req.endDate), "dd MMM yyyy", { locale: idLocale })}
                      </p>
                    </div>
                  </div>
                  {req.status === "PENDING" && (
                    <div className="flex items-center gap-2 pt-2 border-t">
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1"
                        onClick={() => handleApprove(req.id)}
                      >
                        <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                        Setujui
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        className="flex-1"
                        onClick={() => handleReject(req.id)}
                      >
                        <XCircle className="h-3.5 w-3.5 mr-1" />
                        Tolak
                      </Button>
                    </div>
                  )}
                  {req.status !== "PENDING" && req.approverNote && (
                    <p className="text-xs text-muted-foreground pt-2 border-t">
                      {req.approverNote}
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
                      <TableHead>Departemen</TableHead>
                      <TableHead>Tipe Cuti</TableHead>
                      <TableHead>Tanggal</TableHead>
                      <TableHead>Jumlah Hari</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {requests.length === 0 ? (
                      <EmptyRow colSpan={7}>Tidak ada pengajuan cuti ditemukan.</EmptyRow>
                    ) : (
                      requests.map((req) => (
                        <TableRow key={req.id} className="hover:bg-muted/50">
                          <TableCell className="font-medium">
                            {req.employee.firstName} {req.employee.lastName}
                          </TableCell>
                          <TableCell>{req.employee.department.name}</TableCell>
                          <TableCell>{req.leaveType.name}</TableCell>
                          <TableCell>
                            {format(new Date(req.startDate), "dd MMM", { locale: idLocale })}
                            {" "}&ndash;{" "}
                            {format(new Date(req.endDate), "dd MMM yyyy", { locale: idLocale })}
                          </TableCell>
                          <TableCell>{Number(req.totalDays)} hari</TableCell>
                          <TableCell>
                            <StatusBadge status={req.status} />
                          </TableCell>
                          <TableCell className="text-right">
                            {req.status === "PENDING" ? (
                              <div className="flex items-center justify-end gap-1">
                                <Button
                                  size="xs"
                                  variant="outline"
                                  onClick={() => handleApprove(req.id)}
                                >
                                  <CheckCircle2 data-icon="inline-start" />
                                  Setujui
                                </Button>
                                <Button
                                  size="xs"
                                  variant="destructive"
                                  onClick={() => handleReject(req.id)}
                                >
                                  <XCircle data-icon="inline-start" />
                                  Tolak
                                </Button>
                              </div>
                            ) : (
                              <span className="text-xs text-muted-foreground">
                                {req.approverNote ?? "\u2014"}
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

        {/* TAB 2 — Saldo Cuti */}
        <TabsContent value="balances" className="space-y-4">
          <div className="flex justify-end">
            <Dialog open={genOpen} onOpenChange={setGenOpen}>
              <DialogTrigger render={<Button />}>
                <Plus data-icon="inline-start" />
                Generate Saldo
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Generate Saldo Cuti</DialogTitle>
                  <DialogDescription>
                    Buat saldo cuti untuk semua atau satu karyawan berdasarkan kuota default tipe cuti.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-2">
                  <div className="grid gap-2">
                    <Label htmlFor="gen-year">Tahun</Label>
                    <Input
                      id="gen-year"
                      type="number"
                      min={2000}
                      max={2100}
                      value={genForm.year}
                      onChange={(e) =>
                        setGenForm((p) => ({ ...p, year: Number(e.target.value) }))
                      }
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label>Karyawan</Label>
                    <Select
                      value={genForm.employeeId}
                      items={{
                        ALL: "Semua Karyawan Aktif",
                        ...Object.fromEntries(
                          allEmployees.map((emp) => [
                            emp.id,
                            `${emp.employeeNumber} — ${emp.firstName} ${emp.lastName}`,
                          ])
                        ),
                      }}
                      onValueChange={(v: string | null) =>
                        setGenForm((p) => ({ ...p, employeeId: v ?? "ALL" }))
                      }
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ALL">Semua Karyawan Aktif</SelectItem>
                        {allEmployees.map((emp) => (
                          <SelectItem key={emp.id} value={emp.id}>
                            {emp.employeeNumber} — {emp.firstName} {emp.lastName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label>Tipe Cuti</Label>
                    <Select
                      value={genForm.leaveTypeId}
                      items={{
                        ALL: "Semua Tipe Aktif",
                        ...Object.fromEntries(
                          types
                            .filter((t) => t.isActive)
                            .map((t) => [t.id, `${t.name} (${t.defaultQuota} hari)`])
                        ),
                      }}
                      onValueChange={(v: string | null) =>
                        setGenForm((p) => ({ ...p, leaveTypeId: v ?? "ALL" }))
                      }
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ALL">Semua Tipe Aktif</SelectItem>
                        {types
                          .filter((t) => t.isActive)
                          .map((t) => (
                            <SelectItem key={t.id} value={t.id}>
                              {t.name} ({t.defaultQuota} hari)
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label>Carry Over dari tahun sebelumnya</Label>
                    <Select
                      value={genForm.carryOverFromPrevYear ? "true" : "false"}
                      onValueChange={(v: string | null) =>
                        setGenForm((p) => ({
                          ...p,
                          carryOverFromPrevYear: v === "true",
                        }))
                      }
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="false">Tidak</SelectItem>
                        <SelectItem value="true">Ya (jika tipe mendukung)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Saldo yang sudah ada akan dilewati — tidak akan ditimpa.
                  </p>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setGenOpen(false)}>
                    Batal
                  </Button>
                  <Button onClick={handleGenerateBalances} disabled={generating}>
                    {generating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Generate
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          {/* Mobile card grid */}
          <div className="md:hidden space-y-3">
            {leaveBalances.length === 0 ? (
              <Card className="p-4">
                <p className="text-center text-sm text-muted-foreground">
                  Tidak ada data saldo cuti.
                </p>
              </Card>
            ) : (
              leaveBalances.map((bal) => {
                const remaining = computeRemaining(bal);
                const totalPool = bal.entitlement + bal.carried;
                const usedPercentage =
                  totalPool > 0
                    ? Math.round(((totalPool - remaining) / totalPool) * 100)
                    : 0;

                return (
                  <Card key={bal.id} className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <p className="font-medium text-sm">
                          {bal.employee.firstName} {bal.employee.lastName}
                        </p>
                        <p className="text-xs text-muted-foreground">{bal.leaveType.name}</p>
                      </div>
                      <div className="text-right">
                        <span className={`text-lg font-bold ${remaining <= 2 ? "text-destructive" : ""}`}>
                          {remaining}
                        </span>
                        <p className="text-[11px] text-muted-foreground">sisa hari</p>
                      </div>
                    </div>
                    <div className="h-2 w-full rounded-full bg-muted mb-2">
                      <div
                        className={`h-2 rounded-full transition-all ${
                          usedPercentage >= 80
                            ? "bg-destructive"
                            : usedPercentage >= 50
                              ? "bg-[var(--warning)]"
                              : "bg-[var(--success)]"
                        }`}
                        style={{ width: `${Math.min(usedPercentage, 100)}%` }}
                      />
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-center text-xs">
                      <div>
                        <p className="font-semibold">{bal.entitlement}</p>
                        <p className="text-[11px] text-muted-foreground">Hak</p>
                      </div>
                      <div>
                        <p className="font-semibold">{bal.used}</p>
                        <p className="text-[11px] text-muted-foreground">Digunakan</p>
                      </div>
                      <div>
                        <p className="font-semibold">
                          {bal.pending > 0 ? (
                            <span className="inline-flex items-center gap-1.5 rounded-sm border border-border bg-muted/60 px-1.5 py-0.5 text-[11px] font-medium">
                              <span className="h-1.5 w-1.5 rounded-full bg-[var(--warning)]" />
                              {bal.pending}
                            </span>
                          ) : (
                            bal.pending
                          )}
                        </p>
                        <p className="text-[11px] text-muted-foreground">Pending</p>
                      </div>
                    </div>
                  </Card>
                );
              })
            )}
          </div>

          {/* Desktop table view */}
          <div className="hidden md:block">
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle>Saldo Cuti Karyawan</CardTitle>
              </CardHeader>
              <CardContent className="px-0">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead>Nama</TableHead>
                      <TableHead>Tipe Cuti</TableHead>
                      <TableHead className="text-center">Hak</TableHead>
                      <TableHead className="text-center">Sisa Tahun Lalu</TableHead>
                      <TableHead className="text-center">Digunakan</TableHead>
                      <TableHead className="text-center">Pending</TableHead>
                      <TableHead className="text-center">Sisa</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {leaveBalances.length === 0 ? (
                      <EmptyRow colSpan={7}>Tidak ada data saldo cuti.</EmptyRow>
                    ) : (
                      leaveBalances.map((bal) => {
                        const remaining = computeRemaining(bal);
                        const totalPool = bal.entitlement + bal.carried;
                        const usedPercentage =
                          totalPool > 0
                            ? Math.round(((totalPool - remaining) / totalPool) * 100)
                            : 0;

                        return (
                          <TableRow key={bal.id} className="hover:bg-muted/50">
                            <TableCell className="font-medium">
                              {bal.employee.firstName} {bal.employee.lastName}
                            </TableCell>
                            <TableCell>{bal.leaveType.name}</TableCell>
                            <TableCell className="text-center">{bal.entitlement}</TableCell>
                            <TableCell className="text-center">{bal.carried}</TableCell>
                            <TableCell className="text-center">{bal.used}</TableCell>
                            <TableCell className="text-center">
                              {bal.pending > 0 ? (
                                <span className="inline-flex items-center gap-1.5 rounded-sm border border-border bg-muted/60 px-2 py-0.5 text-[11px] font-medium">
                                  <span className="h-1.5 w-1.5 rounded-full bg-[var(--warning)]" />
                                  {bal.pending}
                                </span>
                              ) : (
                                bal.pending
                              )}
                            </TableCell>
                            <TableCell className="text-center">
                              <div className="flex flex-col items-center gap-1">
                                <span className={remaining <= 2 ? "font-bold text-destructive" : "font-bold"}>
                                  {remaining}
                                </span>
                                <div className="h-1.5 w-16 rounded-full bg-muted">
                                  <div
                                    className={`h-1.5 rounded-full transition-all ${
                                      usedPercentage >= 80
                                        ? "bg-destructive"
                                        : usedPercentage >= 50
                                          ? "bg-[var(--warning)]"
                                          : "bg-[var(--success)]"
                                    }`}
                                    style={{ width: `${Math.min(usedPercentage, 100)}%` }}
                                  />
                                </div>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* TAB 3 — Tipe Cuti */}
        <TabsContent value="types" className="space-y-4">
          <Card className="shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Daftar Tipe Cuti</CardTitle>
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger render={<Button />}>
                  <Plus data-icon="inline-start" />
                  Tambah Tipe Cuti
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>Tambah Tipe Cuti Baru</DialogTitle>
                    <DialogDescription>
                      Isi data tipe cuti yang akan ditambahkan.
                    </DialogDescription>
                  </DialogHeader>

                  <div className="grid gap-4 py-2">
                    <div className="grid gap-2">
                      <Label htmlFor="lt-name">Nama Tipe Cuti</Label>
                      <Input
                        id="lt-name"
                        placeholder="Cuti Tahunan"
                        value={newType.name}
                        onChange={(e) =>
                          setNewType((prev) => ({ ...prev, name: e.target.value }))
                        }
                      />
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="lt-code">Kode</Label>
                      <Input
                        id="lt-code"
                        placeholder="ANNUAL"
                        value={newType.code}
                        onChange={(e) =>
                          setNewType((prev) => ({
                            ...prev,
                            code: e.target.value.toUpperCase(),
                          }))
                        }
                      />
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="lt-quota">Kuota Default (hari)</Label>
                      <Input
                        id="lt-quota"
                        type="number"
                        min={0}
                        value={newType.defaultQuota}
                        onChange={(e) =>
                          setNewType((prev) => ({
                            ...prev,
                            defaultQuota: Number(e.target.value),
                          }))
                        }
                      />
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="lt-paid">Berbayar</Label>
                      <Select
                        value={newType.isPaid ? "true" : "false"}
                        onValueChange={(v: string | null) =>
                          setNewType((prev) => ({ ...prev, isPaid: v === "true" }))
                        }
                      >
                        <SelectTrigger id="lt-paid" className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="true">Ya</SelectItem>
                          <SelectItem value="false">Tidak</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="lt-carry">Carry Over</Label>
                      <Select
                        value={newType.isCarryOver ? "true" : "false"}
                        onValueChange={(v: string | null) =>
                          setNewType((prev) => ({
                            ...prev,
                            isCarryOver: v === "true",
                            maxCarryOver: v === "true" ? prev.maxCarryOver : 0,
                          }))
                        }
                      >
                        <SelectTrigger id="lt-carry" className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="true">Ya</SelectItem>
                          <SelectItem value="false">Tidak</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="lt-doc">Perlu Dokumen</Label>
                      <Select
                        value={newType.requiresDoc ? "true" : "false"}
                        onValueChange={(v: string | null) =>
                          setNewType((prev) => ({ ...prev, requiresDoc: v === "true" }))
                        }
                      >
                        <SelectTrigger id="lt-doc" className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="true">Ya</SelectItem>
                          <SelectItem value="false">Tidak</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="lt-notes">Catatan (opsional)</Label>
                      <Textarea
                        id="lt-notes"
                        placeholder="Keterangan tambahan..."
                        rows={2}
                      />
                    </div>
                  </div>

                  <DialogFooter>
                    <Button variant="outline" onClick={() => setDialogOpen(false)}>
                      Batal
                    </Button>
                    <Button onClick={handleAddType} disabled={creatingLeaveType}>
                      {creatingLeaveType ? "Menyimpan..." : "Simpan"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardHeader>

            {/* Mobile card view for leave types */}
            <div className="md:hidden px-4 pb-4 space-y-3">
              {types.length === 0 ? (
                <p className="text-center text-sm text-muted-foreground py-6">
                  Tidak ada tipe cuti.
                </p>
              ) : (
                types.map((lt) => (
                  <Card key={lt.id} className="p-4 border">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <p className="font-medium text-sm">{lt.name}</p>
                        <Badge variant="outline" className="font-mono text-xs mt-1">
                          {lt.code}
                        </Badge>
                      </div>
                      <span className="inline-flex items-center gap-1.5 rounded-sm border border-border bg-muted/60 px-2 py-0.5 text-[11px] font-medium">
                        <span className={`h-1.5 w-1.5 rounded-full ${lt.isActive ? "bg-[var(--success)]" : "bg-muted-foreground/60"}`} />
                        {lt.isActive ? "Aktif" : "Nonaktif"}
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-xs mt-2">
                      <div>
                        <p className="text-muted-foreground">Kuota</p>
                        <p className="font-semibold">{lt.defaultQuota} hari</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Berbayar</p>
                        <p className="font-semibold">{lt.isPaid ? "Ya" : "Tidak"}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Carry Over</p>
                        <p className="font-semibold">{lt.isCarryOver ? `Maks ${lt.maxCarryOver}` : "Tidak"}</p>
                      </div>
                    </div>
                  </Card>
                ))
              )}
            </div>

            {/* Desktop table view */}
            <div className="hidden md:block">
              <CardContent className="px-0">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead>Nama</TableHead>
                      <TableHead>Kode</TableHead>
                      <TableHead className="text-center">Kuota</TableHead>
                      <TableHead className="text-center">Berbayar</TableHead>
                      <TableHead className="text-center">Carry Over</TableHead>
                      <TableHead className="text-center">Perlu Dokumen</TableHead>
                      <TableHead className="text-center">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {types.length === 0 ? (
                      <EmptyRow colSpan={7}>Tidak ada tipe cuti.</EmptyRow>
                    ) : (
                      types.map((lt) => (
                        <TableRow key={lt.id} className="hover:bg-muted/50">
                          <TableCell className="font-medium">{lt.name}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className="font-mono text-xs">
                              {lt.code}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-center">
                            {lt.defaultQuota} hari
                          </TableCell>
                          <TableCell className="text-center">
                            <span className="inline-flex items-center gap-1.5 rounded-sm border border-border bg-muted/60 px-2 py-0.5 text-[11px] font-medium">
                              <span className={`h-1.5 w-1.5 rounded-full ${lt.isPaid ? "bg-[var(--success)]" : "bg-muted-foreground/60"}`} />
                              {lt.isPaid ? "Ya" : "Tidak"}
                            </span>
                          </TableCell>
                          <TableCell className="text-center">
                            {lt.isCarryOver ? (
                              <span className="text-sm">Maks {lt.maxCarryOver} hari</span>
                            ) : (
                              <span className="text-sm text-muted-foreground">Tidak</span>
                            )}
                          </TableCell>
                          <TableCell className="text-center">
                            {lt.requiresDoc ? (
                              <CalendarDays className="mx-auto h-4 w-4 text-primary" strokeWidth={1.75} />
                            ) : (
                              <span className="text-sm text-muted-foreground">&mdash;</span>
                            )}
                          </TableCell>
                          <TableCell className="text-center">
                            <span className="inline-flex items-center gap-1.5 rounded-sm border border-border bg-muted/60 px-2 py-0.5 text-[11px] font-medium">
                              <span className={`h-1.5 w-1.5 rounded-full ${lt.isActive ? "bg-[var(--success)]" : "bg-muted-foreground/60"}`} />
                              {lt.isActive ? "Aktif" : "Nonaktif"}
                            </span>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
