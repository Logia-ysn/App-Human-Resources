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
} from "lucide-react";
import { toast } from "sonner";

import {
  leaveTypes as initialLeaveTypes,
  leaveBalances,
  leaveRequests as initialLeaveRequests,
  type LeaveTypeRecord,
  type LeaveRequestRecord,
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
import { Textarea } from "@/components/ui/textarea";

// ---------------------------------------------------------------------------
// Status filter options
// ---------------------------------------------------------------------------

const STATUS_OPTIONS = [
  { value: "ALL", label: "Semua Status" },
  { value: "PENDING", label: "Menunggu" },
  { value: "APPROVED", label: "Disetujui" },
  { value: "REJECTED", label: "Ditolak" },
  { value: "CANCELLED", label: "Dibatalkan" },
];

// ---------------------------------------------------------------------------
// Blank leave-type form state
// ---------------------------------------------------------------------------

const EMPTY_LEAVE_TYPE: Omit<LeaveTypeRecord, "id"> = {
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

// ---------------------------------------------------------------------------
// Page component
// ---------------------------------------------------------------------------

export default function LeavePage() {
  // ----- Leave requests (mutable copy for approve / reject) -----
  const [requests, setRequests] =
    useState<LeaveRequestRecord[]>(initialLeaveRequests);

  // ----- Leave types (mutable copy for adding new types) -----
  const [types, setTypes] = useState<LeaveTypeRecord[]>(initialLeaveTypes);

  // ----- Status filter -----
  const [statusFilter, setStatusFilter] = useState("ALL");

  // ----- Dialog for adding leave type -----
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newType, setNewType] =
    useState<Omit<LeaveTypeRecord, "id">>(EMPTY_LEAVE_TYPE);

  // ----- Derived stats -----
  const stats = useMemo(() => {
    const total = requests.length;
    const pending = requests.filter((r) => r.status === "PENDING").length;
    const approved = requests.filter((r) => r.status === "APPROVED").length;
    const rejected = requests.filter((r) => r.status === "REJECTED").length;
    return { total, pending, approved, rejected };
  }, [requests]);

  // ----- Filtered requests -----
  const filteredRequests = useMemo(() => {
    if (statusFilter === "ALL") return requests;
    return requests.filter((r) => r.status === statusFilter);
  }, [requests, statusFilter]);

  // ----- Handlers -----
  const handleStatusFilterChange = (value: string | null) => {
    setStatusFilter(value ?? "ALL");
  };

  const handleApprove = (id: string) => {
    setRequests((prev) =>
      prev.map((r) =>
        r.id === id ? { ...r, status: "APPROVED" as const, approvedBy: "Admin" } : r
      )
    );
    toast.success("Pengajuan cuti berhasil disetujui");
  };

  const handleReject = (id: string) => {
    setRequests((prev) =>
      prev.map((r) =>
        r.id === id ? { ...r, status: "REJECTED" as const, approvedBy: "Admin" } : r
      )
    );
    toast.error("Pengajuan cuti ditolak");
  };

  const handleAddType = () => {
    if (!newType.name.trim() || !newType.code.trim()) {
      toast.error("Nama dan Kode wajib diisi");
      return;
    }

    const created: LeaveTypeRecord = {
      ...newType,
      id: `lt-${Date.now()}`,
    };

    setTypes((prev) => [...prev, created]);
    setNewType(EMPTY_LEAVE_TYPE);
    setDialogOpen(false);
    toast.success(`Tipe cuti "${created.name}" berhasil ditambahkan`);
  };

  // ----- Balance helpers -----
  const computeRemaining = (b: { entitlement: number; carried: number; used: number; pending: number }) =>
    b.entitlement + b.carried - b.used - b.pending;

  // -----------------------------------------------------------------------
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10">
          <CalendarDays className="size-5 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Manajemen Cuti</h1>
          <p className="text-sm text-muted-foreground">
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

        {/* ================================================================
            TAB 1 — Pengajuan Cuti
        ================================================================ */}
        <TabsContent value="requests" className="space-y-4">
          {/* Summary cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card className="shadow-sm border-l-4 border-l-blue-500">
              <CardContent>
                <div className="flex items-center gap-3">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-blue-100">
                    <FileText className="size-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Pengajuan</p>
                    <p className="text-2xl font-bold">{stats.total}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-sm border-l-4 border-l-yellow-500">
              <CardContent>
                <div className="flex items-center gap-3">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-yellow-100">
                    <Clock className="size-5 text-yellow-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Menunggu</p>
                    <p className="text-2xl font-bold">{stats.pending}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-sm border-l-4 border-l-green-500">
              <CardContent>
                <div className="flex items-center gap-3">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-green-100">
                    <CheckCircle2 className="size-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Disetujui</p>
                    <p className="text-2xl font-bold">{stats.approved}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-sm border-l-4 border-l-red-500">
              <CardContent>
                <div className="flex items-center gap-3">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-red-100">
                    <XCircle className="size-5 text-red-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Ditolak</p>
                    <p className="text-2xl font-bold">{stats.rejected}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filter + Table */}
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
                  {filteredRequests.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={7}
                        className="h-24 text-center text-muted-foreground"
                      >
                        Tidak ada pengajuan cuti ditemukan.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredRequests.map((req) => (
                      <TableRow key={req.id} className="hover:bg-muted/50">
                        <TableCell className="font-medium">
                          {req.employeeName}
                        </TableCell>
                        <TableCell>{req.departmentName}</TableCell>
                        <TableCell>{req.leaveTypeName}</TableCell>
                        <TableCell>
                          {format(new Date(req.startDate), "dd MMM", {
                            locale: idLocale,
                          })}{" "}
                          &ndash;{" "}
                          {format(new Date(req.endDate), "dd MMM yyyy", {
                            locale: idLocale,
                          })}
                        </TableCell>
                        <TableCell>{req.totalDays} hari</TableCell>
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
                              {req.approvedBy
                                ? `oleh ${req.approvedBy}`
                                : "\u2014"}
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
        </TabsContent>

        {/* ================================================================
            TAB 2 — Saldo Cuti
        ================================================================ */}
        <TabsContent value="balances" className="space-y-4">
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
                      <TableCell
                        colSpan={7}
                        className="h-24 text-center text-muted-foreground"
                      >
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
                            {bal.employeeName}
                          </TableCell>
                          <TableCell>{bal.leaveTypeName}</TableCell>
                          <TableCell className="text-center">
                            {bal.entitlement}
                          </TableCell>
                          <TableCell className="text-center">
                            {bal.carried}
                          </TableCell>
                          <TableCell className="text-center">
                            {bal.used}
                          </TableCell>
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
                              <span
                                className={
                                  remaining <= 2
                                    ? "font-bold text-red-600"
                                    : "font-bold"
                                }
                              >
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
        </TabsContent>

        {/* ================================================================
            TAB 3 — Tipe Cuti
        ================================================================ */}
        <TabsContent value="types" className="space-y-4">
          <Card className="shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Daftar Tipe Cuti</CardTitle>
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger
                  render={<Button />}
                >
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
                      <TableCell
                        colSpan={7}
                        className="h-24 text-center text-muted-foreground"
                      >
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
                            <span className="text-sm">
                              Maks {lt.maxCarryOver} hari
                            </span>
                          ) : (
                            <span className="text-sm text-muted-foreground">
                              Tidak
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="text-center">
                          {lt.requiresDoc ? (
                            <CalendarDays className="mx-auto h-4 w-4 text-blue-600" />
                          ) : (
                            <span className="text-sm text-muted-foreground">
                              &mdash;
                            </span>
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
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
