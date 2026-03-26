"use client";

import { useAppStore } from "@/lib/store/app-store";
import { useAuth } from "@/components/providers/auth-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Download, Wallet } from "lucide-react";
import { toast } from "sonner";

function fmt(n: number) {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(n);
}

export default function EssPayslipsPage() {
  const employees = useAppStore((s) => s.employees);
  const payslips = useAppStore((s) => s.payslips);
  const { employeeId } = useAuth();
  const currentEmployee = employees.find((e) => e.id === employeeId);
  const mySlips = payslips.filter((s) => s.employeeId === currentEmployee?.id);

  if (!currentEmployee) {
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

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">Slip Gaji Saya</h1>

      {mySlips.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            Belum ada slip gaji tersedia.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {mySlips.map((slip) => (
            <Card key={slip.id}>
              <CardHeader className="flex flex-row items-center justify-between">
                <div className="flex items-center gap-3">
                  <Wallet className="h-5 w-5 text-muted-foreground" />
                  <CardTitle className="text-base">Slip Gaji — {slip.periodLabel}</CardTitle>
                </div>
                <Button variant="outline" size="sm" onClick={() => toast.success("Slip gaji berhasil diunduh")}>
                  <Download className="mr-2 h-4 w-4" /> Download PDF
                </Button>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div><p className="text-xs text-muted-foreground">Gaji Pokok</p><p className="text-sm font-semibold">{fmt(slip.basicSalary)}</p></div>
                  <div><p className="text-xs text-muted-foreground">Total Pendapatan</p><p className="text-sm font-semibold text-green-600">{fmt(slip.totalEarnings)}</p></div>
                  <div><p className="text-xs text-muted-foreground">Total Potongan</p><p className="text-sm font-semibold text-red-600">{fmt(slip.totalDeductions)}</p></div>
                  <div><p className="text-xs text-muted-foreground">Gaji Bersih</p><p className="text-lg font-bold">{fmt(slip.netSalary)}</p></div>
                </div>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Komponen</TableHead>
                      <TableHead className="text-right">Jumlah</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow><TableCell>Gaji Pokok</TableCell><TableCell className="text-right">{fmt(slip.basicSalary)}</TableCell></TableRow>
                    <TableRow><TableCell>Tunjangan</TableCell><TableCell className="text-right">{fmt(slip.totalEarnings - slip.basicSalary)}</TableCell></TableRow>
                    {slip.overtimePay > 0 && <TableRow><TableCell>Lembur ({slip.overtimeHours} jam)</TableCell><TableCell className="text-right">{fmt(slip.overtimePay)}</TableCell></TableRow>}
                    <TableRow className="border-t-2"><TableCell className="font-semibold">Total Pendapatan</TableCell><TableCell className="text-right font-semibold">{fmt(slip.totalEarnings)}</TableCell></TableRow>
                    <TableRow><TableCell>BPJS Kesehatan</TableCell><TableCell className="text-right text-red-600">-{fmt(slip.bpjsKes)}</TableCell></TableRow>
                    <TableRow><TableCell>BPJS Ketenagakerjaan</TableCell><TableCell className="text-right text-red-600">-{fmt(slip.bpjsTk)}</TableCell></TableRow>
                    <TableRow><TableCell>PPh 21</TableCell><TableCell className="text-right text-red-600">-{fmt(slip.pph21)}</TableCell></TableRow>
                    <TableRow className="border-t-2 bg-muted/50"><TableCell className="font-bold">Gaji Bersih (Take Home Pay)</TableCell><TableCell className="text-right font-bold text-lg">{fmt(slip.netSalary)}</TableCell></TableRow>
                  </TableBody>
                </Table>
                <div className="mt-4 flex gap-6 text-xs text-muted-foreground">
                  <span>Hari Kerja: {slip.workDays}</span>
                  <span>Hadir: {slip.presentDays}</span>
                  <span>Lembur: {slip.overtimeHours} jam</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
