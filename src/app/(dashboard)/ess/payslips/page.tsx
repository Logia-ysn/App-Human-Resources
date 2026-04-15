"use client";

import { useAuth } from "@/components/providers/auth-context";
import { usePayslips } from "@/hooks/use-payroll";
import { StatusBadge } from "@/components/shared/status-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Wallet } from "lucide-react";
import { LoadingState } from "@/components/shared/loading-state";
import { EmptyRow } from "@/components/shared/empty-row";

const MONTH_LABELS = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember",
];

function formatCurrency(amount: string | number): string {
  const num = typeof amount === "string" ? Number(amount) : amount;
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(num || 0);
}

export default function EssPayslipsPage() {
  const { employeeId } = useAuth();
  const { payslips, isLoading } = usePayslips({ employeeId: employeeId ?? undefined });

  if (!employeeId) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center space-y-2">
          <Wallet className="h-12 w-12 text-muted-foreground/40 mx-auto" />
          <p className="text-lg font-medium">Data karyawan tidak ditemukan</p>
          <p className="text-sm text-muted-foreground">
            Akun Anda belum terhubung dengan data karyawan.
          </p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <LoadingState />
    );
  }

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex items-center gap-2.5 border-b border-border pb-4">
        <Wallet className="size-5 text-muted-foreground" strokeWidth={1.75} />
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Slip Gaji Saya</h1>
          <p className="text-xs text-muted-foreground">
            Riwayat slip gaji Anda
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Riwayat Slip Gaji</CardTitle>
        </CardHeader>
        <CardContent className="px-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead>Periode</TableHead>
                <TableHead className="text-center">Hadir / Kerja</TableHead>
                <TableHead className="text-right">Gaji Pokok</TableHead>
                <TableHead className="text-right">Gross</TableHead>
                <TableHead className="text-right">Potongan</TableHead>
                <TableHead className="text-right">Net</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payslips.length === 0 ? (
                <EmptyRow colSpan={7}>Belum ada slip gaji.</EmptyRow>
              ) : (
                payslips.map((s) => (
                  <TableRow key={s.id} className="hover:bg-muted/50">
                    <TableCell className="font-medium">
                      {MONTH_LABELS[s.payrollPeriod.month - 1]} {s.payrollPeriod.year}
                    </TableCell>
                    <TableCell className="text-center">
                      {s.presentDays} / {s.workDays}
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      {formatCurrency(s.basicSalary)}
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      {formatCurrency(s.grossSalary)}
                    </TableCell>
                    <TableCell className="text-right font-mono text-destructive">
                      {formatCurrency(s.totalDeductions)}
                    </TableCell>
                    <TableCell className="text-right font-mono font-semibold">
                      {formatCurrency(s.netSalary)}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={s.paidAt ? "PAID" : s.payrollPeriod.status} />
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
