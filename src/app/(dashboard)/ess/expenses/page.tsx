"use client";

import { useMemo } from "react";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import { Receipt, Banknote, FileText } from "lucide-react";

import { useAuth } from "@/components/providers/auth-context";
import { useAdvances, useClaims } from "@/hooks/use-expenses";
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
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { LoadingState } from "@/components/shared/loading-state";

function formatCurrency(amount: string | number): string {
  const num = typeof amount === "string" ? Number(amount) : amount;
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(num || 0);
}

export default function EssExpensesPage() {
  const { employeeId } = useAuth();
  const { advances, isLoading: advLoading } = useAdvances({
    employeeId: employeeId ?? undefined,
  });
  const { claims, isLoading: claimLoading } = useClaims({
    employeeId: employeeId ?? undefined,
  });

  const advanceTotal = useMemo(
    () => advances.reduce((s, a) => s + Number(a.amount), 0),
    [advances],
  );
  const claimTotal = useMemo(
    () => claims.reduce((s, c) => s + Number(c.totalAmount), 0),
    [claims],
  );

  if (!employeeId) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center space-y-2">
          <Receipt className="h-12 w-12 text-muted-foreground/40 mx-auto" />
          <p className="text-lg font-medium">Data karyawan tidak ditemukan</p>
          <p className="text-sm text-muted-foreground">
            Akun Anda belum terhubung dengan data karyawan.
          </p>
        </div>
      </div>
    );
  }

  if (advLoading || claimLoading) {
    return (
      <LoadingState />
    );
  }

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex items-center gap-2.5 border-b border-border pb-4">
        <Receipt className="size-5 text-muted-foreground" strokeWidth={1.75} />
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Pengeluaran Saya</h1>
          <p className="text-xs text-muted-foreground">
            Kasbon dan klaim pengeluaran Anda
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <StatCard
          title={`Total Kasbon (${advances.length})`}
          value={formatCurrency(advanceTotal)}
          icon={Banknote}
        />
        <StatCard
          title={`Total Klaim (${claims.length})`}
          value={formatCurrency(claimTotal)}
          icon={FileText}
        />
      </div>

      <Tabs defaultValue="advances">
        <TabsList>
          <TabsTrigger value="advances">Kasbon</TabsTrigger>
          <TabsTrigger value="claims">Klaim</TabsTrigger>
        </TabsList>

        <TabsContent value="advances">
          <Card>
            <CardHeader>
              <CardTitle>Riwayat Kasbon</CardTitle>
            </CardHeader>
            <CardContent className="px-0">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead>Keperluan</TableHead>
                    <TableHead className="text-right">Nilai</TableHead>
                    <TableHead className="text-right">Dikembalikan</TableHead>
                    <TableHead>Tgl. Permintaan</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {advances.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={5}
                        className="h-24 text-center text-muted-foreground"
                      >
                        Belum ada kasbon.
                      </TableCell>
                    </TableRow>
                  ) : (
                    advances.map((a) => (
                      <TableRow key={a.id} className="hover:bg-muted/50">
                        <TableCell className="max-w-[320px]">
                          <span className="line-clamp-2 text-sm">{a.purpose}</span>
                        </TableCell>
                        <TableCell className="text-right font-mono font-semibold">
                          {formatCurrency(a.amount)}
                        </TableCell>
                        <TableCell className="text-right font-mono text-muted-foreground">
                          {Number(a.returnedAmount) > 0
                            ? formatCurrency(a.returnedAmount)
                            : "-"}
                        </TableCell>
                        <TableCell className="text-sm">
                          {format(new Date(a.requestDate), "dd MMM yyyy", {
                            locale: idLocale,
                          })}
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
        </TabsContent>

        <TabsContent value="claims">
          <Card>
            <CardHeader>
              <CardTitle>Riwayat Klaim</CardTitle>
            </CardHeader>
            <CardContent className="px-0">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead>Judul</TableHead>
                    <TableHead className="text-center">Item</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                    <TableHead>Tgl. Diajukan</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {claims.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={5}
                        className="h-24 text-center text-muted-foreground"
                      >
                        Belum ada klaim.
                      </TableCell>
                    </TableRow>
                  ) : (
                    claims.map((c) => (
                      <TableRow key={c.id} className="hover:bg-muted/50">
                        <TableCell className="font-medium max-w-[320px]">
                          <span className="line-clamp-2 text-sm">{c.title}</span>
                        </TableCell>
                        <TableCell className="text-center text-sm">
                          {c.items.length}
                        </TableCell>
                        <TableCell className="text-right font-mono font-semibold">
                          {formatCurrency(c.totalAmount)}
                        </TableCell>
                        <TableCell className="text-sm">
                          {format(new Date(c.submittedDate), "dd MMM yyyy", {
                            locale: idLocale,
                          })}
                        </TableCell>
                        <TableCell>
                          <StatusBadge status={c.status} />
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
