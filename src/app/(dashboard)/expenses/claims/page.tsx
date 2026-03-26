"use client";

import { useState, useMemo } from "react";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import {
  Receipt,
  Clock,
  CheckCircle2,
  XCircle,
  Plus,
  FileText,
  DollarSign,
  ExternalLink,
} from "lucide-react";
import { toast } from "sonner";

import { useAppStore } from "@/lib/store/app-store";
import {
  type ExpenseClaim,
  type ExpenseItem,
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
import { Badge } from "@/components/ui/badge";
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
// Category badge config
// ---------------------------------------------------------------------------

type CategoryKey = ExpenseItem["category"];

const CATEGORY_CONFIG: Record<
  CategoryKey,
  { label: string; className: string }
> = {
  TRANSPORT: {
    label: "Transport",
    className: "bg-blue-50 text-blue-700 border-blue-200",
  },
  MAKAN: {
    label: "Makan",
    className: "bg-orange-50 text-orange-700 border-orange-200",
  },
  AKOMODASI: {
    label: "Akomodasi",
    className: "bg-purple-50 text-purple-700 border-purple-200",
  },
  SUPPLIES: {
    label: "Supplies",
    className: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
  LAINNYA: {
    label: "Lainnya",
    className: "bg-slate-50 text-slate-600 border-slate-200",
  },
};

const CATEGORY_OPTIONS: { value: CategoryKey; label: string }[] = [
  { value: "TRANSPORT", label: "Transport" },
  { value: "MAKAN", label: "Makan" },
  { value: "AKOMODASI", label: "Akomodasi" },
  { value: "SUPPLIES", label: "Supplies" },
  { value: "LAINNYA", label: "Lainnya" },
];

// ---------------------------------------------------------------------------
// Form state
// ---------------------------------------------------------------------------

type ClaimForm = {
  employeeId: string;
  title: string;
  description: string;
  amount: string;
  category: CategoryKey;
};

const EMPTY_FORM: ClaimForm = {
  employeeId: "",
  title: "",
  description: "",
  amount: "",
  category: "LAINNYA",
};

// ---------------------------------------------------------------------------
// Helper: get the primary category from claim items
// ---------------------------------------------------------------------------

function getPrimaryCategory(items: ExpenseItem[]): CategoryKey {
  if (items.length === 0) return "LAINNYA";

  const counts: Partial<Record<CategoryKey, number>> = {};
  for (const item of items) {
    counts[item.category] = (counts[item.category] ?? 0) + item.amount;
  }

  let maxKey: CategoryKey = "LAINNYA";
  let maxVal = 0;
  for (const [key, val] of Object.entries(counts)) {
    if (val > maxVal) {
      maxKey = key as CategoryKey;
      maxVal = val;
    }
  }
  return maxKey;
}

// ---------------------------------------------------------------------------
// Page component
// ---------------------------------------------------------------------------

export default function ClaimsPage() {
  const claims = useAppStore((s) => s.expenseClaims);
  const employees = useAppStore((s) => s.employees);
  const storeAddExpenseClaim = useAppStore((s) => s.addExpenseClaim);
  const storeUpdateExpenseClaim = useAppStore((s) => s.updateExpenseClaim);

  const AVAILABLE_EMPLOYEES = useMemo(
    () =>
      employees.map((e) => ({
        id: e.id,
        name: `${e.firstName} ${e.lastName}`,
        department: e.departmentName,
      })),
    [employees],
  );

  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState<ClaimForm>(EMPTY_FORM);

  // ----- Derived stats -----
  const stats = useMemo(() => {
    const total = claims.length;
    const pending = claims.filter((c) => c.status === "PENDING").length;
    const approved = claims.filter(
      (c) => c.status === "APPROVED" || c.status === "PAID",
    ).length;
    const approvedNominal = claims
      .filter((c) => c.status === "APPROVED" || c.status === "PAID")
      .reduce((sum, c) => sum + c.totalAmount, 0);
    return { total, pending, approved, approvedNominal };
  }, [claims]);

  // ----- Handlers -----
  const handleApprove = (id: string) => {
    storeUpdateExpenseClaim(id, {
      status: "APPROVED" as const,
      approvedBy: "Admin",
      approvedDate: new Date().toISOString().slice(0, 10),
    });
    toast.success("Klaim pengeluaran berhasil disetujui");
  };

  const handleReject = (id: string) => {
    storeUpdateExpenseClaim(id, {
      status: "REJECTED" as const,
      approvedBy: "Admin",
      approvedDate: new Date().toISOString().slice(0, 10),
    });
    toast.error("Klaim pengeluaran ditolak");
  };

  const handleCreate = () => {
    if (
      !form.employeeId ||
      !form.title ||
      !form.amount ||
      !form.description
    ) {
      toast.error("Karyawan, judul, deskripsi, dan nominal wajib diisi");
      return;
    }

    const employee = AVAILABLE_EMPLOYEES.find(
      (e) => e.id === form.employeeId,
    );
    const amount = Number(form.amount);

    const created: ExpenseClaim = {
      id: `exp-${Date.now()}`,
      employeeId: form.employeeId,
      employeeName: employee?.name ?? "",
      departmentName: employee?.department ?? "",
      title: form.title,
      totalAmount: amount,
      items: [
        {
          id: `ei-${Date.now()}`,
          description: form.description,
          amount,
          category: form.category,
          date: new Date().toISOString().slice(0, 10),
        },
      ],
      status: "PENDING",
      submittedDate: new Date().toISOString().slice(0, 10),
      approvedBy: null,
      approvedDate: null,
    };

    storeAddExpenseClaim(created);
    setForm(EMPTY_FORM);
    setDialogOpen(false);
    toast.success("Klaim pengeluaran berhasil diajukan");
  };

  // -----------------------------------------------------------------------
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10">
            <Receipt className="size-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Klaim Pengeluaran
            </h1>
            <p className="text-sm text-muted-foreground">
              Kelola klaim pengeluaran dan reimbursement karyawan
            </p>
          </div>
        </div>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger render={<Button />}>
            <Plus data-icon="inline-start" />
            Ajukan Klaim
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Ajukan Klaim Pengeluaran</DialogTitle>
              <DialogDescription>
                Isi data klaim pengeluaran karyawan.
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-2">
              <div className="grid gap-2">
                <Label htmlFor="claim-employee">Karyawan</Label>
                <Select
                  value={form.employeeId}
                  onValueChange={(val: string | null) =>
                    setForm((prev) => ({
                      ...prev,
                      employeeId: val ?? "",
                    }))
                  }
                >
                  <SelectTrigger id="claim-employee" className="w-full">
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
                <Label htmlFor="claim-title">Judul Klaim</Label>
                <Input
                  id="claim-title"
                  placeholder="Perjalanan Dinas, dll."
                  value={form.title}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, title: e.target.value }))
                  }
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="claim-category">Kategori</Label>
                <Select
                  value={form.category}
                  onValueChange={(val: string | null) =>
                    setForm((prev) => ({
                      ...prev,
                      category: (val ?? "LAINNYA") as CategoryKey,
                    }))
                  }
                >
                  <SelectTrigger id="claim-category" className="w-full">
                    <SelectValue placeholder="Pilih kategori" />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORY_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="claim-desc">Deskripsi</Label>
                <Textarea
                  id="claim-desc"
                  placeholder="Rincian pengeluaran"
                  rows={2}
                  value={form.description}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="claim-amount">Nominal (Rp)</Label>
                <Input
                  id="claim-amount"
                  type="number"
                  min={0}
                  placeholder="500000"
                  value={form.amount}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, amount: e.target.value }))
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
                <p className="text-sm text-muted-foreground">Total Klaim</p>
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

        <Card className="shadow-sm border-l-4 border-l-purple-500">
          <CardContent>
            <div className="flex items-center gap-3">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-purple-100">
                <DollarSign className="size-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">
                  Total Nominal Disetujui
                </p>
                <p className="text-xl font-bold">
                  {formatCurrency(stats.approvedNominal)}
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
                <TableHead>Nama</TableHead>
                <TableHead>Departemen</TableHead>
                <TableHead>Kategori</TableHead>
                <TableHead>Deskripsi</TableHead>
                <TableHead className="text-right">Nominal</TableHead>
                <TableHead>Tanggal</TableHead>
                <TableHead>Bukti</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {claims.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={9}
                    className="h-24 text-center text-muted-foreground"
                  >
                    Tidak ada data klaim pengeluaran.
                  </TableCell>
                </TableRow>
              ) : (
                claims.map((claim) => {
                  const primaryCat = getPrimaryCategory(claim.items);
                  const catConfig = CATEGORY_CONFIG[primaryCat];

                  return (
                    <TableRow key={claim.id} className="hover:bg-muted/50">
                      <TableCell className="font-medium">
                        {claim.employeeName}
                      </TableCell>
                      <TableCell>{claim.departmentName}</TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={catConfig.className}
                        >
                          {catConfig.label}
                        </Badge>
                      </TableCell>
                      <TableCell className="max-w-[200px] truncate">
                        {claim.title}
                      </TableCell>
                      <TableCell className="text-right font-mono text-sm">
                        {formatCurrency(claim.totalAmount)}
                      </TableCell>
                      <TableCell>
                        {format(
                          new Date(claim.submittedDate),
                          "dd MMM yyyy",
                          { locale: idLocale },
                        )}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="xs"
                          className="text-blue-600 hover:text-blue-700"
                        >
                          <ExternalLink data-icon="inline-start" />
                          {claim.items.length} item
                        </Button>
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={claim.status} />
                      </TableCell>
                      <TableCell className="text-right">
                        {claim.status === "PENDING" ? (
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              size="xs"
                              variant="outline"
                              className="border-green-300 bg-green-50 text-green-700 hover:bg-green-100 hover:text-green-800"
                              onClick={() => handleApprove(claim.id)}
                            >
                              <CheckCircle2 data-icon="inline-start" />
                              Setujui
                            </Button>
                            <Button
                              size="xs"
                              variant="outline"
                              className="border-red-300 bg-red-50 text-red-700 hover:bg-red-100 hover:text-red-800"
                              onClick={() => handleReject(claim.id)}
                            >
                              <XCircle data-icon="inline-start" />
                              Tolak
                            </Button>
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground">
                            {claim.approvedBy
                              ? `oleh ${claim.approvedBy}`
                              : "\u2014"}
                          </span>
                        )}
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
  );
}
