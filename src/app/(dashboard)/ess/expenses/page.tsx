"use client";

import { useState, useMemo } from "react";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import { Receipt, Banknote, FileText, Plus, Loader2, Trash2 } from "lucide-react";

import { useAuth } from "@/components/providers/auth-context";
import { useAdvances, useClaims, useCreateClaim } from "@/hooks/use-expenses";
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
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { LoadingState } from "@/components/shared/loading-state";
import { toast } from "sonner";

const CATEGORY_OPTIONS = [
  { value: "TRANSPORT", label: "Transportasi" },
  { value: "MAKAN", label: "Makan/Minum" },
  { value: "AKOMODASI", label: "Akomodasi" },
  { value: "SUPPLIES", label: "Perlengkapan" },
  { value: "LAINNYA", label: "Lainnya" },
] as const;

const CATEGORY_LABEL: Record<string, string> = Object.fromEntries(
  CATEGORY_OPTIONS.map((o) => [o.value, o.label]),
);

type ClaimItem = {
  description: string;
  amount: string;
  category: string;
  date: string;
};

const EMPTY_ITEM: ClaimItem = {
  description: "",
  amount: "",
  category: "",
  date: new Date().toISOString().slice(0, 10),
};

function formatCurrency(amount: string | number): string {
  const num = typeof amount === "string" ? Number(amount) : amount;
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(num || 0);
}

export default function EssExpensesPage() {
  const { employeeId } = useAuth();
  const { advances, isLoading: advLoading } = useAdvances({
    employeeId: employeeId ?? undefined,
  });
  const { claims, isLoading: claimLoading, mutate: mutateClaims } = useClaims({
    employeeId: employeeId ?? undefined,
  });
  const createClaim = useCreateClaim();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [items, setItems] = useState<ClaimItem[]>([{ ...EMPTY_ITEM }]);
  const [saving, setSaving] = useState(false);

  const advanceTotal = useMemo(
    () => advances.reduce((s, a) => s + Number(a.amount), 0),
    [advances],
  );
  const claimTotal = useMemo(
    () => claims.reduce((s, c) => s + Number(c.totalAmount), 0),
    [claims],
  );

  function handleOpenDialog() {
    setTitle("");
    setItems([{ ...EMPTY_ITEM }]);
    setDialogOpen(true);
  }

  function updateItem(idx: number, patch: Partial<ClaimItem>) {
    setItems((prev) => prev.map((it, i) => (i === idx ? { ...it, ...patch } : it)));
  }

  function removeItem(idx: number) {
    setItems((prev) => prev.filter((_, i) => i !== idx));
  }

  function addItem() {
    setItems((prev) => [...prev, { ...EMPTY_ITEM }]);
  }

  async function handleSubmit() {
    if (!title.trim()) {
      toast.error("Judul klaim wajib diisi");
      return;
    }
    const validItems = items.filter((it) => it.description && it.amount && it.category && it.date);
    if (validItems.length === 0) {
      toast.error("Minimal satu item pengeluaran yang lengkap");
      return;
    }

    setSaving(true);
    try {
      await createClaim.trigger({
        title: title.trim(),
        items: validItems.map((it) => ({
          description: it.description,
          amount: parseFloat(it.amount),
          category: it.category as "TRANSPORT" | "MAKAN" | "AKOMODASI" | "SUPPLIES" | "LAINNYA",
          date: it.date,
        })),
      });
      toast.success("Klaim pengeluaran berhasil diajukan");
      setDialogOpen(false);
      await mutateClaims();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Gagal mengajukan klaim");
    } finally {
      setSaving(false);
    }
  }

  if (!employeeId) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center space-y-2">
          <Receipt className="h-12 w-12 text-muted-foreground/40 mx-auto" />
          <p className="text-lg font-medium">Data karyawan tidak ditemukan</p>
          <p className="text-sm text-muted-foreground">
            Akun Anda belum terhubung dengan data karyawan.
          </p>
        </div>
      </div>
    );
  }

  if (advLoading || claimLoading) {
    return <LoadingState />;
  }

  const itemsTotal = items.reduce((s, it) => s + (parseFloat(it.amount) || 0), 0);

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-4">
        <div className="flex items-center gap-2.5">
          <Receipt className="size-5 text-muted-foreground" strokeWidth={1.75} />
          <div>
            <h1 className="text-xl font-semibold tracking-tight">Pengeluaran Saya</h1>
            <p className="text-xs text-muted-foreground">
              Kasbon dan klaim pengeluaran Anda
            </p>
          </div>
        </div>
        <Button onClick={handleOpenDialog}>
          <Plus className="mr-1 h-4 w-4" />
          Ajukan Klaim
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <StatCard
          title={`Total Kasbon (${advances.length})`}
          value={formatCurrency(advanceTotal)}
          icon={Banknote}
        />
        <StatCard
          title={`Total Klaim (${claims.length})`}
          value={formatCurrency(claimTotal)}
          icon={FileText}
        />
      </div>

      <Tabs defaultValue="claims">
        <TabsList>
          <TabsTrigger value="claims">Klaim</TabsTrigger>
          <TabsTrigger value="advances">Kasbon</TabsTrigger>
        </TabsList>

        <TabsContent value="claims">
          <Card>
            <CardHeader>
              <CardTitle>Riwayat Klaim</CardTitle>
            </CardHeader>
            <CardContent>
              {/* Mobile cards */}
              <div className="space-y-3 md:hidden">
                {claims.length === 0 ? (
                  <p className="text-center py-8 text-muted-foreground">Belum ada klaim.</p>
                ) : (
                  claims.map((c) => (
                    <div key={c.id} className="rounded-sm border border-border p-3 space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <p className="font-medium text-sm truncate">{c.title}</p>
                        <StatusBadge status={c.status} />
                      </div>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>{c.items.length} item</span>
                        <span className="font-mono font-semibold text-foreground">
                          {formatCurrency(c.totalAmount)}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(c.submittedDate), "dd MMM yyyy", { locale: idLocale })}
                      </p>
                      {c.items.length > 0 && (
                        <div className="text-xs text-muted-foreground space-y-0.5 border-t border-border pt-2">
                          {c.items.map((it) => (
                            <div key={it.id} className="flex justify-between">
                              <span className="truncate mr-2">{it.description}</span>
                              <span className="font-mono shrink-0">{formatCurrency(it.amount)}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
              {/* Desktop table */}
              <div className="hidden md:block">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead>Judul</TableHead>
                      <TableHead className="text-center">Item</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                      <TableHead>Tgl. Diajukan</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {claims.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                          Belum ada klaim.
                        </TableCell>
                      </TableRow>
                    ) : (
                      claims.map((c) => (
                        <TableRow key={c.id} className="hover:bg-muted/50">
                          <TableCell className="font-medium">
                            <span className="line-clamp-1 text-sm">{c.title}</span>
                            {c.items.length > 0 && (
                              <span className="text-xs text-muted-foreground">
                                {c.items.map((it) => CATEGORY_LABEL[it.category] ?? it.category).filter((v, i, a) => a.indexOf(v) === i).join(", ")}
                              </span>
                            )}
                          </TableCell>
                          <TableCell className="text-center text-sm">{c.items.length}</TableCell>
                          <TableCell className="text-right font-mono font-semibold">
                            {formatCurrency(c.totalAmount)}
                          </TableCell>
                          <TableCell className="text-sm">
                            {format(new Date(c.submittedDate), "dd MMM yyyy", { locale: idLocale })}
                          </TableCell>
                          <TableCell>
                            <StatusBadge status={c.status} />
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="advances">
          <Card>
            <CardHeader>
              <CardTitle>Riwayat Kasbon</CardTitle>
            </CardHeader>
            <CardContent>
              {/* Mobile cards */}
              <div className="space-y-3 md:hidden">
                {advances.length === 0 ? (
                  <p className="text-center py-8 text-muted-foreground">Belum ada kasbon.</p>
                ) : (
                  advances.map((a) => (
                    <div key={a.id} className="rounded-sm border border-border p-3 space-y-1">
                      <div className="flex items-center justify-between gap-2">
                        <p className="font-medium text-sm truncate">{a.purpose}</p>
                        <StatusBadge status={a.status} />
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">
                          {format(new Date(a.requestDate), "dd MMM yyyy", { locale: idLocale })}
                        </span>
                        <span className="font-mono font-semibold">{formatCurrency(a.amount)}</span>
                      </div>
                      {Number(a.returnedAmount) > 0 && (
                        <p className="text-xs text-muted-foreground">
                          Dikembalikan: {formatCurrency(a.returnedAmount)}
                        </p>
                      )}
                    </div>
                  ))
                )}
              </div>
              {/* Desktop table */}
              <div className="hidden md:block">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead>Keperluan</TableHead>
                      <TableHead className="text-right">Nilai</TableHead>
                      <TableHead className="text-right">Dikembalikan</TableHead>
                      <TableHead>Tgl. Permintaan</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {advances.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                          Belum ada kasbon.
                        </TableCell>
                      </TableRow>
                    ) : (
                      advances.map((a) => (
                        <TableRow key={a.id} className="hover:bg-muted/50">
                          <TableCell>
                            <span className="line-clamp-2 text-sm">{a.purpose}</span>
                          </TableCell>
                          <TableCell className="text-right font-mono font-semibold">
                            {formatCurrency(a.amount)}
                          </TableCell>
                          <TableCell className="text-right font-mono text-muted-foreground">
                            {Number(a.returnedAmount) > 0 ? formatCurrency(a.returnedAmount) : "-"}
                          </TableCell>
                          <TableCell className="text-sm">
                            {format(new Date(a.requestDate), "dd MMM yyyy", { locale: idLocale })}
                          </TableCell>
                          <TableCell>
                            <StatusBadge status={a.status} />
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Dialog Ajukan Klaim */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Ajukan Klaim Pengeluaran</DialogTitle>
            <DialogDescription>
              Isi detail pengeluaran yang ingin Anda klaim. Tambahkan item sesuai kebutuhan.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-2">
            <div className="grid gap-2">
              <Label htmlFor="claim-title">Judul Klaim</Label>
              <Input
                id="claim-title"
                placeholder="Perjalanan dinas ke Surabaya"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Item Pengeluaran</Label>
                <Button type="button" variant="outline" size="sm" onClick={addItem}>
                  <Plus className="mr-1 h-3.5 w-3.5" />
                  Tambah
                </Button>
              </div>

              {items.map((item, idx) => (
                <div
                  key={idx}
                  className="rounded-sm border border-border p-3 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-muted-foreground">
                      Item {idx + 1}
                    </span>
                    {items.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0 text-destructive hover:text-destructive"
                        onClick={() => removeItem(idx)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    )}
                  </div>
                  <div className="grid gap-3">
                    <Input
                      placeholder="Deskripsi pengeluaran"
                      value={item.description}
                      onChange={(e) => updateItem(idx, { description: e.target.value })}
                    />
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <Input
                        type="number"
                        min="0"
                        placeholder="Jumlah (Rp)"
                        value={item.amount}
                        onChange={(e) => updateItem(idx, { amount: e.target.value })}
                      />
                      <Select
                        value={item.category || undefined}
                        onValueChange={(val) => val && updateItem(idx, { category: val })}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Kategori" />
                        </SelectTrigger>
                        <SelectContent>
                          {CATEGORY_OPTIONS.map((o) => (
                            <SelectItem key={o.value} value={o.value}>
                              {o.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Input
                        type="date"
                        value={item.date}
                        onChange={(e) => updateItem(idx, { date: e.target.value })}
                      />
                    </div>
                  </div>
                </div>
              ))}

              {itemsTotal > 0 && (
                <div className="flex justify-between items-center px-1 text-sm">
                  <span className="font-medium">Total</span>
                  <span className="font-mono font-semibold">{formatCurrency(itemsTotal)}</span>
                </div>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Batal
            </Button>
            <Button onClick={handleSubmit} disabled={saving}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Ajukan Klaim
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
