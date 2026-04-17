"use client";

import { useMemo, useState } from "react";
import { Wallet, FileText, Calendar, TrendingUp, Users } from "lucide-react";

import { usePayrollPeriods, usePayslips } from "@/hooks/use-payroll";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { LoadingState } from "@/components/shared/loading-state";
import { EmptyRow } from "@/components/shared/empty-row";

const MONTH_LABELS = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember",
];

function formatCurrency(amount: number | string): string {
  const num = typeof amount === "string" ? Number(amount) : amount;
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(num || 0);
}

export default function PayrollPage() {
  const currentYear = new Date().getFullYear();
  const [year, setYear] = useState(currentYear);
  const { periods, isLoading } = usePayrollPeriods(year);
  const { payslips, isLoading: payslipsLoading } = usePayslips({ year });

  const yearOptions = useMemo(() => {
    const years: number[] = [];
    for (let y = currentYear - 3; y <= currentYear + 1; y++) years.push(y);
    return years;
  }, [currentYear]);

  const stats = useMemo(() => {
    const totalPeriods = periods.length;
    const totalEmployees = periods.reduce((s, p) => s + p.totalEmployees, 0);
    const totalNet = periods.reduce((s, p) => s + Number(p.totalNet), 0);
    const paidPeriods = periods.filter((p) => p.status === "PAID").length;
    return { totalPeriods, totalEmployees, totalNet, paidPeriods };
  }, [periods]);

  if (isLoading || payslipsLoading) {
    return (
      <LoadingState />
    );
  }

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex items-center gap-2.5 border-b border-border pb-4">
        <Wallet className="size-5 text-muted-foreground" strokeWidth={1.75} />
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Penggajian</h1>
          <p className="text-xs text-muted-foreground">
            Kelola periode payroll & slip gaji karyawan
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard title="Total Periode" value={stats.totalPeriods} icon={Calendar} />
        <StatCard title="Total Net" value={formatCurrency(stats.totalNet)} icon={TrendingUp} />
        <StatCard title="Total Karyawan" value={stats.totalEmployees} icon={Users} />
        <StatCard title="Dibayar" value={stats.paidPeriods} icon={FileText} />
      </div>

      <Card>
        <CardContent className="flex flex-wrap items-center gap-3 py-4">
          <span className="text-sm font-medium">Tahun:</span>
          <Select value={String(year)} onValueChange={(v) => setYear(Number(v))}>
            <SelectTrigger className="w-full sm:w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {yearOptions.map((y) => (
                <SelectItem key={y} value={String(y)}>
                  {y}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <Tabs defaultValue="periods">
        <TabsList>
          <TabsTrigger value="periods">Periode Payroll</TabsTrigger>
          <TabsTrigger value="payslips">Slip Gaji</TabsTrigger>
        </TabsList>

        <TabsContent value="periods">
          <Card>
            <CardHeader>
              <CardTitle>Periode Payroll {year}</CardTitle>
            </CardHeader>
            <CardContent className="px-0">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead>Periode</TableHead>
                    <TableHead className="text-center">Karyawan</TableHead>
                    <TableHead className="text-right">Total Gross</TableHead>
                    <TableHead className="text-right">Total Deduksi</TableHead>
                    <TableHead className="text-right">Total Net</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {periods.length === 0 ? (
                    <EmptyRow colSpan={6}>Belum ada periode payroll untuk tahun {year}.</EmptyRow>
                  ) : (
                    periods.map((p) => (
                      <TableRow key={p.id} className="hover:bg-muted/50">
                        <TableCell className="font-medium">
                          {MONTH_LABELS[p.month - 1]} {p.year}
                        </TableCell>
                        <TableCell className="text-center">{p.totalEmployees}</TableCell>
                        <TableCell className="text-right font-mono">
                          {formatCurrency(p.totalGross)}
                        </TableCell>
                        <TableCell className="text-right font-mono text-destructive">
                          {formatCurrency(p.totalDeductions)}
                        </TableCell>
                        <TableCell className="text-right font-mono font-semibold">
                          {formatCurrency(p.totalNet)}
                        </TableCell>
                        <TableCell>
                          <StatusBadge status={p.status} />
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payslips">
          <Card>
            <CardHeader>
              <CardTitle>Slip Gaji {year}</CardTitle>
            </CardHeader>
            <CardContent className="px-0">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead>Karyawan</TableHead>
                    <TableHead>Departemen</TableHead>
                    <TableHead>Periode</TableHead>
                    <TableHead className="text-center">Hadir / Kerja</TableHead>
                    <TableHead className="text-right">Gross</TableHead>
                    <TableHead className="text-right">Net</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payslips.length === 0 ? (
                    <EmptyRow colSpan={7}>Belum ada slip gaji untuk tahun {year}.</EmptyRow>
                  ) : (
                    payslips.map((s) => (
                      <TableRow key={s.id} className="hover:bg-muted/50">
                        <TableCell className="font-medium">
                          {s.employee.firstName} {s.employee.lastName}
                          <div className="text-xs text-muted-foreground font-mono">
                            {s.employee.employeeNumber}
                          </div>
                        </TableCell>
                        <TableCell>{s.employee.department.name}</TableCell>
                        <TableCell>
                          {MONTH_LABELS[s.payrollPeriod.month - 1]} {s.payrollPeriod.year}
                        </TableCell>
                        <TableCell className="text-center">
                          {s.presentDays} / {s.workDays}
                        </TableCell>
                        <TableCell className="text-right font-mono">
                          {formatCurrency(s.grossSalary)}
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
        </TabsContent>
      </Tabs>
    </div>
  );
}
