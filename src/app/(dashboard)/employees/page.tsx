"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import {
  ChevronLeft,
  ChevronRight,
  Eye,
  Pencil,
  Plus,
  Search,
  Users,
} from "lucide-react";

import { employees as allEmployees, departments } from "@/lib/dummy-data";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";

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

export default function EmployeesPage() {
  const [search, setSearch] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [currentPage, setCurrentPage] = useState(1);

  const activeEmployees = useMemo(
    () => allEmployees.filter((emp) => !emp.isDeleted),
    []
  );

  const filtered = useMemo(() => {
    const searchLower = search.toLowerCase();
    return activeEmployees.filter((emp) => {
      const matchesSearch =
        searchLower === "" ||
        `${emp.firstName} ${emp.lastName}`.toLowerCase().includes(searchLower) ||
        emp.employeeNumber.toLowerCase().includes(searchLower) ||
        emp.email.toLowerCase().includes(searchLower);

      const matchesDepartment =
        departmentFilter === "ALL" || emp.departmentId === departmentFilter;

      const matchesStatus =
        statusFilter === "ALL" || emp.status === statusFilter;

      const matchesType =
        typeFilter === "ALL" || emp.type === typeFilter;

      return matchesSearch && matchesDepartment && matchesStatus && matchesType;
    });
  }, [activeEmployees, search, departmentFilter, statusFilter, typeFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const safePage = Math.min(currentPage, totalPages);

  const paginated = useMemo(() => {
    const start = (safePage - 1) * ITEMS_PER_PAGE;
    return filtered.slice(start, start + ITEMS_PER_PAGE);
  }, [filtered, safePage]);

  // Reset page to 1 when filters change
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

  // Generate page numbers for pagination
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

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10">
            <Users className="size-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Data Karyawan</h1>
            <p className="text-sm text-muted-foreground">
              Kelola data dan informasi seluruh karyawan
            </p>
          </div>
        </div>
        <Button render={<Link href="/employees/new" />}>
          <Plus data-icon="inline-start" />
          Tambah Karyawan
        </Button>
      </div>

      {/* Filter bar */}
      <Card className="bg-muted/40">
        <CardContent className="pt-4 pb-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
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

            <Select value={departmentFilter} onValueChange={handleDepartmentChange}>
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

      {/* Data table */}
      <Card>
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
              {paginated.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="h-24 text-center text-muted-foreground">
                    Tidak ada data karyawan ditemukan.
                  </TableCell>
                </TableRow>
              ) : (
                paginated.map((emp) => (
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
                    <TableCell>{emp.departmentName}</TableCell>
                    <TableCell>{emp.positionName}</TableCell>
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
                        <Button
                          variant="ghost"
                          size="icon-xs"
                          render={<Link href={`/employees/${emp.id}`} />}
                        >
                          <Eye className="size-4" />
                          <span className="sr-only">Lihat</span>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon-xs"
                          render={<Link href={`/employees/${emp.id}/edit`} />}
                        >
                          <Pencil className="size-4" />
                          <span className="sr-only">Edit</span>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>

        {/* Pagination */}
        <CardContent className="border-t">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Menampilkan {filtered.length === 0 ? 0 : (safePage - 1) * ITEMS_PER_PAGE + 1}
              &ndash;{Math.min(safePage * ITEMS_PER_PAGE, filtered.length)} dari{" "}
              {filtered.length} karyawan
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
            <p className="mt-1 text-xs text-muted-foreground text-right">
              Halaman {safePage} dari {totalPages}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
