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

import { useLeaveRequests, useLeaveTypes, useLeaveBalances, useApproveLeave } from "@/hooks/use-leave";
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
import { Textarea } from "@/components/ui/textarea";

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
  const [approvingId, setApprovingId] = useState<string | null>(null);

  const { requests, isLoading: requestsLoading, mutate: mutateRequests } = useLeaveRequests({
    status: statusFilter !== "ALL" ? statusFilter : undefined,
  });
  const { leaveTypes: types, isLoading: typesLoading } = useLeaveTypes();
  const { balances: leaveBalances, isLoading: balancesLoading } = useLeaveBalances();

  const approveMutation = useApproveLeave(approvingId ?? "");

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
    setApprovingId(id);
    try {
      await approveMutation.trigger({ status: "APPROVED" });
      toast.success("Pengajuan cuti berhasil disetujui");
      await mutateRequests();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Gagal menyetujui");
    }
    setApprovingId(null);
  }

  async function handleReject(id: string) {
    setApprovingId(id);
    try {
      await approveMutation.trigger({ status: "REJECTED" });
      toast.error("Pengajuan cuti ditolak");
      await mutateRequests();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Gagal menolak");
    }
    setApprovingId(null);
  }

  const handleAddType = () => {
    if (!newType.name.trim() || !newType.code.trim()) {
      toast.error("Nama dan Kode wajib diisi");
      return;
    }
    // TODO: Call API to create leave type when endpoint is ready
    toast.info("Fitur tambah tipe cuti via API belum tersedia");
    setNewType(EMPTY_LEAVE_TYPE);
    setDialogOpen(false);
  };

  const computeRemaining = (b: { entitlement: number; carried: number; used: number; pending: number }) =>
    Math.max(0, b.entitlement + b.carried - b.used - b.pending);

  const isLoading = requestsLoading || typesLoading || balancesLoading;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10">
          <CalendarDays className="size-5 text-primary" />
        </div>
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight">Manajemen Cuti</h1>
          <p className="text-xs sm:text-sm text-muted-foreground">
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
            <Card className="p-3 sm:p-4 shadow-sm border-l-4 border-l-blue-500">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-100">
                  <FileText className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <p className="text-xl sm:text-2xl font-bold">{stats.total}</p>
                  <p className="text-[11px] sm:text-xs text-muted-foreground">Total Pengajuan</p>
                </div>
              </div>
            </Card>

            <Card className="p-3 sm:p-4 shadow-sm border-l-4 border-l-yellow-500">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-yellow-100">
                  <Clock className="h-4 w-4 text-yellow-600" />
                </div>
                <div>
                  <p className="text-xl sm:text-2xl font-bold">{stats.pending}</p>
                  <p className="text-[11px] sm:text-xs text-muted-foreground">Menunggu</p>
                </div>
              </div>
            </Card>

            <Card className="p-3 sm:p-4 shadow-sm border-l-4 border-l-green-500">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-green-100">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                </div>
                <div>
                  <p className="text-xl sm:text-2xl font-bold">{stats.approved}</p>
                  <p className="text-[11px] sm:text-xs text-muted-foreground">Disetujui</p>
                </div>
              </div>
            </Card>

            <Card className="p-3 sm:p-4 shadow-sm border-l-4 border-l-red-500">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-red-100">
                  <XCircle className="h-4 w-4 text-red-600" />
                </div>
                <div>
                  <p className="text-xl sm:text-2xl font-bold">{stats.rejected}</p>
                  <p className="text-[11px] sm:text-xs text-muted-foreground">Ditolak</p>
                </div>
              </div>
            </Card>
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
                        className="flex-1 border-green-300 bg-green-50 text-green-700 hover:bg-green-100"
                        onClick={() => handleApprove(req.id)}
                      >
                        <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                        Setujui
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1 border-red-300 bg-red-50 text-red-700 hover:bg-red-100"
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
                      <TableRow>
                        <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                          Tidak ada pengajuan cuti ditemukan.
                        </TableCell>
                      </TableRow>
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
                                  className="border-green-300 bg-green-50 text-green-700 hover:bg-green-100 hover:text-green-800"
                                  onClick={() => handleApprove(req.id)}
                                >
                                  <CheckCircle2 data-icon="inline-start" />
                                  Setujui
                                </Button>
                                <Button
                                  size="xs"
                                  variant="outline"
                                  className="border-red-300 bg-red-50 text-red-700 hover:bg-red-100 hover:text-red-800"
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
                        <span className={`text-lg font-bold ${remaining <= 2 ? "text-red-600" : ""}`}>
                          {remaining}
                        </span>
                        <p className="text-[11px] text-muted-foreground">sisa hari</p>
                      </div>
                    </div>
                    <div className="h-2 w-full rounded-full bg-muted mb-2">
                      <div
                        className={`h-2 rounded-full transition-all ${
                          usedPercentage >= 80
                            ? "bg-red-500"
                            : usedPercentage >= 50
                              ? "bg-yellow-500"
                              : "bg-green-500"
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
                            <Badge variant="outline" className="text-yellow-700 border-yellow-300 text-xs px-1.5">
                              {bal.pending}
                            </Badge>
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
                      <TableRow>
                        <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                          Tidak ada data saldo cuti.
                        </TableCell>
                      </TableRow>
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
                                <Badge variant="outline" className="text-yellow-700 border-yellow-300">
                                  {bal.pending}
                                </Badge>
                              ) : (
                                bal.pending
                              )}
                            </TableCell>
                            <TableCell className="text-center">
                              <div className="flex flex-col items-center gap-1">
                                <span className={remaining <= 2 ? "font-bold text-red-600" : "font-bold"}>
                                  {remaining}
                                </span>
                                <div className="h-1.5 w-16 rounded-full bg-muted">
                                  <div
                                    className={`h-1.5 rounded-full transition-all ${
                                      usedPercentage >= 80
                                        ? "bg-red-500"
                                        : usedPercentage >= 50
                                          ? "bg-yellow-500"
                                          : "bg-green-500"
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
                    <Button onClick={handleAddType}>Simpan</Button>
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
                      {lt.isActive ? (
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                          Aktif
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-gray-50 text-gray-600 border-gray-200">
                          Nonaktif
                        </Badge>
                      )}
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
                      <TableRow>
                        <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                          Tidak ada tipe cuti.
                        </TableCell>
                      </TableRow>
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
                            {lt.isPaid ? (
                              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                Ya
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="bg-gray-50 text-gray-600 border-gray-200">
                                Tidak
                              </Badge>
                            )}
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
                              <CalendarDays className="mx-auto h-4 w-4 text-blue-600" />
                            ) : (
                              <span className="text-sm text-muted-foreground">&mdash;</span>
                            )}
                          </TableCell>
                          <TableCell className="text-center">
                            {lt.isActive ? (
                              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                Aktif
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="bg-gray-50 text-gray-600 border-gray-200">
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
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
