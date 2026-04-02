"use client";

import { useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
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
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/shared/status-badge";
import type { Position } from "@/lib/dummy-data";
import { useAppStore } from "@/lib/store/app-store";

const LEVELS = ["STAFF", "SUPERVISOR", "MANAGER", "DIRECTOR"] as const;

const LEVEL_VARIANT: Record<string, "default" | "secondary" | "outline"> = {
  STAFF: "secondary",
  SUPERVISOR: "outline",
  MANAGER: "default",
  DIRECTOR: "default",
};

const currencyFormat = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

type FormData = {
  name: string;
  code: string;
  departmentId: string;
  level: Position["level"];
  minSalary: string;
  maxSalary: string;
  description: string;
  isActive: boolean;
};

const EMPTY_FORM: FormData = {
  name: "",
  code: "",
  departmentId: "",
  level: "STAFF",
  minSalary: "",
  maxSalary: "",
  description: "",
  isActive: true,
};

function formFromPosition(p: Position): FormData {
  return {
    name: p.name,
    code: p.code,
    departmentId: p.departmentId,
    level: p.level,
    minSalary: p.minSalary?.toString() ?? "",
    maxSalary: p.maxSalary?.toString() ?? "",
    description: p.description,
    isActive: p.isActive,
  };
}

export default function PositionsPage() {
  const positions = useAppStore((s) => s.positions);
  const departments = useAppStore((s) => s.departments);
  const addPosition = useAppStore((s) => s.addPosition);
  const updatePosition = useAppStore((s) => s.updatePosition);
  const deletePosition = useAppStore((s) => s.deletePosition);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormData>(EMPTY_FORM);
  const [filterDept, setFilterDept] = useState<string>("all");
  const [deleteTarget, setDeleteTarget] = useState<Position | null>(null);

  const filtered =
    filterDept === "all"
      ? positions
      : positions.filter((p) => p.departmentId === filterDept);

  function openCreate() {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setDialogOpen(true);
  }

  function openEdit(position: Position) {
    setEditingId(position.id);
    setForm(formFromPosition(position));
    setDialogOpen(true);
  }

  function confirmDelete() {
    if (!deleteTarget) return;
    deletePosition(deleteTarget.id);
    toast.success("Jabatan berhasil dihapus");
    setDeleteTarget(null);
  }

  function handleSubmit() {
    if (!form.name.trim() || !form.code.trim() || !form.departmentId) {
      toast.error("Nama, kode, dan departemen wajib diisi");
      return;
    }

    const dept = departments.find((d) => d.id === form.departmentId);
    if (!dept) {
      toast.error("Departemen tidak ditemukan. Pilih departemen yang valid.");
      return;
    }

    if (editingId) {
      updatePosition(editingId, {
        name: form.name.trim(),
        code: form.code.trim(),
        departmentId: form.departmentId,
        departmentName: dept?.name ?? "",
        level: form.level,
        minSalary: form.minSalary ? Number(form.minSalary) : null,
        maxSalary: form.maxSalary ? Number(form.maxSalary) : null,
        description: form.description.trim(),
        isActive: form.isActive,
      });
      toast.success("Jabatan berhasil diperbarui");
    } else {
      const newPosition: Position = {
        id: `pos-${Date.now()}`,
        name: form.name.trim(),
        code: form.code.trim(),
        departmentId: form.departmentId,
        departmentName: dept?.name ?? "",
        level: form.level,
        minSalary: form.minSalary ? Number(form.minSalary) : null,
        maxSalary: form.maxSalary ? Number(form.maxSalary) : null,
        description: form.description.trim(),
        isActive: form.isActive,
        employeeCount: 0,
        createdAt: new Date().toISOString().split("T")[0],
      };
      addPosition(newPosition);
      toast.success("Jabatan berhasil ditambahkan");
    }

    setDialogOpen(false);
  }

  function formatSalaryRange(min: number | null, max: number | null): string {
    if (min == null && max == null) return "-";
    if (min != null && max != null) {
      return `${currencyFormat.format(min)} - ${currencyFormat.format(max)}`;
    }
    if (min != null) return `>= ${currencyFormat.format(min)}`;
    return `<= ${currencyFormat.format(max!)}`;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-lg sm:text-2xl font-bold tracking-tight">
            Manajemen Jabatan
          </h1>
          <p className="text-muted-foreground">
            Kelola jabatan dan posisi di perusahaan
          </p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="size-4" data-icon="inline-start" />
          <span className="hidden sm:inline">Tambah Jabatan</span>
          <span className="sm:hidden">Tambah</span>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Daftar Jabatan</CardTitle>
            <Select
              value={filterDept}
              onValueChange={(val) => setFilterDept(val as string)}
            >
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue placeholder="Semua Departemen" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Departemen</SelectItem>
                {departments.map((dept) => (
                  <SelectItem key={dept.id} value={dept.id}>
                    {dept.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 md:hidden">
            {filtered.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">Tidak ada data jabatan.</div>
            ) : (
              filtered.map((pos) => (
                <div key={pos.id} className="rounded-lg border p-4 space-y-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium">{pos.name}</p>
                      <p className="text-xs text-muted-foreground font-mono">{pos.code}</p>
                    </div>
                    <StatusBadge status={pos.isActive ? "ACTIVE" : "RESIGNED"} />
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant={LEVEL_VARIANT[pos.level] ?? "default"}>{pos.level}</Badge>
                    <Badge variant="outline">{pos.departmentName}</Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">{formatSalaryRange(pos.minSalary, pos.maxSalary)}</p>
                      <p className="text-muted-foreground">Karyawan: <span className="font-medium text-foreground">{pos.employeeCount}</span></p>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="icon-sm" onClick={() => openEdit(pos)}>
                        <Pencil className="size-4" />
                      </Button>
                      <Button variant="ghost" size="icon-sm" onClick={() => setDeleteTarget(pos)}>
                        <Trash2 className="size-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
          <div className="hidden md:block">
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Kode</TableHead>
                  <TableHead>Nama Jabatan</TableHead>
                  <TableHead>Departemen</TableHead>
                  <TableHead>Level</TableHead>
                  <TableHead>Range Gaji</TableHead>
                  <TableHead className="text-center">
                    Jumlah Karyawan
                  </TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="h-24 text-center">
                      Tidak ada data jabatan.
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((pos) => (
                    <TableRow key={pos.id}>
                      <TableCell className="font-mono text-xs">
                        {pos.code}
                      </TableCell>
                      <TableCell className="font-medium">{pos.name}</TableCell>
                      <TableCell>{pos.departmentName}</TableCell>
                      <TableCell>
                        <Badge variant={LEVEL_VARIANT[pos.level] ?? "default"}>
                          {pos.level}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {formatSalaryRange(pos.minSalary, pos.maxSalary)}
                      </TableCell>
                      <TableCell className="text-center">
                        {pos.employeeCount}
                      </TableCell>
                      <TableCell>
                        <StatusBadge
                          status={pos.isActive ? "ACTIVE" : "RESIGNED"}
                        />
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => openEdit(pos)}
                          >
                            <Pencil className="size-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => setDeleteTarget(pos)}
                          >
                            <Trash2 className="size-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
          </div>
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingId ? "Edit Jabatan" : "Tambah Jabatan"}
            </DialogTitle>
            <DialogDescription>
              {editingId
                ? "Perbarui informasi jabatan."
                : "Isi data jabatan baru."}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="pos-name">Nama Jabatan</Label>
                <Input
                  id="pos-name"
                  placeholder="Contoh: HR Manager"
                  value={form.name}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, name: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pos-code">Kode</Label>
                <Input
                  id="pos-code"
                  placeholder="Contoh: HR-MGR"
                  value={form.code}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, code: e.target.value }))
                  }
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Departemen</Label>
                <Select
                  value={form.departmentId || undefined}
                  onValueChange={(val) =>
                    setForm((prev) => ({
                      ...prev,
                      departmentId: val as string,
                    }))
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Pilih departemen" />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map((dept) => (
                      <SelectItem key={dept.id} value={dept.id}>
                        {dept.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Level</Label>
                <Select
                  value={form.level}
                  onValueChange={(val) =>
                    setForm((prev) => ({
                      ...prev,
                      level: val as Position["level"],
                    }))
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Pilih level" />
                  </SelectTrigger>
                  <SelectContent>
                    {LEVELS.map((lvl) => (
                      <SelectItem key={lvl} value={lvl}>
                        {lvl}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="pos-min-salary">Gaji Minimum</Label>
                <Input
                  id="pos-min-salary"
                  type="number"
                  placeholder="0"
                  value={form.minSalary}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      minSalary: e.target.value,
                    }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pos-max-salary">Gaji Maksimum</Label>
                <Input
                  id="pos-max-salary"
                  type="number"
                  placeholder="0"
                  value={form.maxSalary}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      maxSalary: e.target.value,
                    }))
                  }
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="pos-desc">Deskripsi</Label>
              <Textarea
                id="pos-desc"
                placeholder="Deskripsi jabatan..."
                value={form.description}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
              />
            </div>

            <div className="flex items-center gap-3">
              <Switch
                checked={form.isActive}
                onCheckedChange={(checked) =>
                  setForm((prev) => ({ ...prev, isActive: checked }))
                }
              />
              <Label>Aktif</Label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Batal
            </Button>
            <Button onClick={handleSubmit}>
              {editingId ? "Simpan Perubahan" : "Tambah"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteTarget !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
      >
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Hapus Jabatan</DialogTitle>
            <DialogDescription>
              Apakah Anda yakin ingin menghapus jabatan{" "}
              <span className="font-semibold text-foreground">
                {deleteTarget?.name}
              </span>
              ? Tindakan ini tidak dapat dibatalkan.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>
              Batal
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              Hapus
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
