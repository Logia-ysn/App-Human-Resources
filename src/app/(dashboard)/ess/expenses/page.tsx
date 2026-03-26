"use client";

import { useState, useMemo } from "react";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import {
  Banknote,
  Plus,
  Wallet,
  Receipt,
  Clock,
  CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";

import { useAppStore } from "@/lib/store/app-store";
import type { EmployeeAdvance, ExpenseClaim } from "@/lib/dummy-data";
import { StatusBadge } from "@/components/shared/status-badge";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Textarea } from "@/components/ui/textarea";
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

const DEMO_EMPLOYEE_ID = "emp-003";
const DEMO_EMPLOYEE_NAME = "Joko Widodo";
const DEMO_DEPARTMENT = "Finance & Accounting";

const CATEGORY_LABELS: Record<string, string> = {
  TRANSPORT: "Transportasi",
  MAKAN: "Makan",
  AKOMODASI: "Akomodasi",
  SUPPLIES: "Perlengkapan",
  LAINNYA: "Lainnya",
};

const CATEGORY_COLORS: Record<string, string> = {
  TRANSPORT: "bg-blue-50 text-blue-700 border-blue-200",
  MAKAN: "bg-orange-50 text-orange-700 border-orange-200",
  AKOMODASI: "bg-purple-50 text-purple-700 border-purple-200",
  SUPPLIES: "bg-emerald-50 text-emerald-700 border-emerald-200",
  LAINNYA: "bg-gray-50 text-gray-600 border-gray-200",
};

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

// ---------------------------------------------------------------------------
// Page component
// ---------------------------------------------------------------------------

export default function EssExpensesPage() {
  const employees = useAppStore((s) => s.employees);
  const advances = useAppStore((s) => s.employeeAdvances);
  const claims = useAppStore((s) => s.expenseClaims);
  const addEmployeeAdvance = useAppStore((s) => s.addEmployeeAdvance);
  const addExpenseClaim = useAppStore((s) => s.addExpenseClaim);

  // Demo: derive employee info from store
  const currentEmp = employees[1];
  const demoEmployeeId = currentEmp?.id ?? DEMO_EMPLOYEE_ID;
  const demoEmployeeName = currentEmp ? `${currentEmp.firstName} ${currentEmp.lastName}` : DEMO_EMPLOYEE_NAME;
  const demoDepartment = currentEmp?.departmentName ?? DEMO_DEPARTMENT;

  // Dialogs
  const [advanceDialogOpen, setAdvanceDialogOpen] = useState(false);
  const [claimDialogOpen, setClaimDialogOpen] = useState(false);

  // New advance form
  const [newAdvanceAmount, setNewAdvanceAmount] = useState("");
  const [newAdvancePurpose, setNewAdvancePurpose] = useState("");
  const [newAdvanceNotes, setNewAdvanceNotes] = useState("");

  // New claim form
  const [newClaimTitle, setNewClaimTitle] = useState("");
  const [newClaimAmount, setNewClaimAmount] = useState("");
  const [newClaimCategory, setNewClaimCategory] = useState<string>("TRANSPORT");
  const [newClaimDescription, setNewClaimDescription] = useState("");

  // Filtered data for current user
  const myAdvances = useMemo(
    () =>
      advances
        .filter((a) => a.employeeId === demoEmployeeId)
        .sort(
          (a, b) =>
            new Date(b.requestDate).getTime() -
            new Date(a.requestDate).getTime(),
        ),
    [advances, demoEmployeeId],
  );

  const myClaims = useMemo(
    () =>
      claims
        .filter((c) => c.employeeId === demoEmployeeId)
        .sort(
          (a, b) =>
            new Date(b.submittedDate).getTime() -
            new Date(a.submittedDate).getTime(),
        ),
    [claims, demoEmployeeId],
  );

  // Stats
  const stats = useMemo(() => {
    const totalAdvances = myAdvances.reduce((sum, a) => sum + a.amount, 0);
    const totalClaims = myClaims.reduce((sum, c) => sum + c.totalAmount, 0);
    const pendingAdvances = myAdvances.filter(
      (a) => a.status === "PENDING",
    ).length;
    const pendingClaims = myClaims.filter(
      (c) => c.status === "PENDING",
    ).length;
    return { totalAdvances, totalClaims, pendingAdvances, pendingClaims };
  }, [myAdvances, myClaims]);

  // Handlers
  const handleAddAdvance = () => {
    const amount = Number(newAdvanceAmount);
    if (!amount || amount <= 0 || !newAdvancePurpose.trim()) {
      toast.error("Jumlah dan tujuan wajib diisi");
      return;
    }

    const created: EmployeeAdvance = {
      id: `adv-${Date.now()}`,
      employeeId: demoEmployeeId,
      employeeName: demoEmployeeName,
      departmentName: demoDepartment,
      amount,
      purpose: newAdvancePurpose.trim(),
      requestDate: format(new Date(), "yyyy-MM-dd"),
      status: "PENDING",
      approvedBy: null,
      approvedDate: null,
      returnedAmount: 0,
      notes: newAdvanceNotes.trim(),
    };

    addEmployeeAdvance(created);
    setNewAdvanceAmount("");
    setNewAdvancePurpose("");
    setNewAdvanceNotes("");
    setAdvanceDialogOpen(false);
    toast.success("Pengajuan kasbon berhasil diajukan");
  };

  const handleAddClaim = () => {
    const amount = Number(newClaimAmount);
    if (!amount || amount <= 0 || !newClaimTitle.trim()) {
      toast.error("Judul dan jumlah wajib diisi");
      return;
    }

    const created: ExpenseClaim = {
      id: `exp-${Date.now()}`,
      employeeId: demoEmployeeId,
      employeeName: demoEmployeeName,
      departmentName: demoDepartment,
      title: newClaimTitle.trim(),
      totalAmount: amount,
      items: [
        {
          id: `ei-${Date.now()}`,
          description: newClaimDescription.trim() || newClaimTitle.trim(),
          amount,
          category: newClaimCategory as ExpenseClaim["items"][0]["category"],
          date: format(new Date(), "yyyy-MM-dd"),
        },
      ],
      status: "DRAFT",
      submittedDate: format(new Date(), "yyyy-MM-dd"),
      approvedBy: null,
      approvedDate: null,
    };

    addExpenseClaim(created);
    setNewClaimTitle("");
    setNewClaimAmount("");
    setNewClaimCategory("TRANSPORT");
    setNewClaimDescription("");
    setClaimDialogOpen(false);
    toast.success("Klaim pengeluaran berhasil dibuat");
  };

  // -----------------------------------------------------------------------
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10">
          <Banknote className="size-5 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Kasbon & Klaim Saya
          </h1>
          <p className="text-sm text-muted-foreground">
            Kelola pengajuan kasbon dan klaim pengeluaran pribadi
          </p>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="shadow-sm border-l-4 border-l-blue-500">
          <CardContent>
            <div className="flex items-center gap-3">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-blue-100">
                <Wallet className="size-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Kasbon</p>
                <p className="text-xl font-bold">
                  {formatCurrency(stats.totalAdvances)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-l-4 border-l-green-500">
          <CardContent>
            <div className="flex items-center gap-3">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-green-100">
                <Receipt className="size-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Klaim</p>
                <p className="text-xl font-bold">
                  {formatCurrency(stats.totalClaims)}
                </p>
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
                  Kasbon Menunggu
                </p>
                <p className="text-2xl font-bold">{stats.pendingAdvances}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-l-4 border-l-purple-500">
          <CardContent>
            <div className="flex items-center gap-3">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-purple-100">
                <CheckCircle2 className="size-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">
                  Klaim Menunggu
                </p>
                <p className="text-2xl font-bold">{stats.pendingClaims}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="kasbon">
        <TabsList>
          <TabsTrigger value="kasbon">Kasbon Saya</TabsTrigger>
          <TabsTrigger value="klaim">Klaim Saya</TabsTrigger>
        </TabsList>

        {/* ==============================================================
            TAB 1 -- Kasbon Saya
        ============================================================== */}
        <TabsContent value="kasbon" className="space-y-4">
          <div className="flex justify-end">
            <Dialog
              open={advanceDialogOpen}
              onOpenChange={setAdvanceDialogOpen}
            >
              <DialogTrigger render={<Button />}>
                <Plus data-icon="inline-start" />
                Ajukan Kasbon
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Ajukan Kasbon Baru</DialogTitle>
                  <DialogDescription>
                    Isi data kasbon yang akan diajukan.
                  </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-2">
                  <div className="grid gap-2">
                    <Label htmlFor="adv-amount">Jumlah (Rp)</Label>
                    <Input
                      id="adv-amount"
                      type="number"
                      min={0}
                      placeholder="1000000"
                      value={newAdvanceAmount}
                      onChange={(e) => setNewAdvanceAmount(e.target.value)}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="adv-purpose">Tujuan</Label>
                    <Input
                      id="adv-purpose"
                      placeholder="Perjalanan dinas, training, dll"
                      value={newAdvancePurpose}
                      onChange={(e) => setNewAdvancePurpose(e.target.value)}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="adv-notes">Catatan (opsional)</Label>
                    <Textarea
                      id="adv-notes"
                      placeholder="Keterangan tambahan..."
                      rows={2}
                      value={newAdvanceNotes}
                      onChange={(e) => setNewAdvanceNotes(e.target.value)}
                    />
                  </div>
                </div>

                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setAdvanceDialogOpen(false)}
                  >
                    Batal
                  </Button>
                  <Button onClick={handleAddAdvance}>Ajukan</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          {myAdvances.length === 0 ? (
            <Card className="shadow-sm">
              <CardContent className="py-16 text-center">
                <Wallet className="mx-auto h-12 w-12 text-muted-foreground/40" />
                <p className="mt-4 font-medium">Belum ada kasbon</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Ajukan kasbon pertama Anda menggunakan tombol di atas.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {myAdvances.map((adv) => (
                <Card key={adv.id} className="shadow-sm hover:shadow-md transition-shadow">
                  <CardContent className="pt-5">
                    <div className="flex items-start justify-between mb-3">
                      <StatusBadge status={adv.status} />
                      <span className="text-xs text-muted-foreground">
                        {format(new Date(adv.requestDate), "dd MMM yyyy", {
                          locale: idLocale,
                        })}
                      </span>
                    </div>

                    <h3 className="font-semibold text-lg mb-1">
                      {formatCurrency(adv.amount)}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-2">
                      {adv.purpose}
                    </p>

                    {adv.notes && (
                      <p className="text-xs text-muted-foreground border-t pt-2 mt-2">
                        {adv.notes}
                      </p>
                    )}

                    {adv.returnedAmount > 0 && (
                      <div className="flex items-center gap-2 mt-2 pt-2 border-t">
                        <Badge
                          variant="outline"
                          className="bg-emerald-50 text-emerald-700 border-emerald-200"
                        >
                          Dikembalikan: {formatCurrency(adv.returnedAmount)}
                        </Badge>
                      </div>
                    )}

                    {adv.approvedBy && (
                      <p className="text-xs text-muted-foreground mt-2">
                        Disetujui oleh: {adv.approvedBy}
                        {adv.approvedDate &&
                          ` (${format(new Date(adv.approvedDate), "dd MMM yyyy", { locale: idLocale })})`}
                      </p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* ==============================================================
            TAB 2 -- Klaim Saya
        ============================================================== */}
        <TabsContent value="klaim" className="space-y-4">
          <div className="flex justify-end">
            <Dialog open={claimDialogOpen} onOpenChange={setClaimDialogOpen}>
              <DialogTrigger render={<Button />}>
                <Plus data-icon="inline-start" />
                Ajukan Klaim
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Ajukan Klaim Pengeluaran</DialogTitle>
                  <DialogDescription>
                    Isi data klaim pengeluaran yang akan diajukan.
                  </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-2">
                  <div className="grid gap-2">
                    <Label htmlFor="claim-title">Judul Klaim</Label>
                    <Input
                      id="claim-title"
                      placeholder="Contoh: Tiket Perjalanan Dinas"
                      value={newClaimTitle}
                      onChange={(e) => setNewClaimTitle(e.target.value)}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="claim-amount">Jumlah (Rp)</Label>
                    <Input
                      id="claim-amount"
                      type="number"
                      min={0}
                      placeholder="500000"
                      value={newClaimAmount}
                      onChange={(e) => setNewClaimAmount(e.target.value)}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label>Kategori</Label>
                    <Select
                      value={newClaimCategory}
                      onValueChange={(val: string | null) =>
                        setNewClaimCategory(val ?? "TRANSPORT")
                      }
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Pilih kategori" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="TRANSPORT">Transportasi</SelectItem>
                        <SelectItem value="MAKAN">Makan</SelectItem>
                        <SelectItem value="AKOMODASI">Akomodasi</SelectItem>
                        <SelectItem value="SUPPLIES">Perlengkapan</SelectItem>
                        <SelectItem value="LAINNYA">Lainnya</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="claim-desc">Deskripsi (opsional)</Label>
                    <Textarea
                      id="claim-desc"
                      placeholder="Keterangan item pengeluaran..."
                      rows={2}
                      value={newClaimDescription}
                      onChange={(e) =>
                        setNewClaimDescription(e.target.value)
                      }
                    />
                  </div>
                </div>

                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setClaimDialogOpen(false)}
                  >
                    Batal
                  </Button>
                  <Button onClick={handleAddClaim}>Ajukan</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          {myClaims.length === 0 ? (
            <Card className="shadow-sm">
              <CardContent className="py-16 text-center">
                <Receipt className="mx-auto h-12 w-12 text-muted-foreground/40" />
                <p className="mt-4 font-medium">Belum ada klaim</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Ajukan klaim pengeluaran pertama Anda menggunakan tombol di
                  atas.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {myClaims.map((claim) => (
                <Card
                  key={claim.id}
                  className="shadow-sm hover:shadow-md transition-shadow"
                >
                  <CardContent className="pt-5">
                    <div className="flex items-start justify-between mb-3">
                      <StatusBadge status={claim.status} />
                      <span className="text-xs text-muted-foreground">
                        {format(
                          new Date(claim.submittedDate),
                          "dd MMM yyyy",
                          { locale: idLocale },
                        )}
                      </span>
                    </div>

                    <h3 className="font-semibold mb-1">{claim.title}</h3>
                    <p className="text-lg font-bold text-primary mb-3">
                      {formatCurrency(claim.totalAmount)}
                    </p>

                    {/* Items */}
                    <div className="space-y-1.5 border-t pt-3">
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Item Pengeluaran
                      </p>
                      {claim.items.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center justify-between text-sm"
                        >
                          <div className="flex items-center gap-2">
                            <Badge
                              variant="outline"
                              className={`text-[10px] ${CATEGORY_COLORS[item.category] ?? ""}`}
                            >
                              {CATEGORY_LABELS[item.category] ?? item.category}
                            </Badge>
                            <span>{item.description}</span>
                          </div>
                          <span className="font-medium text-xs">
                            {formatCurrency(item.amount)}
                          </span>
                        </div>
                      ))}
                    </div>

                    {claim.approvedBy && (
                      <p className="text-xs text-muted-foreground mt-3 pt-2 border-t">
                        Disetujui oleh: {claim.approvedBy}
                        {claim.approvedDate &&
                          ` (${format(new Date(claim.approvedDate), "dd MMM yyyy", { locale: idLocale })})`}
                      </p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
