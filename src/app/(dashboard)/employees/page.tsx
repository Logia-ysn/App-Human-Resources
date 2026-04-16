"use client";

import { useState } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import { ChevronLeft, ChevronRight, Eye, Filter, Pencil, Plus, Search, Trash2, Download, Users } from "lucide-react";
import { toast } from "sonner";

import { cn } from "@/lib/utils";
import { useEmployees, useDeleteEmployee } from "@/hooks/use-employees";
import { useDepartments } from "@/hooks/use-departments";
import { StatusBadge } from "@/components/shared/status-badge";
import { useAuth } from "@/components/providers/auth-context";
import { hasMinRole } from "@/lib/utils/permissions";

import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button, buttonVariants } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { EmployeeImportDialog } from "@/components/employees/employee-import-dialog";
import { LoadingState } from "@/components/shared/loading-state";
import { EmptyRow } from "@/components/shared/empty-row";

const ITEMS_PER_PAGE = 10;

const TYPE_LABELS: Record<string, string> = {
  PERMANENT: "Tetap",
  CONTRACT: "Kontrak",
  PROBATION: "Probation",
  INTERNSHIP: "Magang",
};

const STATUS_OPTIONS = [
  { value: "ALL", label: "Semua" },
  { value: "ACTIVE", label: "Aktif" },
  { value: "PROBATION", label: "Probation" },
  { value: "RESIGNED", label: "Resign" },
  { value: "TERMINATED", label: "Diberhentikan" },
  { value: "RETIRED", label: "Pensiun" },
];

const TYPE_OPTIONS = [
  { value: "ALL", label: "Semua" },
  { value: "PERMANENT", label: "Tetap" },
  { value: "CONTRACT", label: "Kontrak" },
  { value: "PROBATION", label: "Probation" },
  { value: "INTERNSHIP", label: "Magang" },
];

function getInitials(firstName: string, lastName: string): string {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
}

function activeFilterCount(
  departmentFilter: string,
  statusFilter: string,
  typeFilter: string,
): number {
  let count = 0;
  if (departmentFilter !== "ALL") count++;
  if (statusFilter !== "ALL") count++;
  if (typeFilter !== "ALL") count++;
  return count;
}

export default function EmployeesPage() {
  const { role } = useAuth();
  const canEdit = hasMinRole(role, "HR_ADMIN");

  const [search, setSearch] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [deleteTargetName, setDeleteTargetName] = useState("");

  const { departments } = useDepartments();
  const { employees, meta, isLoading, mutate } = useEmployees({
    page: currentPage,
    limit: ITEMS_PER_PAGE,
    search: search || undefined,
    departmentId: departmentFilter !== "ALL" ? departmentFilter : undefined,
    status: statusFilter !== "ALL" ? statusFilter : undefined,
    type: typeFilter !== "ALL" ? typeFilter : undefined,
  });

  const deleteMutation = useDeleteEmployee(deleteTargetId ?? "");

  const total = meta?.total ?? 0;
  const totalPages = meta?.totalPages ?? 1;
  const safePage = Math.min(currentPage, totalPages);

  async function confirmDelete() {
    if (!deleteTargetId) return;
    try {
      await deleteMutation.trigger();
      toast.success("Karyawan berhasil dihapus");
      await mutate();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Gagal menghapus";
      toast.error(msg);
    }
    setDeleteTargetId(null);
  }

  function openDeleteDialog(id: string, name: string) {
    setDeleteTargetId(id);
    setDeleteTargetName(name);
  }

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setCurrentPage(1);
  };

  const handleDepartmentChange = (value: string | null) => {
    setDepartmentFilter(value ?? "ALL");
    setCurrentPage(1);
  };

  const handleStatusChange = (value: string | null) => {
    setStatusFilter(value ?? "ALL");
    setCurrentPage(1);
  };

  const handleTypeChange = (value: string | null) => {
    setTypeFilter(value ?? "ALL");
    setCurrentPage(1);
  };

  const getPageNumbers = (): (number | "ellipsis")[] => {
    if (totalPages <= 5) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    const pages: (number | "ellipsis")[] = [1];
    if (safePage > 3) pages.push("ellipsis");
    const start = Math.max(2, safePage - 1);
    const end = Math.min(totalPages - 1, safePage + 1);
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    if (safePage < totalPages - 2) pages.push("ellipsis");
    if (totalPages > 1) pages.push(totalPages);
    return pages;
  };

  const filterCount = activeFilterCount(departmentFilter, statusFilter, typeFilter);

  const filterControls = (
    <div className="space-y-3">
      <Select
        value={departmentFilter}
        items={{ ALL: "Semua Departemen", ...Object.fromEntries(departments.map((d) => [d.id, d.name])) }}
        onValueChange={handleDepartmentChange}
      >
        <SelectTrigger>
          <SelectValue placeholder="Departemen" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="ALL">Semua Departemen</SelectItem>
          {departments.map((dept) => (
            <SelectItem key={dept.id} value={dept.id}>
              {dept.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={statusFilter} onValueChange={handleStatusChange}>
        <SelectTrigger>
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          {STATUS_OPTIONS.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={typeFilter} onValueChange={handleTypeChange}>
        <SelectTrigger>
          <SelectValue placeholder="Tipe" />
        </SelectTrigger>
        <SelectContent>
          {TYPE_OPTIONS.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );

  if (isLoading) {
    return (
      <LoadingState />
    );
  }

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between border-b border-border pb-4">
        <div className="flex items-center gap-2.5">
          <Users className="size-5 text-muted-foreground" strokeWidth={1.75} />
          <div>
            <h1 className="text-xl font-semibold tracking-tight">Data Karyawan</h1>
            <p className="hidden text-xs text-muted-foreground sm:block">
              Kelola data dan informasi seluruh karyawan
            </p>
          </div>
        </div>
        {canEdit && (
          <div className="hidden md:flex items-center gap-2">
            <EmployeeImportDialog onDone={() => window.location.reload()} />
            <Button
              variant="outline"
              onClick={async () => {
                try {
                  const res = await fetch("/api/employees/export");
                  if (!res.ok) {
                    const msg = res.status === 403
                      ? "Tidak memiliki akses (butuh role HR Admin)"
                      : `Gagal export (status ${res.status})`;
                    toast.error(msg);
                    return;
                  }
                  const blob = await res.blob();
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement("a");
                  a.href = url;
                  a.download = `employees-${new Date().toISOString().split("T")[0]}.xlsx`;
                  a.click();
                  URL.revokeObjectURL(url);
                  toast.success("Export berhasil");
                } catch (err) {
                  toast.error(err instanceof Error ? err.message : "Gagal export");
                }
              }}
            >
              <Download data-icon="inline-start" />
              Export
            </Button>
            <Link href="/employees/new" className={cn(buttonVariants())}>
              <Plus data-icon="inline-start" />
              Tambah Karyawan
            </Link>
          </div>
        )}
      </div>

      {/* Filter bar */}
      <Card className="bg-muted/40">
        <CardContent className="pt-4 pb-4">
          {/* Mobile: search + filter button */}
          <div className="flex items-center gap-2 md:hidden">
            <InputGroup className="flex-1">
              <InputGroupAddon align="inline-start">
                <Search className="size-4 text-muted-foreground" />
              </InputGroupAddon>
              <InputGroupInput
                placeholder="Cari nama, email..."
                value={search}
                onChange={(e) => handleSearchChange(e.target.value)}
              />
            </InputGroup>

            <Sheet>
              <SheetTrigger
                render={
                  <Button variant="outline" size="default" className="shrink-0 gap-1.5" />
                }
              >
                <Filter className="size-4" />
                Filter
                {filterCount > 0 && (
                  <Badge className="ml-0.5 size-5 justify-center rounded-full px-0 text-[10px]">
                    {filterCount}
                  </Badge>
                )}
              </SheetTrigger>
              <SheetContent side="bottom" className="px-4 pb-6">
                <SheetHeader>
                  <SheetTitle>Filter Karyawan</SheetTitle>
                  <SheetDescription>Pilih filter untuk mempersempit data</SheetDescription>
                </SheetHeader>
                {filterControls}
              </SheetContent>
            </Sheet>
          </div>

          {/* Desktop: inline filters */}
          <div className="hidden md:grid md:grid-cols-4 md:gap-3">
            <InputGroup>
              <InputGroupAddon align="inline-start">
                <Search className="size-4 text-muted-foreground" />
              </InputGroupAddon>
              <InputGroupInput
                placeholder="Cari nama, no. karyawan, email..."
                value={search}
                onChange={(e) => handleSearchChange(e.target.value)}
              />
            </InputGroup>

            <Select
              value={departmentFilter}
              items={{ ALL: "Semua Departemen", ...Object.fromEntries(departments.map((d) => [d.id, d.name])) }}
              onValueChange={handleDepartmentChange}
            >
              <SelectTrigger>
                <SelectValue placeholder="Departemen" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Semua Departemen</SelectItem>
                {departments.map((dept) => (
                  <SelectItem key={dept.id} value={dept.id}>
                    {dept.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={handleStatusChange}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={typeFilter} onValueChange={handleTypeChange}>
              <SelectTrigger>
                <SelectValue placeholder="Tipe" />
              </SelectTrigger>
              <SelectContent>
                {TYPE_OPTIONS.map((opt) => (
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
      <div className="md:hidden">
        {employees.length === 0 ? (
          <Card>
            <CardContent className="flex h-24 items-center justify-center text-muted-foreground">
              Tidak ada data karyawan ditemukan.
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {employees.map((emp) => (
              <Link key={emp.id} href={`/employees/${emp.id}`} className="block">
                <Card className="transition-colors hover:bg-muted/50">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarFallback className="text-xs">
                          {getInitials(emp.firstName, emp.lastName)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">
                          {emp.firstName} {emp.lastName}
                        </p>
                        <p className="truncate text-xs text-muted-foreground">
                          {emp.email}
                        </p>
                      </div>
                    </div>

                    <div className="mt-3 flex flex-wrap items-center gap-1.5">
                      <Badge variant="secondary" className="text-[10px]">
                        {emp.department.name}
                      </Badge>
                      <StatusBadge status={emp.status} />
                    </div>

                    <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                      <span className="truncate">{emp.position.name}</span>
                      <span className="shrink-0">
                        {format(new Date(emp.joinDate), "dd MMM yyyy", { locale: idLocale })}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Desktop table view */}
      <Card className="hidden md:block">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead>No. Karyawan</TableHead>
                <TableHead>Nama</TableHead>
                <TableHead>Departemen</TableHead>
                <TableHead>Jabatan</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Tipe</TableHead>
                <TableHead>Tgl Masuk</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {employees.length === 0 ? (
                <EmptyRow colSpan={8}>Tidak ada data karyawan ditemukan.</EmptyRow>
              ) : (
                employees.map((emp) => (
                  <TableRow
                    key={emp.id}
                    className="transition-colors hover:bg-muted/50 even:bg-muted/30"
                  >
                    <TableCell className="font-mono text-xs">
                      {emp.employeeNumber}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar size="sm">
                          <AvatarFallback className="text-xs">
                            {getInitials(emp.firstName, emp.lastName)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">
                            {emp.firstName} {emp.lastName}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {emp.email}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{emp.department.name}</TableCell>
                    <TableCell>{emp.position.name}</TableCell>
                    <TableCell>
                      <StatusBadge status={emp.status} />
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{TYPE_LABELS[emp.type] ?? emp.type}</Badge>
                    </TableCell>
                    <TableCell>
                      {format(new Date(emp.joinDate), "dd MMM yyyy", { locale: idLocale })}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Link
                          href={`/employees/${emp.id}`}
                          className={cn(buttonVariants({ variant: "ghost", size: "icon-xs" }))}
                        >
                          <Eye className="size-4" />
                          <span className="sr-only">Lihat</span>
                        </Link>
                        {canEdit && (
                          <>
                            <Link
                              href={`/employees/${emp.id}/edit`}
                              className={cn(buttonVariants({ variant: "ghost", size: "icon-xs" }))}
                            >
                              <Pencil className="size-4" />
                              <span className="sr-only">Edit</span>
                            </Link>
                            <Button
                              variant="ghost"
                              size="icon-xs"
                              onClick={(e) => {
                                e.preventDefault();
                                openDeleteDialog(emp.id, `${emp.firstName} ${emp.lastName}`);
                              }}
                            >
                              <Trash2 className="size-4 text-destructive" />
                              <span className="sr-only">Hapus</span>
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Pagination */}
      <Card>
        <CardContent>
          {/* Mobile pagination: simple prev/next */}
          <div className="flex items-center justify-between md:hidden">
            <Button
              variant="outline"
              size="sm"
              disabled={safePage <= 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            >
              <ChevronLeft className="size-4" />
              <span className="sr-only">Previous</span>
            </Button>
            <span className="text-sm text-muted-foreground">
              {safePage} / {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={safePage >= totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            >
              <ChevronRight className="size-4" />
              <span className="sr-only">Next</span>
            </Button>
          </div>

          {/* Desktop pagination: full */}
          <div className="hidden md:flex md:items-center md:justify-between">
            <p className="text-sm text-muted-foreground">
              Menampilkan {total === 0 ? 0 : (safePage - 1) * ITEMS_PER_PAGE + 1}
              &ndash;{Math.min(safePage * ITEMS_PER_PAGE, total)} dari{" "}
              {total} karyawan
            </p>
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="icon-sm"
                disabled={safePage <= 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              >
                <ChevronLeft className="size-4" />
                <span className="sr-only">Previous</span>
              </Button>

              {getPageNumbers().map((page, idx) =>
                page === "ellipsis" ? (
                  <span
                    key={`ellipsis-${idx}`}
                    className="flex size-8 items-center justify-center text-sm text-muted-foreground"
                  >
                    ...
                  </span>
                ) : (
                  <Button
                    key={page}
                    variant={safePage === page ? "default" : "outline"}
                    size="icon-sm"
                    onClick={() => setCurrentPage(page)}
                  >
                    {page}
                  </Button>
                )
              )}

              <Button
                variant="outline"
                size="icon-sm"
                disabled={safePage >= totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              >
                <ChevronRight className="size-4" />
                <span className="sr-only">Next</span>
              </Button>
            </div>
          </div>

          {totalPages > 1 && (
            <p className="mt-1 hidden text-xs text-muted-foreground text-right md:block">
              Halaman {safePage} dari {totalPages}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Mobile FAB: add employee */}
      {canEdit && (
        <Link
          href="/employees/new"
          className={cn(
            buttonVariants(),
            "fixed bottom-6 right-6 z-40 size-14 rounded-full shadow-lg md:hidden [&_svg]:size-6"
          )}
        >
          <Plus />
          <span className="sr-only">Tambah Karyawan</span>
        </Link>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteTargetId !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteTargetId(null);
        }}
      >
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Hapus Karyawan</DialogTitle>
            <DialogDescription>
              Apakah Anda yakin ingin menghapus karyawan{" "}
              <span className="font-semibold text-foreground">
                {deleteTargetName}
              </span>
              ? Data karyawan akan ditandai sebagai dihapus.
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
