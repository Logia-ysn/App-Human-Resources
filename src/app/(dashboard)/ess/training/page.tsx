"use client";

import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import { GraduationCap } from "lucide-react";

import { useAuth } from "@/components/providers/auth-context";
import { useTrainingParticipants } from "@/hooks/use-training";
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
import { LoadingState } from "@/components/shared/loading-state";
import { EmptyRow } from "@/components/shared/empty-row";

const CATEGORY_LABELS: Record<string, string> = {
  TECHNICAL: "Teknis",
  SOFT_SKILLS: "Soft Skills",
  LEADERSHIP: "Kepemimpinan",
  COMPLIANCE: "Compliance",
  SAFETY: "K3",
  ONBOARDING: "Onboarding",
  OTHER: "Lainnya",
};

const PARTICIPANT_STATUS_LABELS: Record<string, string> = {
  REGISTERED: "Terdaftar",
  IN_PROGRESS: "Berjalan",
  COMPLETED: "Selesai",
  FAILED: "Gagal",
  CANCELLED: "Batal",
};

export default function EssTrainingPage() {
  const { employeeId } = useAuth();
  const { participants, isLoading } = useTrainingParticipants({
    employeeId: employeeId ?? undefined,
  });

  if (!employeeId) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center space-y-2">
          <GraduationCap className="h-12 w-12 text-muted-foreground/40 mx-auto" />
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
        <GraduationCap className="size-5 text-muted-foreground" strokeWidth={1.75} />
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Training Saya</h1>
          <p className="text-xs text-muted-foreground">
            Riwayat pelatihan yang Anda ikuti
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Riwayat Training</CardTitle>
        </CardHeader>
        <CardContent className="px-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead>Program</TableHead>
                <TableHead>Periode</TableHead>
                <TableHead>Terdaftar</TableHead>
                <TableHead className="text-center">Skor</TableHead>
                <TableHead className="text-center">Lulus</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {participants.length === 0 ? (
                <EmptyRow colSpan={6}>Belum ada training yang diikuti.</EmptyRow>
              ) : (
                participants.map((p) => (
                  <TableRow key={p.id} className="hover:bg-muted/50">
                    <TableCell className="font-medium">
                      <div className="line-clamp-1 max-w-[320px]">{p.training.title}</div>
                      <Badge variant="outline" className="text-xs mt-1">
                        {CATEGORY_LABELS[p.training.category] ?? p.training.category}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm">
                      {format(new Date(p.training.startDate), "dd MMM", { locale: idLocale })}
                      {" – "}
                      {format(new Date(p.training.endDate), "dd MMM yyyy", { locale: idLocale })}
                    </TableCell>
                    <TableCell className="text-sm">
                      {format(new Date(p.enrolledAt), "dd MMM yyyy", { locale: idLocale })}
                    </TableCell>
                    <TableCell className="text-center font-semibold">
                      {p.score != null ? Number(p.score).toFixed(1) : "-"}
                    </TableCell>
                    <TableCell className="text-center">
                      {p.isPassed == null ? (
                        <span className="text-xs text-muted-foreground">-</span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 rounded-sm border border-border bg-muted/60 px-2 py-0.5 text-[11px] font-medium">
                          <span className={`h-1.5 w-1.5 rounded-full ${p.isPassed ? "bg-[var(--success)]" : "bg-destructive"}`} />
                          {p.isPassed ? "Ya" : "Tidak"}
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {PARTICIPANT_STATUS_LABELS[p.status] ?? p.status}
                      </Badge>
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
