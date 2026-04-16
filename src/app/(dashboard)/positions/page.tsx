"use client";

import { useState } from "react";
import { Plus, Pencil, Trash2, Loader2, Briefcase } from "lucide-react";
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
import { usePositions, useCreatePosition, useUpdatePosition, useDeletePosition } from "@/hooks/use-positions";
import { useDepartments } from "@/hooks/use-departments";
import { useOrgLevels } from "@/hooks/use-org-levels";
import { LoadingState } from "@/components/shared/loading-state";

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
  orgLevelId: string;
  minSalary: string;
  maxSalary: string;
  description: string;
  isActive: boolean;
};

const EMPTY_FORM: FormData = {
  name: "",
  code: "",
  departmentId: "",
  orgLevelId: "",
  minSalary: "",
  maxSalary: "",
  description: "",
  isActive: true,
};

export default function PositionsPage() {
  const [filterDept, setFilterDept] = useState<string>("all");
  const { positions, isLoading, mutate } = usePositions(filterDept === "all" ? undefined : filterDept);
  const { departments } = useDepartments();
  const { levels: orgLevels } = useOrgLevels();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormData>(EMPTY_FORM);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const createPos = useCreatePosition();
  const updatePos = useUpdatePosition(editingId ?? "");
  const deletePos = useDeletePosition(deleteTargetId ?? "");

  const deleteTarget = positions.find((p) => p.id === deleteTargetId) ?? null;

  function openCreate() {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setDialogOpen(true);
  }

  function openEdit(pos: (typeof positions)[0]) {
    setEditingId(pos.id);
    setForm({
      name: pos.name,
      code: pos.code,
      departmentId: pos.departmentId,
      orgLevelId: pos.orgLevelId,
      minSalary: pos.minSalary?.toString() ?? "",
      maxSalary: pos.maxSalary?.toString() ?? "",
      description: pos.description ?? "",
      isActive: pos.isActive,
    });
    setDialogOpen(true);
  }

  async function confirmDelete() {
    if (!deleteTargetId) return;
    try {
      await deletePos.trigger();
      toast.success("Jabatan berhasil dihapus");
      await mutate();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Gagal menghapus";
      toast.error(msg);
    }
    setDeleteTargetId(null);
  }

  async function handleSubmit() {
    if (!form.name.trim() || !form.code.trim() || !form.departmentId || !form.orgLevelId) {
      toast.error("Nama, kode, departemen, dan level wajib diisi");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        name: form.name.trim(),
        code: form.code.trim(),
        departmentId: form.departmentId,
        orgLevelId: form.orgLevelId,
        minSalary: form.minSalary ? Number(form.minSalary) : null,
        maxSalary: form.maxSalary ? Number(form.maxSalary) : null,
        description: form.description.trim(),
      };

      if (editingId) {
        await updatePos.trigger(payload);
        toast.success("Jabatan berhasil diperbarui");
      } else {
        await createPos.trigger(payload);
        toast.success("Jabatan berhasil ditambahkan");
      }
      await mutate();
      setDialogOpen(false);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Gagal menyimpan";
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  }

  function formatSalaryRange(min: unknown, max: unknown): string {
    const minN = min != null ? Number(min) : null;
    const maxN = max != null ? Number(max) : null;
    if (minN == null && maxN == null) return "-";
    if (minN != null && maxN != null) {
      return `${currencyFormat.format(minN)} - ${currencyFormat.format(maxN)}`;
    }
    if (minN != null) return `>= ${currencyFormat.format(minN)}`;
    return `<= ${currencyFormat.format(maxN!)}`;
  }

  if (isLoading) {
    return (
      <LoadingState />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-4">
        <div className="flex items-center gap-2.5">
          <Briefcase className="size-5 text-muted-foreground" strokeWidth={1.75} />
          <div>
            <h1 className="text-xl font-semibold tracking-tight">Manajemen Jabatan</h1>
            <p className="text-xs text-muted-foreground">Kelola jabatan dan posisi di perusahaan</p>
          </div>
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
              items={{ all: "Semua Departemen", ...Object.fromEntries(departments.map((d) => [d.id, d.name])) }}
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
            {positions.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">Tidak ada data jabatan.</div>
            ) : (
              positions.map((pos) => (
                <div key={pos.id} className="rounded-sm border border-border p-4 space-y-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium">{pos.name}</p>
                      <p className="text-xs text-muted-foreground font-mono">{pos.code}</p>
                    </div>
                    <StatusBadge status={pos.isActive ? "ACTIVE" : "RESIGNED"} />
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline">{pos.orgLevel.name}</Badge>
                    <Badge variant="secondary">{pos.department.name}</Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">{formatSalaryRange(pos.minSalary, pos.maxSalary)}</p>
                      <p className="text-muted-foreground">Karyawan: <span className="font-medium text-foreground">{pos._count.employees}</span></p>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="icon-sm" onClick={() => openEdit(pos)}>
                        <Pencil className="size-4" />
                      </Button>
                      <Button variant="ghost" size="icon-sm" onClick={() => setDeleteTargetId(pos.id)}>
                        <Trash2 className="size-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
          <div className="hidden md:block">
          <div className="rounded-sm border border-border">
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
                {positions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="h-24 text-center">
                      Tidak ada data jabatan.
                    </TableCell>
                  </TableRow>
                ) : (
                  positions.map((pos) => (
                    <TableRow key={pos.id}>
                      <TableCell className="font-mono text-xs">
                        {pos.code}
                      </TableCell>
                      <TableCell className="font-medium">{pos.name}</TableCell>
                      <TableCell>{pos.department.name}</TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {pos.orgLevel.name}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {formatSalaryRange(pos.minSalary, pos.maxSalary)}
                      </TableCell>
                      <TableCell className="text-center">
                        {pos._count.employees}
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
                            onClick={() => setDeleteTargetId(pos.id)}
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
                  items={Object.fromEntries(departments.map((d) => [d.id, d.name]))}
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
                <Label>Level Organisasi</Label>
                <Select
                  value={form.orgLevelId || undefined}
                  items={Object.fromEntries(orgLevels.map((l) => [l.id, l.name]))}
                  onValueChange={(val) =>
                    setForm((prev) => ({
                      ...prev,
                      orgLevelId: val as string,
                    }))
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Pilih level" />
                  </SelectTrigger>
                  <SelectContent>
                    {orgLevels.map((lvl) => (
                      <SelectItem key={lvl.id} value={lvl.id}>
                        <span className="flex items-center gap-2">
                          <span className="text-muted-foreground font-mono text-xs">{lvl.rank}</span>
                          {lvl.name}
                        </span>
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
            <Button onClick={handleSubmit} disabled={saving}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {editingId ? "Simpan Perubahan" : "Tambah"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteTargetId !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteTargetId(null);
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
            <Button variant="outline" onClick={() => setDeleteTargetId(null)}>
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
