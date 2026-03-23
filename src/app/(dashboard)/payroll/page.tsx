"use client";

import { useState, useMemo } from "react";
import { Wallet, FileText, Download, CheckCircle, Clock } from "lucide-react";
import { toast } from "sonner";

import { payrollPeriods, payslips } from "@/lib/dummy-data";
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

function formatPeriodLabel(month: number, year: number): string {
  return `${MONTH_NAMES[month]} ${year}`;
}

export default function PayrollPage() {
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
  }, []);

  const [slipPeriodId, setSlipPeriodId] = useState(latestPeriod?.id ?? "");

  // Summary stats
  const summaryStats = useMemo(() => {
    const totalPeriode = payrollPeriods.length;
    const sudahDibayar = payrollPeriods.filter((p) => p.status === "PAID").length;
    const menungguApproval = payrollPeriods.filter(
      (p) => p.status === "CALCULATED" || p.status === "PROCESSING"
    ).length;
    return { totalPeriode, sudahDibayar, menungguApproval };
  }, []);

  // Filtered payslips based on selected period
  const filteredPayslips = useMemo(
    () => payslips.filter((ps) => ps.periodId === slipPeriodId),
    [slipPeriodId]
  );

  // Selected period for payslip tab header
  const selectedSlipPeriod = useMemo(
    () => payrollPeriods.find((p) => p.id === slipPeriodId) ?? null,
    [slipPeriodId]
  );

  const handleProcessPayroll = () => {
    if (selectedPeriodId) {
      const period = payrollPeriods.find((p) => p.id === selectedPeriodId);
      if (period) {
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
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10">
          <Wallet className="size-5 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Penggajian</h1>
          <p className="text-sm text-muted-foreground">
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
          <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid gap-4 md:grid-cols-3">
              <Card className="shadow-sm border-l-4 border-l-blue-500">
                <CardContent>
                  <div className="flex items-center gap-3">
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-blue-100">
                      <FileText className="size-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Total Periode</p>
                      <p className="text-2xl font-bold">{summaryStats.totalPeriode}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="shadow-sm border-l-4 border-l-green-500">
                <CardContent>
                  <div className="flex items-center gap-3">
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-green-100">
                      <CheckCircle className="size-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Sudah Dibayar</p>
                      <p className="text-2xl font-bold">{summaryStats.sudahDibayar}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="shadow-sm border-l-4 border-l-yellow-500">
                <CardContent>
                  <div className="flex items-center gap-3">
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-yellow-100">
                      <Clock className="size-5 text-yellow-600" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Menunggu Approval</p>
                      <p className="text-2xl font-bold">{summaryStats.menungguApproval}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Period Table */}
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
        </TabsContent>

        {/* Tab: Slip Gaji */}
        <TabsContent value="slip">
          <div className="space-y-6">
            {/* Period filter */}
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium">Periode:</span>
              <Select value={slipPeriodId} onValueChange={handleSlipPeriodChange}>
                <SelectTrigger className="w-[220px]">
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

            {/* Payslips Table */}
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
