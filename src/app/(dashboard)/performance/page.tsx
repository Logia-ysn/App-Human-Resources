"use client";

import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import { BarChart3 } from "lucide-react";

import { useReviewCycles, usePerformanceReviews } from "@/hooks/use-performance";
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
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { LoadingState } from "@/components/shared/loading-state";
import { EmptyRow } from "@/components/shared/empty-row";

const CYCLE_TYPE_LABELS: Record<string, string> = {
  QUARTERLY: "Triwulan",
  SEMESTER: "Semester",
  ANNUAL: "Tahunan",
  PROBATION: "Probation",
};

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

export default function PerformancePage() {
  const { cycles, isLoading: cyclesLoading } = useReviewCycles();
  const { reviews, isLoading: reviewsLoading } = usePerformanceReviews();

  if (cyclesLoading || reviewsLoading) {
    return (
      <LoadingState />
    );
  }

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex items-center gap-2.5 border-b border-border pb-4">
        <BarChart3 className="size-5 text-muted-foreground" strokeWidth={1.75} />
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Penilaian Kinerja</h1>
          <p className="text-xs text-muted-foreground">
            Siklus dan hasil review performance karyawan
          </p>
        </div>
      </div>

      <Tabs defaultValue="reviews">
        <TabsList>
          <TabsTrigger value="reviews">Review Karyawan</TabsTrigger>
          <TabsTrigger value="cycles">Siklus Review</TabsTrigger>
        </TabsList>

        <TabsContent value="reviews">
          <Card>
            <CardHeader>
              <CardTitle>Daftar Review Kinerja</CardTitle>
            </CardHeader>
            <CardContent className="px-0">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead>Karyawan</TableHead>
                    <TableHead>Departemen</TableHead>
                    <TableHead>Siklus</TableHead>
                    <TableHead>Reviewer</TableHead>
                    <TableHead className="text-center">KPI</TableHead>
                    <TableHead className="text-center">Skor Final</TableHead>
                    <TableHead>Rating</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reviews.length === 0 ? (
                    <EmptyRow colSpan={8}>Belum ada review kinerja.</EmptyRow>
                  ) : (
                    reviews.map((r) => (
                      <TableRow key={r.id} className="hover:bg-muted/50">
                        <TableCell className="font-medium">
                          {r.employee.firstName} {r.employee.lastName}
                          <div className="text-xs text-muted-foreground font-mono">
                            {r.employee.employeeNumber}
                          </div>
                        </TableCell>
                        <TableCell>{r.employee.department.name}</TableCell>
                        <TableCell>{r.reviewCycle.name}</TableCell>
                        <TableCell>
                          {r.reviewer.firstName} {r.reviewer.lastName}
                        </TableCell>
                        <TableCell className="text-center">{r.kpis.length}</TableCell>
                        <TableCell className="text-center font-semibold">
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
        </TabsContent>

        <TabsContent value="cycles">
          <Card>
            <CardHeader>
              <CardTitle>Siklus Review</CardTitle>
            </CardHeader>
            <CardContent className="px-0">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead>Nama Siklus</TableHead>
                    <TableHead>Tipe</TableHead>
                    <TableHead>Periode</TableHead>
                    <TableHead>Deadline Self</TableHead>
                    <TableHead>Deadline Manager</TableHead>
                    <TableHead className="text-center">Jml Review</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {cycles.length === 0 ? (
                    <EmptyRow colSpan={7}>Belum ada siklus review.</EmptyRow>
                  ) : (
                    cycles.map((c) => (
                      <TableRow key={c.id} className="hover:bg-muted/50">
                        <TableCell className="font-medium">{c.name}</TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {CYCLE_TYPE_LABELS[c.type] ?? c.type}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm">
                          {format(new Date(c.startDate), "dd MMM", { locale: idLocale })}
                          {" – "}
                          {format(new Date(c.endDate), "dd MMM yyyy", { locale: idLocale })}
                        </TableCell>
                        <TableCell className="text-sm">
                          {format(new Date(c.selfReviewDeadline), "dd MMM yyyy", { locale: idLocale })}
                        </TableCell>
                        <TableCell className="text-sm">
                          {format(new Date(c.managerReviewDeadline), "dd MMM yyyy", { locale: idLocale })}
                        </TableCell>
                        <TableCell className="text-center">{c._count.reviews}</TableCell>
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
