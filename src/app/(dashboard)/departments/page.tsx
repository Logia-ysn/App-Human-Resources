"use client";

import { useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

import type { Department } from "@/lib/dummy-data";
import { useAppStore } from "@/lib/store/app-store";
import { StatusBadge } from "@/components/shared/status-badge";
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

type DepartmentFormData = {
  name: string;
  code: string;
  description: string;
  parentId: string | null;
  isActive: boolean;
};

const EMPTY_FORM: DepartmentFormData = {
  name: "",
  code: "",
  description: "",
  parentId: null,
  isActive: true,
};

export default function DepartmentsPage() {
  const departments = useAppStore((s) => s.departments);
  const addDepartment = useAppStore((s) => s.addDepartment);
  const updateDepartment = useAppStore((s) => s.updateDepartment);
  const deleteDepartment = useAppStore((s) => s.deleteDepartment);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<DepartmentFormData>(EMPTY_FORM);
  const [deleteTarget, setDeleteTarget] = useState<Department | null>(null);

  function openAddDialog() {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setDialogOpen(true);
  }

  function openEditDialog(dept: Department) {
    setEditingId(dept.id);
    setForm({
      name: dept.name,
      code: dept.code,
      description: dept.description,
      parentId: dept.parentId,
      isActive: dept.isActive,
    });
    setDialogOpen(true);
  }

  function handleSave() {
    if (!form.name.trim() || !form.code.trim()) return;

    // Prevent circular parent assignment
    if (editingId && form.parentId === editingId) {
      toast.error("Departemen tidak bisa menjadi parent dirinya sendiri");
      return;
    }

    if (editingId) {
      updateDepartment(editingId, form);
      toast.success("Departemen berhasil diperbarui");
    } else {
      const newDept: Department = {
        id: `dept-${Date.now()}`,
        name: form.name,
        code: form.code,
        description: form.description,
        parentId: form.parentId,
        headEmployeeId: null,
        headEmployeeName: null,
        isActive: form.isActive,
        employeeCount: 0,
        createdAt: new Date().toISOString().slice(0, 10),
      };
      addDepartment(newDept);
      toast.success("Departemen berhasil ditambahkan");
    }

    setDialogOpen(false);
  }

  function confirmDelete() {
    if (!deleteTarget) return;
    deleteDepartment(deleteTarget.id);
    toast.success("Departemen berhasil dihapus");
    setDeleteTarget(null);
  }

  function updateField<K extends keyof DepartmentFormData>(
    key: K,
    value: DepartmentFormData[K],
  ) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-lg sm:text-2xl font-bold tracking-tight">
          Manajemen Departemen
        </h1>
        <Button onClick={openAddDialog} size="sm" className="sm:size-default">
          <Plus className="mr-1 h-4 w-4" />
          <span className="hidden sm:inline">Tambah Departemen</span>
          <span className="sm:hidden">Tambah</span>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Daftar Departemen</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Mobile card view */}
          <div className="space-y-3 md:hidden">
            {departments.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">Belum ada departemen</div>
            ) : (
              departments.map((dept) => (
                <div key={dept.id} className="rounded-lg border p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium">{dept.name}</p>
                      <p className="text-xs text-muted-foreground font-mono">{dept.code}</p>
                    </div>
                    <StatusBadge status={dept.isActive ? "ACTIVE" : "RESIGNED"} />
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <div className="space-y-1">
                      <p className="text-muted-foreground">Kepala: <span className="text-foreground">{dept.headEmployeeName ?? "-"}</span></p>
                      <p className="text-muted-foreground">Karyawan: <span className="font-medium text-foreground">{dept.employeeCount}</span></p>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="icon-sm" onClick={() => openEditDialog(dept)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon-sm" onClick={() => setDeleteTarget(dept)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Desktop table view */}
          <div className="hidden md:block">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Kode</TableHead>
                <TableHead>Nama</TableHead>
                <TableHead>Deskripsi</TableHead>
                <TableHead>Kepala Dept</TableHead>
                <TableHead>Jumlah Karyawan</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {departments.map((dept) => (
                <TableRow key={dept.id}>
                  <TableCell className="font-medium">{dept.code}</TableCell>
                  <TableCell>{dept.name}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {dept.description}
                  </TableCell>
                  <TableCell>{dept.headEmployeeName ?? "-"}</TableCell>
                  <TableCell>{dept.employeeCount}</TableCell>
                  <TableCell>
                    <StatusBadge
                      status={dept.isActive ? "ACTIVE" : "RESIGNED"}
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => openEditDialog(dept)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => setDeleteTarget(dept)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {departments.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    Belum ada departemen
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingId ? "Edit Departemen" : "Tambah Departemen"}
            </DialogTitle>
            <DialogDescription>
              {editingId
                ? "Perbarui informasi departemen."
                : "Isi form untuk menambahkan departemen baru."}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-2">
            <div className="grid gap-2">
              <Label htmlFor="dept-name">Nama Departemen</Label>
              <Input
                id="dept-name"
                value={form.name}
                onChange={(e) => updateField("name", e.target.value)}
                placeholder="contoh: Human Resources"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="dept-code">Kode</Label>
              <Input
                id="dept-code"
                value={form.code}
                onChange={(e) => updateField("code", e.target.value)}
                placeholder="contoh: HR"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="dept-desc">Deskripsi</Label>
              <Textarea
                id="dept-desc"
                value={form.description}
                onChange={(e) => updateField("description", e.target.value)}
                placeholder="Deskripsi singkat departemen"
              />
            </div>

            <div className="grid gap-2">
              <Label>Departemen Induk</Label>
              <Select
                value={form.parentId ?? ""}
                onValueChange={(val: string | null) =>
                  updateField("parentId", !val || val === "" ? null : val)
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Tidak ada (top-level)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Tidak ada (top-level)</SelectItem>
                  {departments
                    .filter((d) => d.id !== editingId)
                    .map((d) => (
                      <SelectItem key={d.id} value={d.id}>
                        {d.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="dept-active">Aktif</Label>
              <Switch
                id="dept-active"
                checked={form.isActive}
                onCheckedChange={(checked: boolean) =>
                  updateField("isActive", checked)
                }
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Batal
            </Button>
            <Button onClick={handleSave}>
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
            <DialogTitle>Hapus Departemen</DialogTitle>
            <DialogDescription>
              Apakah Anda yakin ingin menghapus departemen{" "}
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
