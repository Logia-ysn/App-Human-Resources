"use client";

import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import { UserCheck, CheckCircle2, Clock } from "lucide-react";

import { useOnboardingTemplates, useEmployeeOnboardings } from "@/hooks/use-onboarding";
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
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { LoadingState } from "@/components/shared/loading-state";
import { EmptyState } from "@/components/shared/empty-state";
import { EmptyRow } from "@/components/shared/empty-row";

const CATEGORY_LABELS: Record<string, string> = {
  DOCUMENT: "Dokumen",
  TRAINING: "Training",
  SYSTEM_ACCESS: "Akses Sistem",
  EQUIPMENT: "Peralatan",
  ORIENTATION: "Orientasi",
  OTHER: "Lainnya",
};

const STATUS_LABELS: Record<string, string> = {
  IN_PROGRESS: "Berjalan",
  COMPLETED: "Selesai",
  ON_HOLD: "Ditunda",
};

export default function OnboardingPage() {
  const { templates, isLoading: templatesLoading } = useOnboardingTemplates();
  const { onboardings, isLoading: onbLoading } = useEmployeeOnboardings();

  if (templatesLoading || onbLoading) {
    return (
      <LoadingState />
    );
  }

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex items-center gap-2.5 border-b border-border pb-4">
        <UserCheck className="size-5 text-muted-foreground" strokeWidth={1.75} />
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Onboarding</h1>
          <p className="text-xs text-muted-foreground">
            Template dan progres onboarding karyawan baru
          </p>
        </div>
      </div>

      <Tabs defaultValue="progress">
        <TabsList>
          <TabsTrigger value="progress">Progress Karyawan</TabsTrigger>
          <TabsTrigger value="templates">Template</TabsTrigger>
        </TabsList>

        <TabsContent value="progress">
          <Card>
            <CardHeader>
              <CardTitle>Progress Onboarding Karyawan</CardTitle>
            </CardHeader>
            <CardContent className="px-0">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead>Karyawan</TableHead>
                    <TableHead>Jabatan</TableHead>
                    <TableHead>Template</TableHead>
                    <TableHead>Mulai</TableHead>
                    <TableHead>Progress</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {onboardings.length === 0 ? (
                    <EmptyRow colSpan={6}>Belum ada proses onboarding aktif.</EmptyRow>
                  ) : (
                    onboardings.map((o) => (
                      <TableRow key={o.id} className="hover:bg-muted/50">
                        <TableCell className="font-medium">
                          {o.employee.firstName} {o.employee.lastName}
                          <div className="text-xs text-muted-foreground font-mono">
                            {o.employee.employeeNumber}
                          </div>
                        </TableCell>
                        <TableCell>
                          {o.employee.position.name}
                          <div className="text-xs text-muted-foreground">
                            {o.employee.department.name}
                          </div>
                        </TableCell>
                        <TableCell>{o.template.name}</TableCell>
                        <TableCell>
                          {format(new Date(o.startDate), "dd MMM yyyy", { locale: idLocale })}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2 min-w-[120px]">
                            <div className="h-2 flex-1 rounded-full bg-muted">
                              <div
                                className={`h-2 rounded-full transition-all ${
                                  o.progress >= 100
                                    ? "bg-[var(--success)]"
                                    : o.progress >= 50
                                      ? "bg-primary"
                                      : "bg-[var(--warning)]"
                                }`}
                                style={{ width: `${Math.min(o.progress, 100)}%` }}
                              />
                            </div>
                            <span className="text-xs font-semibold min-w-[3rem] text-right">
                              {o.completedTasks}/{o.totalTasks}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <StatusBadge status={STATUS_LABELS[o.status] ? o.status : o.status} />
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="templates">
          <div className="grid gap-4 md:grid-cols-2">
            {templates.length === 0 ? (
              <Card className="md:col-span-2">
                <CardContent className="p-0">
                  <EmptyState
                    icon={UserCheck}
                    title="Belum ada template onboarding"
                    description="Template yang Anda buat akan muncul di sini."
                  />
                </CardContent>
              </Card>
            ) : (
              templates.map((t) => (
                <Card key={t.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <CardTitle className="text-base">{t.name}</CardTitle>
                        {t.description && (
                          <p className="text-sm text-muted-foreground mt-1">{t.description}</p>
                        )}
                      </div>
                      <span className="inline-flex items-center gap-1.5 rounded-sm border border-border bg-muted/60 px-2 py-0.5 text-[11px] font-medium">
                        <span className={`h-1.5 w-1.5 rounded-full ${t.isActive ? "bg-[var(--success)]" : "bg-muted-foreground/60"}`} />
                        {t.isActive ? "Aktif" : "Nonaktif"}
                      </span>
                    </div>
                    <div className="flex gap-4 text-xs text-muted-foreground mt-2">
                      <span className="flex items-center gap-1">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        {t._count.tasks} tugas
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" />
                        {t._count.onboardings} aktif
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {t.tasks.slice(0, 5).map((task) => (
                        <li key={task.id} className="flex items-start gap-2 text-sm">
                          <span className="mt-1 size-1.5 rounded-full bg-primary shrink-0" />
                          <div className="flex-1">
                            <span className="font-medium">{task.title}</span>
                            <div className="flex gap-2 text-xs text-muted-foreground mt-0.5">
                              <span>{CATEGORY_LABELS[task.category] ?? task.category}</span>
                              <span>•</span>
                              <span>Hari ke-{task.dueDay}</span>
                            </div>
                          </div>
                        </li>
                      ))}
                      {t.tasks.length > 5 && (
                        <li className="text-xs text-muted-foreground pl-3.5">
                          + {t.tasks.length - 5} tugas lainnya
                        </li>
                      )}
                    </ul>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
