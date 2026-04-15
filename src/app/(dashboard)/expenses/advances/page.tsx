"use client";
import { LoadingState } from "@/components/shared/loading-state";

import { useMemo } from "react";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import { Banknote, TrendingUp, Clock, CheckCircle2 } from "lucide-react";

import { useAdvances } from "@/hooks/use-expenses";
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
import { EmptyRow } from "@/components/shared/empty-row";

function formatCurrency(amount: string | number): string {
  const num = typeof amount === "string" ? Number(amount) : amount;
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(num || 0);
}

export default function AdvancesPage() {
  const { advances, isLoading } = useAdvances();

  const stats = useMemo(() => {
    const pending = advances.filter((a) => a.status === "PENDING").length;
    const approved = advances.filter((a) => a.status === "APPROVED").length;
    const total = advances.reduce((s, a) => s + Number(a.amount), 0);
    return { pending, approved, total, count: advances.length };
  }, [advances]);

  if (isLoading) {
    return (
      <LoadingState />
    );
  }

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex items-center gap-2.5 border-b border-border pb-4">
        <Banknote className="size-5 text-muted-foreground" strokeWidth={1.75} />
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Kasbon Karyawan</h1>
          <p className="text-xs text-muted-foreground">
            Daftar permintaan dan persetujuan kasbon
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard title="Total Kasbon" value={stats.count} icon={Banknote} />
        <StatCard title="Menunggu" value={stats.pending} icon={Clock} />
        <StatCard title="Disetujui" value={stats.approved} icon={CheckCircle2} />
        <StatCard title="Nilai Total" value={formatCurrency(stats.total)} icon={TrendingUp} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Daftar Kasbon</CardTitle>
        </CardHeader>
        <CardContent className="px-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead>Karyawan</TableHead>
                <TableHead>Departemen</TableHead>
                <TableHead>Keperluan</TableHead>
                <TableHead className="text-right">Nilai</TableHead>
                <TableHead className="text-right">Dikembalikan</TableHead>
                <TableHead>Tgl. Permintaan</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {advances.length === 0 ? (
                <EmptyRow colSpan={7}>Belum ada permintaan kasbon.</EmptyRow>
              ) : (
                advances.map((a) => (
                  <TableRow key={a.id} className="hover:bg-muted/50">
                    <TableCell className="font-medium">
                      {a.employee.firstName} {a.employee.lastName}
                      <div className="text-xs text-muted-foreground font-mono">
                        {a.employee.employeeNumber}
                      </div>
                    </TableCell>
                    <TableCell>{a.employee.department.name}</TableCell>
                    <TableCell className="max-w-[260px]">
                      <span className="line-clamp-2 text-sm">{a.purpose}</span>
                    </TableCell>
                    <TableCell className="text-right font-mono font-semibold">
                      {formatCurrency(a.amount)}
                    </TableCell>
                    <TableCell className="text-right font-mono text-muted-foreground">
                      {Number(a.returnedAmount) > 0 ? formatCurrency(a.returnedAmount) : "-"}
                    </TableCell>
                    <TableCell>
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
        </CardContent>
      </Card>
    </div>
  );
}
