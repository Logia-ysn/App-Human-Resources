"use client";

import { useMemo } from "react";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import { Receipt, TrendingUp, Clock, CheckCircle2 } from "lucide-react";

import { useClaims } from "@/hooks/use-expenses";
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
import { Badge } from "@/components/ui/badge";
import { LoadingState } from "@/components/shared/loading-state";
import { EmptyRow } from "@/components/shared/empty-row";

const CATEGORY_LABELS: Record<string, string> = {
  TRANSPORT: "Transport",
  MEAL: "Makan",
  ACCOMMODATION: "Akomodasi",
  COMMUNICATION: "Komunikasi",
  OFFICE_SUPPLIES: "ATK",
  TRAINING: "Training",
  MEDICAL: "Medis",
  OTHER: "Lainnya",
};

function formatCurrency(amount: string | number): string {
  const num = typeof amount === "string" ? Number(amount) : amount;
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(num || 0);
}

export default function ClaimsPage() {
  const { claims, isLoading } = useClaims();

  const stats = useMemo(() => {
    const pending = claims.filter((c) => c.status === "PENDING").length;
    const approved = claims.filter((c) => c.status === "APPROVED").length;
    const total = claims.reduce((s, c) => s + Number(c.totalAmount), 0);
    return { pending, approved, total, count: claims.length };
  }, [claims]);

  if (isLoading) {
    return (
      <LoadingState />
    );
  }

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex items-center gap-2.5 border-b border-border pb-4">
        <Receipt className="size-5 text-muted-foreground" strokeWidth={1.75} />
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Klaim Pengeluaran</h1>
          <p className="text-xs text-muted-foreground">
            Daftar klaim reimbursement karyawan
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard title="Total Klaim" value={stats.count} icon={Receipt} />
        <StatCard title="Menunggu" value={stats.pending} icon={Clock} />
        <StatCard title="Disetujui" value={stats.approved} icon={CheckCircle2} />
        <StatCard title="Nilai Total" value={formatCurrency(stats.total)} icon={TrendingUp} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Daftar Klaim</CardTitle>
        </CardHeader>
        <CardContent className="px-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead>Karyawan</TableHead>
                <TableHead>Departemen</TableHead>
                <TableHead>Judul</TableHead>
                <TableHead>Kategori</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead>Tgl. Submit</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {claims.length === 0 ? (
                <EmptyRow colSpan={7}>Belum ada klaim pengeluaran.</EmptyRow>
              ) : (
                claims.map((c) => {
                  const uniqueCategories = [...new Set(c.items.map((i) => i.category))];
                  return (
                    <TableRow key={c.id} className="hover:bg-muted/50">
                      <TableCell className="font-medium">
                        {c.employee.firstName} {c.employee.lastName}
                        <div className="text-xs text-muted-foreground font-mono">
                          {c.employee.employeeNumber}
                        </div>
                      </TableCell>
                      <TableCell>{c.employee.department.name}</TableCell>
                      <TableCell>
                        <span className="font-medium">{c.title}</span>
                        <div className="text-xs text-muted-foreground">
                          {c.items.length} item
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {uniqueCategories.slice(0, 2).map((cat) => (
                            <Badge key={cat} variant="outline" className="text-xs">
                              {CATEGORY_LABELS[cat] ?? cat}
                            </Badge>
                          ))}
                          {uniqueCategories.length > 2 && (
                            <Badge variant="outline" className="text-xs">
                              +{uniqueCategories.length - 2}
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-mono font-semibold">
                        {formatCurrency(c.totalAmount)}
                      </TableCell>
                      <TableCell>
                        {format(new Date(c.submittedDate), "dd MMM yyyy", { locale: idLocale })}
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={c.status} />
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
