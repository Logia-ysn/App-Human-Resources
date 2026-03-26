"use client";

import { useState, useMemo } from "react";
import { Wallet, FileText, Download, CheckCircle, Clock } from "lucide-react";
import { toast } from "sonner";

import { useAppStore } from "@/lib/store/app-store";
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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const MONTH_NAMES: Record<number, string> = {
  1: "Januari",
  2: "Februari",
  3: "Maret",
  4: "April",
  5: "Mei",
  6: "Juni",
  7: "Juli",
  8: "Agustus",
  9: "September",
  10: "Oktober",
  11: "November",
  12: "Desember",
};

function formatIDR(n: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(n);
}

function formatIDRShort(n: number): string {
  if (n >= 1_000_000) {
    return `Rp${(n / 1_000_000).toFixed(1)}jt`;
  }
  if (n >= 1_000) {
    return `Rp${(n / 1_000).toFixed(0)}rb`;
  }
  return formatIDR(n);
}

function formatPeriodLabel(month: number, year: number): string {
  return `${MONTH_NAMES[month]} ${year}`;
}

export default function PayrollPage() {
  const payrollPeriods = useAppStore((s) => s.payrollPeriods);
  const payslips = useAppStore((s) => s.payslips);
  const updatePayrollPeriod = useAppStore((s) => s.updatePayrollPeriod);

  const [activeTab, setActiveTab] = useState("periode");
  const [processDialogOpen, setProcessDialogOpen] = useState(false);
  const [selectedPeriodId, setSelectedPeriodId] = useState<string | null>(null);

  // Determine latest period for payslip tab default
  const latestPeriod = useMemo(() => {
    const sorted = [...payrollPeriods].sort((a, b) => {
      if (a.year !== b.year) return b.year - a.year;
      return b.month - a.month;
    });
    return sorted[0] ?? null;
  }, [payrollPeriods]);

  const [slipPeriodId, setSlipPeriodId] = useState(latestPeriod?.id ?? "");

  // Summary stats
  const summaryStats = useMemo(() => {
    const totalPeriode = payrollPeriods.length;
    const sudahDibayar = payrollPeriods.filter((p) => p.status === "PAID").length;
    const menungguApproval = payrollPeriods.filter(
      (p) => p.status === "CALCULATED" || p.status === "PROCESSING"
    ).length;
    return { totalPeriode, sudahDibayar, menungguApproval };
  }, [payrollPeriods]);

  // Filtered payslips based on selected period
  const filteredPayslips = useMemo(
    () => payslips.filter((ps) => ps.periodId === slipPeriodId),
    [payslips, slipPeriodId]
  );

  // Selected period for payslip tab header
  const selectedSlipPeriod = useMemo(
    () => payrollPeriods.find((p) => p.id === slipPeriodId) ?? null,
    [payrollPeriods, slipPeriodId]
  );

  const handleProcessPayroll = () => {
    if (selectedPeriodId) {
      const period = payrollPeriods.find((p) => p.id === selectedPeriodId);
      if (period) {
        updatePayrollPeriod(selectedPeriodId, { status: "PAID" as const });
        toast.success(
          `Payroll ${formatPeriodLabel(period.month, period.year)} berhasil diproses`
        );
      }
    }
    setProcessDialogOpen(false);
    setSelectedPeriodId(null);
  };

  const handleDownloadPdf = (employeeName: string) => {
    toast.success(`Slip gaji ${employeeName} sedang diunduh...`);
  };

  const handleSlipPeriodChange = (value: string | null) => {
    if (value) {
      setSlipPeriodId(value);
    }
  };

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10">
          <Wallet className="size-5 text-primary" />
        </div>
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight">Penggajian</h1>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Kelola periode payroll dan slip gaji karyawan
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={(val) => setActiveTab(val)}>
        <TabsList>
          <TabsTrigger value="periode">
            <Wallet className="size-4" />
            Periode Payroll
          </TabsTrigger>
          <TabsTrigger value="slip">
            <FileText className="size-4" />
            Slip Gaji
          </TabsTrigger>
        </TabsList>

        {/* Tab: Periode Payroll */}
        <TabsContent value="periode">
          <div className="space-y-4 md:space-y-6">
            {/* Stat Cards - 2 col mobile (with 3rd spanning full), 3 col desktop */}
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
              <Card className="p-3 sm:p-4 shadow-sm border-l-4 border-l-blue-500">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-100">
                    <FileText className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-xl sm:text-2xl font-bold">{summaryStats.totalPeriode}</p>
                    <p className="text-[11px] sm:text-xs text-muted-foreground">Total Periode</p>
                  </div>
                </div>
              </Card>
              <Card className="p-3 sm:p-4 shadow-sm border-l-4 border-l-green-500">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-green-100">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  </div>
                  <div>
                    <p className="text-xl sm:text-2xl font-bold">{summaryStats.sudahDibayar}</p>
                    <p className="text-[11px] sm:text-xs text-muted-foreground">Sudah Dibayar</p>
                  </div>
                </div>
              </Card>
              <Card className="col-span-2 lg:col-span-1 p-3 sm:p-4 shadow-sm border-l-4 border-l-yellow-500">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-yellow-100">
                    <Clock className="h-4 w-4 text-yellow-600" />
                  </div>
                  <div>
                    <p className="text-xl sm:text-2xl font-bold">{summaryStats.menungguApproval}</p>
                    <p className="text-[11px] sm:text-xs text-muted-foreground">Menunggu Approval</p>
                  </div>
                </div>
              </Card>
            </div>

            {/* Mobile card view for payroll periods */}
            <div className="md:hidden space-y-3">
              {payrollPeriods.length === 0 ? (
                <Card className="p-4">
                  <p className="text-center text-sm text-muted-foreground">
                    Tidak ada data periode payroll.
                  </p>
                </Card>
              ) : (
                payrollPeriods.map((period) => (
                  <Card key={period.id} className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-sm">
                        {formatPeriodLabel(period.month, period.year)}
                      </span>
                      <StatusBadge status={period.status} />
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                      <div>
                        <p className="text-[11px] text-muted-foreground">Karyawan</p>
                        <p className="font-medium">{period.totalEmployees}</p>
                      </div>
                      <div>
                        <p className="text-[11px] text-muted-foreground">Total Net</p>
                        <p className="font-semibold text-green-700">{formatIDRShort(period.totalNet)}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {period.status === "CALCULATED" && (
                        <Button
                          size="sm"
                          className="flex-1"
                          onClick={() => {
                            setSelectedPeriodId(period.id);
                            setProcessDialogOpen(true);
                          }}
                        >
                          Proses Payroll
                        </Button>
                      )}
                      {period.status === "PAID" && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          onClick={() => {
                            setSlipPeriodId(period.id);
                            setActiveTab("slip");
                          }}
                        >
                          Lihat Slip
                        </Button>
                      )}
                    </div>
                  </Card>
                ))
              )}
            </div>

            {/* Desktop table view */}
            <div className="hidden md:block">
              <Card className="shadow-sm">
                <CardContent className="px-0">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/50">
                        <TableHead>Periode</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Jumlah Karyawan</TableHead>
                        <TableHead className="text-right">Total Gross</TableHead>
                        <TableHead className="text-right">Total Potongan</TableHead>
                        <TableHead className="text-right">Total Net</TableHead>
                        <TableHead className="text-right">Aksi</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {payrollPeriods.length === 0 ? (
                        <TableRow>
                          <TableCell
                            colSpan={7}
                            className="h-24 text-center text-muted-foreground"
                          >
                            Tidak ada data periode payroll.
                          </TableCell>
                        </TableRow>
                      ) : (
                        payrollPeriods.map((period) => (
                          <TableRow key={period.id} className="hover:bg-muted/50">
                            <TableCell className="font-medium">
                              {formatPeriodLabel(period.month, period.year)}
                            </TableCell>
                            <TableCell>
                              <StatusBadge status={period.status} />
                            </TableCell>
                            <TableCell className="text-right">
                              {period.totalEmployees}
                            </TableCell>
                            <TableCell className="text-right tabular-nums">
                              {formatIDR(period.totalGross)}
                            </TableCell>
                            <TableCell className="text-right tabular-nums">
                              {formatIDR(period.totalDeductions)}
                            </TableCell>
                            <TableCell className="text-right tabular-nums font-semibold">
                              {formatIDR(period.totalNet)}
                            </TableCell>
                            <TableCell className="text-right">
                              {period.status === "CALCULATED" && (
                                <Button
                                  size="sm"
                                  onClick={() => {
                                    setSelectedPeriodId(period.id);
                                    setProcessDialogOpen(true);
                                  }}
                                >
                                  Proses Payroll
                                </Button>
                              )}
                              {period.status === "PAID" && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    setSlipPeriodId(period.id);
                                    setActiveTab("slip");
                                  }}
                                >
                                  Lihat Slip
                                </Button>
                              )}
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Tab: Slip Gaji */}
        <TabsContent value="slip">
          <div className="space-y-4 md:space-y-6">
            {/* Period filter */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
              <span className="text-sm font-medium">Periode:</span>
              <Select value={slipPeriodId} onValueChange={handleSlipPeriodChange}>
                <SelectTrigger className="w-full sm:w-[220px]">
                  <SelectValue placeholder="Pilih periode" />
                </SelectTrigger>
                <SelectContent>
                  {payrollPeriods.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {formatPeriodLabel(p.month, p.year)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedSlipPeriod && (
                <Badge variant="outline">
                  {selectedSlipPeriod.totalEmployees} karyawan
                </Badge>
              )}
            </div>

            {/* Mobile card view for payslips */}
            <div className="md:hidden space-y-3">
              {filteredPayslips.length === 0 ? (
                <Card className="p-4">
                  <p className="text-center text-sm text-muted-foreground">
                    Tidak ada slip gaji untuk periode ini.
                  </p>
                </Card>
              ) : (
                filteredPayslips.map((slip) => {
                  const tunjangan = slip.totalEarnings - slip.basicSalary;
                  return (
                    <Card key={slip.id} className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <p className="font-medium text-sm">{slip.employeeName}</p>
                          <p className="text-xs text-muted-foreground">
                            {slip.employeeNumber} - {slip.departmentName}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="shrink-0"
                          onClick={() => handleDownloadPdf(slip.employeeName)}
                        >
                          <Download className="size-4" />
                        </Button>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <p className="text-[11px] text-muted-foreground">Gaji Pokok</p>
                          <p className="font-medium tabular-nums">{formatIDRShort(slip.basicSalary)}</p>
                        </div>
                        <div>
                          <p className="text-[11px] text-muted-foreground">Tunjangan</p>
                          <p className="font-medium tabular-nums">{formatIDRShort(tunjangan)}</p>
                        </div>
                        <div>
                          <p className="text-[11px] text-muted-foreground">Potongan</p>
                          <p className="font-medium tabular-nums text-red-600">{formatIDRShort(slip.totalDeductions)}</p>
                        </div>
                        <div>
                          <p className="text-[11px] text-muted-foreground">PPh 21</p>
                          <p className="font-medium tabular-nums text-red-600">{formatIDRShort(slip.pph21)}</p>
                        </div>
                      </div>
                      <div className="mt-3 pt-2 border-t flex items-center justify-between">
                        <p className="text-xs text-muted-foreground">Gaji Bersih</p>
                        <p className="font-bold text-green-700 tabular-nums">{formatIDR(slip.netSalary)}</p>
                      </div>
                    </Card>
                  );
                })
              )}
            </div>

            {/* Desktop table view */}
            <div className="hidden md:block">
              <Card className="shadow-sm">
                <CardHeader>
                  <CardTitle>
                    Slip Gaji{" "}
                    {selectedSlipPeriod
                      ? `- ${formatPeriodLabel(selectedSlipPeriod.month, selectedSlipPeriod.year)}`
                      : ""}
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-0">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/50">
                        <TableHead>No. Karyawan</TableHead>
                        <TableHead>Nama</TableHead>
                        <TableHead>Departemen</TableHead>
                        <TableHead className="text-right">Gaji Pokok</TableHead>
                        <TableHead className="text-right">Tunjangan</TableHead>
                        <TableHead className="text-right">Potongan</TableHead>
                        <TableHead className="text-right">PPh 21</TableHead>
                        <TableHead className="text-right">Gaji Bersih</TableHead>
                        <TableHead className="text-right">Aksi</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredPayslips.length === 0 ? (
                        <TableRow>
                          <TableCell
                            colSpan={9}
                            className="h-24 text-center text-muted-foreground"
                          >
                            Tidak ada slip gaji untuk periode ini.
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredPayslips.map((slip) => {
                          const tunjangan = slip.totalEarnings - slip.basicSalary;
                          return (
                            <TableRow key={slip.id} className="hover:bg-muted/50">
                              <TableCell className="font-mono text-xs">
                                {slip.employeeNumber}
                              </TableCell>
                              <TableCell className="font-medium">
                                {slip.employeeName}
                              </TableCell>
                              <TableCell>{slip.departmentName}</TableCell>
                              <TableCell className="text-right tabular-nums">
                                {formatIDR(slip.basicSalary)}
                              </TableCell>
                              <TableCell className="text-right tabular-nums">
                                {formatIDR(tunjangan)}
                              </TableCell>
                              <TableCell className="text-right tabular-nums text-red-600">
                                {formatIDR(slip.totalDeductions)}
                              </TableCell>
                              <TableCell className="text-right tabular-nums text-red-600">
                                {formatIDR(slip.pph21)}
                              </TableCell>
                              <TableCell className="text-right tabular-nums font-semibold text-green-700">
                                {formatIDR(slip.netSalary)}
                              </TableCell>
                              <TableCell className="text-right">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDownloadPdf(slip.employeeName)}
                                >
                                  <Download className="size-4" />
                                  Download PDF
                                </Button>
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
          </div>
        </TabsContent>
      </Tabs>

      {/* Process Payroll Confirmation Dialog */}
      <Dialog open={processDialogOpen} onOpenChange={setProcessDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Konfirmasi Proses Payroll</DialogTitle>
            <DialogDescription>
              Apakah Anda yakin ingin memproses payroll untuk periode ini? Tindakan ini
              akan memfinalisasi perhitungan gaji dan tidak dapat dibatalkan.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setProcessDialogOpen(false)}>
              Batal
            </Button>
            <Button onClick={handleProcessPayroll}>Proses Sekarang</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
