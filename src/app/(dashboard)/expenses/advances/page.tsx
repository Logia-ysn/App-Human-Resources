"use client";

import { useState, useMemo } from "react";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import {
  Banknote,
  Clock,
  CheckCircle2,
  XCircle,
  Plus,
  FileText,
  DollarSign,
} from "lucide-react";
import { toast } from "sonner";

import {
  employeeAdvances as initialAdvances,
  employees,
  type EmployeeAdvance,
} from "@/lib/dummy-data";
import { StatusBadge } from "@/components/shared/status-badge";

import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
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
// Currency formatter
// ---------------------------------------------------------------------------

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);

// ---------------------------------------------------------------------------
// Blank form state
// ---------------------------------------------------------------------------

type AdvanceForm = {
  employeeId: string;
  amount: string;
  purpose: string;
  notes: string;
};

const EMPTY_FORM: AdvanceForm = {
  employeeId: "",
  amount: "",
  purpose: "",
  notes: "",
};

// ---------------------------------------------------------------------------
// Available employees for the select
// ---------------------------------------------------------------------------

const AVAILABLE_EMPLOYEES = employees.map((e) => ({
  id: e.id,
  name: `${e.firstName} ${e.lastName}`,
  department: e.departmentName,
}));

// ---------------------------------------------------------------------------
// Page component
// ---------------------------------------------------------------------------

export default function AdvancesPage() {
  const [advances, setAdvances] =
    useState<EmployeeAdvance[]>(initialAdvances);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState<AdvanceForm>(EMPTY_FORM);

  // ----- Derived stats -----
  const stats = useMemo(() => {
    const total = advances.length;
    const pending = advances.filter((a) => a.status === "PENDING").length;
    const approved = advances.filter(
      (a) => a.status === "APPROVED" || a.status === "PAID",
    ).length;
    const totalNominal = advances.reduce((sum, a) => sum + a.amount, 0);
    return { total, pending, approved, totalNominal };
  }, [advances]);

  // ----- Handlers -----
  const handleApprove = (id: string) => {
    setAdvances((prev) =>
      prev.map((a) =>
        a.id === id
          ? {
              ...a,
              status: "APPROVED" as const,
              approvedBy: "Admin",
              approvedDate: new Date().toISOString().slice(0, 10),
            }
          : a,
      ),
    );
    toast.success("Kasbon berhasil disetujui");
  };

  const handleReject = (id: string) => {
    setAdvances((prev) =>
      prev.map((a) =>
        a.id === id
          ? {
              ...a,
              status: "REJECTED" as const,
              approvedBy: "Admin",
              approvedDate: new Date().toISOString().slice(0, 10),
            }
          : a,
      ),
    );
    toast.error("Kasbon ditolak");
  };

  const handleCreate = () => {
    if (!form.employeeId || !form.amount || !form.purpose) {
      toast.error("Karyawan, nominal, dan alasan wajib diisi");
      return;
    }

    const employee = AVAILABLE_EMPLOYEES.find(
      (e) => e.id === form.employeeId,
    );

    const created: EmployeeAdvance = {
      id: `adv-${Date.now()}`,
      employeeId: form.employeeId,
      employeeName: employee?.name ?? "",
      departmentName: employee?.department ?? "",
      amount: Number(form.amount),
      purpose: form.purpose,
      requestDate: new Date().toISOString().slice(0, 10),
      status: "PENDING",
      approvedBy: null,
      approvedDate: null,
      returnedAmount: 0,
      notes: form.notes,
    };

    setAdvances((prev) => [created, ...prev]);
    setForm(EMPTY_FORM);
    setDialogOpen(false);
    toast.success("Pengajuan kasbon berhasil dibuat");
  };

  // -----------------------------------------------------------------------
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10">
            <Banknote className="size-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Kasbon Karyawan
            </h1>
            <p className="text-sm text-muted-foreground">
              Kelola pengajuan kasbon dan persetujuan
            </p>
          </div>
        </div>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger render={<Button />}>
            <Plus data-icon="inline-start" />
            Ajukan Kasbon
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Ajukan Kasbon Baru</DialogTitle>
              <DialogDescription>
                Isi data pengajuan kasbon karyawan.
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-2">
              <div className="grid gap-2">
                <Label htmlFor="adv-employee">Karyawan</Label>
                <Select
                  value={form.employeeId}
                  onValueChange={(val: string | null) =>
                    setForm((prev) => ({
                      ...prev,
                      employeeId: val ?? "",
                    }))
                  }
                >
                  <SelectTrigger id="adv-employee" className="w-full">
                    <SelectValue placeholder="Pilih karyawan" />
                  </SelectTrigger>
                  <SelectContent>
                    {AVAILABLE_EMPLOYEES.map((emp) => (
                      <SelectItem key={emp.id} value={emp.id}>
                        {emp.name} &mdash; {emp.department}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="adv-amount">Nominal (Rp)</Label>
                <Input
                  id="adv-amount"
                  type="number"
                  min={0}
                  placeholder="1000000"
                  value={form.amount}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, amount: e.target.value }))
                  }
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="adv-purpose">Alasan / Tujuan</Label>
                <Textarea
                  id="adv-purpose"
                  placeholder="Perjalanan dinas, event, dll."
                  rows={2}
                  value={form.purpose}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, purpose: e.target.value }))
                  }
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="adv-notes">Catatan (opsional)</Label>
                <Input
                  id="adv-notes"
                  placeholder="Keterangan tambahan"
                  value={form.notes}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, notes: e.target.value }))
                  }
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setDialogOpen(false)}
              >
                Batal
              </Button>
              <Button onClick={handleCreate}>Ajukan</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="shadow-sm border-l-4 border-l-blue-500">
          <CardContent>
            <div className="flex items-center gap-3">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-blue-100">
                <FileText className="size-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Kasbon</p>
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
                <p className="text-sm text-muted-foreground">
                  Menunggu Approval
                </p>
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

        <Card className="shadow-sm border-l-4 border-l-purple-500">
          <CardContent>
            <div className="flex items-center gap-3">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-purple-100">
                <DollarSign className="size-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Nominal</p>
                <p className="text-xl font-bold">
                  {formatCurrency(stats.totalNominal)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Table */}
      <Card className="shadow-sm">
        <CardContent className="px-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead>Nama Karyawan</TableHead>
                <TableHead>Departemen</TableHead>
                <TableHead className="text-right">Nominal</TableHead>
                <TableHead>Alasan</TableHead>
                <TableHead>Tgl Pengajuan</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {advances.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="h-24 text-center text-muted-foreground"
                  >
                    Tidak ada data kasbon.
                  </TableCell>
                </TableRow>
              ) : (
                advances.map((adv) => (
                  <TableRow key={adv.id} className="hover:bg-muted/50">
                    <TableCell className="font-medium">
                      {adv.employeeName}
                    </TableCell>
                    <TableCell>{adv.departmentName}</TableCell>
                    <TableCell className="text-right font-mono text-sm">
                      {formatCurrency(adv.amount)}
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate">
                      {adv.purpose}
                    </TableCell>
                    <TableCell>
                      {format(new Date(adv.requestDate), "dd MMM yyyy", {
                        locale: idLocale,
                      })}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={adv.status} />
                    </TableCell>
                    <TableCell className="text-right">
                      {adv.status === "PENDING" ? (
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            size="xs"
                            variant="outline"
                            className="border-green-300 bg-green-50 text-green-700 hover:bg-green-100 hover:text-green-800"
                            onClick={() => handleApprove(adv.id)}
                          >
                            <CheckCircle2 data-icon="inline-start" />
                            Setujui
                          </Button>
                          <Button
                            size="xs"
                            variant="outline"
                            className="border-red-300 bg-red-50 text-red-700 hover:bg-red-100 hover:text-red-800"
                            onClick={() => handleReject(adv.id)}
                          >
                            <XCircle data-icon="inline-start" />
                            Tolak
                          </Button>
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground">
                          {adv.approvedBy
                            ? `oleh ${adv.approvedBy}`
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
    </div>
  );
}
