"use client";
import { LoadingState } from "@/components/shared/loading-state";

import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import { TrendingUp, ArrowRight } from "lucide-react";

import { useLifecycleEvents } from "@/hooks/use-lifecycle";

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

const TYPE_LABELS: Record<string, string> = {
  HIRE: "Rekrutmen",
  PROMOTION: "Promosi",
  DEMOTION: "Demosi",
  TRANSFER: "Mutasi",
  SALARY_ADJUSTMENT: "Penyesuaian Gaji",
  CONTRACT_RENEWAL: "Perpanjangan Kontrak",
  RESIGNATION: "Resign",
  TERMINATION: "Diberhentikan",
  RETIREMENT: "Pensiun",
};

const TYPE_DOTS: Record<string, string> = {
  HIRE: "bg-[var(--info)]",
  PROMOTION: "bg-[var(--success)]",
  DEMOTION: "bg-[var(--warning)]",
  TRANSFER: "bg-primary",
  SALARY_ADJUSTMENT: "bg-[var(--info)]",
  CONTRACT_RENEWAL: "bg-primary",
  RESIGNATION: "bg-[var(--warning)]",
  TERMINATION: "bg-destructive",
  RETIREMENT: "bg-muted-foreground/60",
};

function formatCurrency(amount: string | number): string {
  const num = typeof amount === "string" ? Number(amount) : amount;
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(num || 0);
}

export default function LifecyclePage() {
  const { events, isLoading } = useLifecycleEvents();

  if (isLoading) {
    return (
      <LoadingState />
    );
  }

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex items-center gap-2.5 border-b border-border pb-4">
        <TrendingUp className="size-5 text-muted-foreground" strokeWidth={1.75} />
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Siklus Karyawan</h1>
          <p className="text-xs text-muted-foreground">
            Riwayat perubahan status, jabatan, dan posisi karyawan
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Riwayat Kejadian Karyawan</CardTitle>
        </CardHeader>
        <CardContent className="px-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead>Tanggal</TableHead>
                <TableHead>Karyawan</TableHead>
                <TableHead>Kejadian</TableHead>
                <TableHead>Dari</TableHead>
                <TableHead>Menjadi</TableHead>
                <TableHead>Alasan</TableHead>
                <TableHead>Disetujui</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {events.length === 0 ? (
                <EmptyRow colSpan={7}>Belum ada kejadian siklus karyawan.</EmptyRow>
              ) : (
                events.map((e) => {
                  const from = e.fromPosition ?? e.fromDepartment ?? (e.fromSalary ? formatCurrency(e.fromSalary) : null);
                  const to = e.toPosition ?? e.toDepartment ?? (e.toSalary ? formatCurrency(e.toSalary) : null);
                  return (
                    <TableRow key={e.id} className="hover:bg-muted/50">
                      <TableCell className="text-sm whitespace-nowrap">
                        {format(new Date(e.effectiveDate), "dd MMM yyyy", { locale: idLocale })}
                      </TableCell>
                      <TableCell className="font-medium">
                        {e.employee.firstName} {e.employee.lastName}
                        <div className="text-xs text-muted-foreground">
                          {e.employee.department.name}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="inline-flex items-center gap-1.5 rounded-sm border border-border bg-muted/60 px-2 py-0.5 text-[11px] font-medium">
                          <span className={`h-1.5 w-1.5 rounded-full ${TYPE_DOTS[e.type] ?? "bg-muted-foreground/60"}`} />
                          {TYPE_LABELS[e.type] ?? e.type}
                        </span>
                      </TableCell>
                      <TableCell className="text-sm">{from ?? "-"}</TableCell>
                      <TableCell className="text-sm">
                        {to ? (
                          <span className="inline-flex items-center gap-1">
                            <ArrowRight className="h-3 w-3 text-muted-foreground" />
                            {to}
                          </span>
                        ) : (
                          "-"
                        )}
                      </TableCell>
                      <TableCell className="max-w-[200px]">
                        <span className="line-clamp-2 text-sm">{e.reason}</span>
                      </TableCell>
                      <TableCell className="text-sm">
                        {e.approvedBy
                          ? `${e.approvedBy.firstName} ${e.approvedBy.lastName}`
                          : "-"}
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
