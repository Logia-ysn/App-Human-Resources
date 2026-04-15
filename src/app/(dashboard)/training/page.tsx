"use client";

import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import { GraduationCap, Users, Calendar, MapPin } from "lucide-react";

import { useTrainingPrograms, useTrainingParticipants } from "@/hooks/use-training";
import { StatusBadge } from "@/components/shared/status-badge";
import { EmptyState } from "@/components/shared/empty-state";

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

const CATEGORY_LABELS: Record<string, string> = {
  TECHNICAL: "Teknis",
  SOFT_SKILLS: "Soft Skills",
  LEADERSHIP: "Kepemimpinan",
  COMPLIANCE: "Compliance",
  SAFETY: "K3",
  ONBOARDING: "Onboarding",
  OTHER: "Lainnya",
};

const METHOD_LABELS: Record<string, string> = {
  ONLINE: "Online",
  OFFLINE: "Offline",
  HYBRID: "Hybrid",
};

const PARTICIPANT_STATUS_LABELS: Record<string, string> = {
  REGISTERED: "Terdaftar",
  IN_PROGRESS: "Berjalan",
  COMPLETED: "Selesai",
  FAILED: "Gagal",
  CANCELLED: "Batal",
};

function formatCurrency(amount: string | number): string {
  const num = typeof amount === "string" ? Number(amount) : amount;
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(num || 0);
}

export default function TrainingPage() {
  const { programs, isLoading: progLoading } = useTrainingPrograms();
  const { participants, isLoading: partLoading } = useTrainingParticipants();

  if (progLoading || partLoading) {
    return (
      <LoadingState />
    );
  }

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex items-center gap-2.5 border-b border-border pb-4">
        <GraduationCap className="size-5 text-muted-foreground" strokeWidth={1.75} />
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Training</h1>
          <p className="text-xs text-muted-foreground">
            Program pelatihan dan peserta
          </p>
        </div>
      </div>

      <Tabs defaultValue="programs">
        <TabsList>
          <TabsTrigger value="programs">Program</TabsTrigger>
          <TabsTrigger value="participants">Peserta</TabsTrigger>
        </TabsList>

        <TabsContent value="programs">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {programs.length === 0 ? (
              <Card className="md:col-span-2 lg:col-span-3">
                <CardContent className="p-0">
                  <EmptyState
                    icon={GraduationCap}
                    title="Belum ada program training"
                    description="Program pelatihan yang dibuat akan muncul di sini."
                  />
                </CardContent>
              </Card>
            ) : (
              programs.map((p) => (
                <Card key={p.id} className="transition-colors hover:bg-muted/40">
                  <CardHeader>
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <CardTitle className="text-base line-clamp-2">{p.title}</CardTitle>
                        <div className="flex flex-wrap gap-1 mt-2">
                          <Badge variant="outline" className="text-xs">
                            {CATEGORY_LABELS[p.category] ?? p.category}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {METHOD_LABELS[p.method] ?? p.method}
                          </Badge>
                        </div>
                      </div>
                      <StatusBadge status={p.status} />
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    {p.description && (
                      <p className="text-muted-foreground line-clamp-2">{p.description}</p>
                    )}
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Calendar className="h-3.5 w-3.5" />
                      {format(new Date(p.startDate), "dd MMM", { locale: idLocale })}
                      {" – "}
                      {format(new Date(p.endDate), "dd MMM yyyy", { locale: idLocale })}
                    </div>
                    {p.location && (
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <MapPin className="h-3.5 w-3.5" />
                        {p.location}
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Users className="h-3.5 w-3.5" />
                      {p._count.participants}
                      {p.maxParticipants && ` / ${p.maxParticipants}`} peserta
                    </div>
                    {Number(p.costPerPerson) > 0 && (
                      <div className="text-xs text-muted-foreground pt-2 border-t">
                        Biaya: <span className="font-semibold">{formatCurrency(p.costPerPerson)}</span> / org
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="participants">
          <Card>
            <CardHeader>
              <CardTitle>Peserta Training</CardTitle>
            </CardHeader>
            <CardContent className="px-0">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead>Karyawan</TableHead>
                    <TableHead>Program</TableHead>
                    <TableHead>Terdaftar</TableHead>
                    <TableHead className="text-center">Skor</TableHead>
                    <TableHead className="text-center">Lulus</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {participants.length === 0 ? (
                    <EmptyRow colSpan={6}>Belum ada peserta training.</EmptyRow>
                  ) : (
                    participants.map((p) => (
                      <TableRow key={p.id} className="hover:bg-muted/50">
                        <TableCell className="font-medium">
                          {p.employee.firstName} {p.employee.lastName}
                          <div className="text-xs text-muted-foreground">
                            {p.employee.department.name}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="line-clamp-1 max-w-[280px]">{p.training.title}</div>
                          <div className="text-xs text-muted-foreground">
                            {CATEGORY_LABELS[p.training.category] ?? p.training.category}
                          </div>
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
        </TabsContent>
      </Tabs>
    </div>
  );
}
