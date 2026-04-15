"use client";
import { LoadingState } from "@/components/shared/loading-state";

import { BarChart3 } from "lucide-react";

import { useAuth } from "@/components/providers/auth-context";
import { usePerformanceReviews } from "@/hooks/use-performance";
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
import { EmptyRow } from "@/components/shared/empty-row";

const RATING_LABELS: Record<string, string> = {
  OUTSTANDING: "Sangat Baik",
  EXCEEDS: "Di Atas Ekspektasi",
  MEETS: "Memenuhi Ekspektasi",
  BELOW: "Di Bawah Ekspektasi",
  POOR: "Buruk",
};

const RATING_DOTS: Record<string, string> = {
  OUTSTANDING: "bg-[var(--success)]",
  EXCEEDS: "bg-[var(--success)]",
  MEETS: "bg-[var(--info)]",
  BELOW: "bg-[var(--warning)]",
  POOR: "bg-destructive",
};

export default function EssPerformancePage() {
  const { employeeId } = useAuth();
  const { reviews, isLoading } = usePerformanceReviews({
    employeeId: employeeId ?? undefined,
  });

  if (!employeeId) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center space-y-2">
          <BarChart3 className="h-12 w-12 text-muted-foreground/40 mx-auto" />
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
        <BarChart3 className="size-5 text-muted-foreground" strokeWidth={1.75} />
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Kinerja Saya</h1>
          <p className="text-xs text-muted-foreground">
            Riwayat review kinerja Anda
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Review Kinerja</CardTitle>
        </CardHeader>
        <CardContent className="px-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead>Siklus</TableHead>
                <TableHead>Reviewer</TableHead>
                <TableHead className="text-center">Self</TableHead>
                <TableHead className="text-center">Manager</TableHead>
                <TableHead className="text-center">Final</TableHead>
                <TableHead>Rating</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reviews.length === 0 ? (
                <EmptyRow colSpan={7}>Belum ada review kinerja.</EmptyRow>
              ) : (
                reviews.map((r) => (
                  <TableRow key={r.id} className="hover:bg-muted/50">
                    <TableCell className="font-medium">{r.reviewCycle.name}</TableCell>
                    <TableCell>
                      {r.reviewer.firstName} {r.reviewer.lastName}
                    </TableCell>
                    <TableCell className="text-center font-semibold">
                      {r.selfScore != null ? Number(r.selfScore).toFixed(2) : "-"}
                    </TableCell>
                    <TableCell className="text-center font-semibold">
                      {r.managerScore != null ? Number(r.managerScore).toFixed(2) : "-"}
                    </TableCell>
                    <TableCell className="text-center font-bold text-primary">
                      {r.finalScore != null ? Number(r.finalScore).toFixed(2) : "-"}
                    </TableCell>
                    <TableCell>
                      {r.rating ? (
                        <span className="inline-flex items-center gap-1.5 rounded-sm border border-border bg-muted/60 px-2 py-0.5 text-[11px] font-medium">
                          <span className={`h-1.5 w-1.5 rounded-full ${RATING_DOTS[r.rating] ?? "bg-muted-foreground/60"}`} />
                          {RATING_LABELS[r.rating] ?? r.rating}
                        </span>
                      ) : (
                        <span className="text-xs text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={r.status} />
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
