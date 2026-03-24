"use client";

import { useState, useMemo } from "react";
import {
  UserCheck,
  Users,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ChevronDown,
  ChevronRight,
  FileText,
  GraduationCap,
  Monitor,
  KeyRound,
  MoreHorizontal,
} from "lucide-react";
import { toast } from "sonner";

import {
  employeeOnboardings as initialOnboardings,
  onboardingTemplates,
  type EmployeeOnboarding,
  type EmployeeOnboardingTask,
} from "@/lib/dummy-data";
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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";

const ONBOARDING_STATUS_MAP: Record<string, string> = {
  IN_PROGRESS: "PROCESSING",
  COMPLETED: "APPROVED",
};

const CATEGORY_ICON_MAP: Record<string, typeof FileText> = {
  DOKUMEN: FileText,
  TRAINING: GraduationCap,
  EQUIPMENT: Monitor,
  AKUN: KeyRound,
  LAINNYA: MoreHorizontal,
};

const CATEGORY_COLOR_MAP: Record<string, string> = {
  DOKUMEN: "bg-blue-100 text-blue-800 border-blue-200",
  TRAINING: "bg-purple-100 text-purple-800 border-purple-200",
  EQUIPMENT: "bg-orange-100 text-orange-800 border-orange-200",
  AKUN: "bg-green-100 text-green-800 border-green-200",
  LAINNYA: "bg-slate-100 text-slate-800 border-slate-200",
};

function computeProgress(tasks: EmployeeOnboardingTask[]): number {
  if (tasks.length === 0) return 0;
  const completed = tasks.filter((t) => t.isCompleted).length;
  return Math.round((completed / tasks.length) * 100);
}

function isOverdue(onboarding: EmployeeOnboarding): boolean {
  if (onboarding.status === "COMPLETED") return false;
  const start = new Date(onboarding.startDate);
  const now = new Date();
  const daysSinceStart = Math.floor(
    (now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
  );
  return daysSinceStart > 14 && computeProgress(onboarding.tasks) < 100;
}

export default function OnboardingPage() {
  const [onboardings, setOnboardings] =
    useState<EmployeeOnboarding[]>(initialOnboardings);
  const [expandedRow, setExpandedRow] = useState<string | null>(null);

  const summary = useMemo(() => {
    const total = onboardings.length;
    const inProgress = onboardings.filter(
      (o) => o.status === "IN_PROGRESS"
    ).length;
    const completed = onboardings.filter(
      (o) => o.status === "COMPLETED"
    ).length;
    const overdue = onboardings.filter((o) => isOverdue(o)).length;
    return { total, inProgress, completed, overdue };
  }, [onboardings]);

  const handleToggleTask = (
    onboardingId: string,
    taskId: string,
    checked: boolean
  ) => {
    setOnboardings((prev) =>
      prev.map((onb) => {
        if (onb.id !== onboardingId) return onb;
        const updatedTasks = onb.tasks.map((task) => {
          if (task.taskId !== taskId) return task;
          return {
            ...task,
            isCompleted: checked,
            completedAt: checked
              ? new Date().toISOString().split("T")[0]
              : null,
          };
        });
        const allCompleted = updatedTasks.every((t) => t.isCompleted);
        return {
          ...onb,
          tasks: updatedTasks,
          status: allCompleted
            ? ("COMPLETED" as const)
            : ("IN_PROGRESS" as const),
        };
      })
    );
    toast.success(checked ? "Task selesai" : "Task dibatalkan");
  };

  const toggleExpand = (id: string) => {
    setExpandedRow((prev) => (prev === id ? null : id));
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center gap-3">
        <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10">
          <UserCheck className="size-5 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Onboarding Karyawan
          </h1>
          <p className="text-sm text-muted-foreground">
            Kelola proses onboarding karyawan baru
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total Onboarding"
          value={summary.total}
          subtitle="karyawan"
          icon={Users}
          color="blue"
        />
        <StatCard
          label="In Progress"
          value={summary.inProgress}
          subtitle="sedang berjalan"
          icon={Clock}
          color="amber"
        />
        <StatCard
          label="Completed"
          value={summary.completed}
          subtitle="selesai"
          icon={CheckCircle2}
          color="emerald"
        />
        <StatCard
          label="Overdue"
          value={summary.overdue}
          subtitle="terlambat"
          icon={AlertTriangle}
          color="red"
        />
      </div>

      {/* Tabs */}
      <Tabs defaultValue="proses">
        <TabsList>
          <TabsTrigger value="proses">
            <UserCheck className="size-4" />
            Proses Onboarding
          </TabsTrigger>
          <TabsTrigger value="template">
            <FileText className="size-4" />
            Template Checklist
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: Proses Onboarding */}
        <TabsContent value="proses">
          <Card className="shadow-sm">
            <CardContent className="px-0">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="w-8" />
                    <TableHead>Karyawan</TableHead>
                    <TableHead>Departemen</TableHead>
                    <TableHead>Tanggal Mulai</TableHead>
                    <TableHead>Progress</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Template</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {onboardings.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={7}
                        className="h-24 text-center text-muted-foreground"
                      >
                        Tidak ada data onboarding.
                      </TableCell>
                    </TableRow>
                  ) : (
                    onboardings.map((onb) => {
                      const progress = computeProgress(onb.tasks);
                      const isExpanded = expandedRow === onb.id;
                      const overdue = isOverdue(onb);

                      return (
                        <OnboardingRow
                          key={onb.id}
                          onboarding={onb}
                          progress={progress}
                          isExpanded={isExpanded}
                          isOverdue={overdue}
                          onToggleExpand={() => toggleExpand(onb.id)}
                          onToggleTask={handleToggleTask}
                        />
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 2: Template Checklist */}
        <TabsContent value="template">
          <div className="grid gap-4 md:grid-cols-2">
            {onboardingTemplates.map((template) => {
              const grouped = template.tasks.reduce<
                Record<string, typeof template.tasks>
              >((acc, task) => {
                const cat = task.category;
                if (!acc[cat]) acc[cat] = [];
                acc[cat].push(task);
                return acc;
              }, {});

              return (
                <Card key={template.id} className="shadow-sm">
                  <CardHeader className="border-b">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">
                        {template.name}
                      </CardTitle>
                      <Badge
                        variant="outline"
                        className={
                          template.isActive
                            ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                            : "border-slate-200 bg-slate-50 text-slate-600"
                        }
                      >
                        {template.isActive ? "Aktif" : "Nonaktif"}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {template.description}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {template.tasks.length} item checklist
                    </p>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {Object.entries(grouped).map(([category, tasks]) => {
                        const IconComp =
                          CATEGORY_ICON_MAP[category] ?? MoreHorizontal;
                        return (
                          <div key={category}>
                            <div className="mb-2 flex items-center gap-2">
                              <IconComp className="size-4 text-muted-foreground" />
                              <Badge
                                variant="outline"
                                className={
                                  CATEGORY_COLOR_MAP[category] ?? ""
                                }
                              >
                                {category}
                              </Badge>
                              <span className="text-xs text-muted-foreground">
                                ({tasks.length} item)
                              </span>
                            </div>
                            <ul className="space-y-1.5 pl-6">
                              {tasks.map((task) => (
                                <li
                                  key={task.id}
                                  className="flex items-center justify-between text-sm"
                                >
                                  <span>{task.title}</span>
                                  <span className="text-xs text-muted-foreground">
                                    {task.assignee} &middot; H+{task.dueDay}
                                  </span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Expandable onboarding row                                           */
/* ------------------------------------------------------------------ */

type OnboardingRowProps = {
  onboarding: EmployeeOnboarding;
  progress: number;
  isExpanded: boolean;
  isOverdue: boolean;
  onToggleExpand: () => void;
  onToggleTask: (
    onboardingId: string,
    taskId: string,
    checked: boolean
  ) => void;
};

function OnboardingRow({
  onboarding,
  progress,
  isExpanded,
  isOverdue,
  onToggleExpand,
  onToggleTask,
}: OnboardingRowProps) {
  return (
    <>
      <TableRow
        className="cursor-pointer hover:bg-muted/50"
        onClick={onToggleExpand}
      >
        <TableCell className="w-8">
          <Button variant="ghost" size="xs" className="size-6 p-0">
            {isExpanded ? (
              <ChevronDown className="size-4" />
            ) : (
              <ChevronRight className="size-4" />
            )}
          </Button>
        </TableCell>
        <TableCell className="font-medium">
          {onboarding.employeeName}
          <span className="block text-xs text-muted-foreground">
            {onboarding.positionName}
          </span>
        </TableCell>
        <TableCell>{onboarding.departmentName}</TableCell>
        <TableCell className="whitespace-nowrap">
          {onboarding.startDate}
        </TableCell>
        <TableCell>
          <div className="flex items-center gap-2">
            <div className="h-2 w-24 rounded-full bg-muted">
              <div
                className={`h-2 rounded-full transition-all ${
                  progress === 100
                    ? "bg-emerald-500"
                    : isOverdue
                      ? "bg-red-500"
                      : "bg-blue-500"
                }`}
                style={{ width: `${progress}%` }}
              />
            </div>
            <span className="text-xs font-medium tabular-nums">
              {progress}%
            </span>
          </div>
        </TableCell>
        <TableCell>
          {isOverdue ? (
            <Badge
              variant="outline"
              className="border-red-200 bg-red-50 text-red-700 gap-1"
            >
              <AlertTriangle className="size-3" />
              Overdue
            </Badge>
          ) : (
            <StatusBadge
              status={
                ONBOARDING_STATUS_MAP[onboarding.status] ?? onboarding.status
              }
            />
          )}
        </TableCell>
        <TableCell>
          <span className="text-xs text-muted-foreground">
            {onboarding.templateName}
          </span>
        </TableCell>
      </TableRow>

      {/* Expanded checklist */}
      {isExpanded && (
        <TableRow className="bg-muted/30 hover:bg-muted/30">
          <TableCell colSpan={7} className="p-0">
            <div className="px-6 py-4">
              <p className="mb-3 text-sm font-medium text-muted-foreground">
                Checklist Onboarding - {onboarding.employeeName}
              </p>
              <div className="grid gap-2 md:grid-cols-2">
                {onboarding.tasks.map((task) => (
                  <label
                    key={task.taskId}
                    className="flex items-center gap-3 rounded-md border bg-background px-3 py-2 text-sm transition-colors hover:bg-muted/50"
                  >
                    <Checkbox
                      checked={task.isCompleted}
                      onCheckedChange={(checked: boolean) =>
                        onToggleTask(onboarding.id, task.taskId, checked)
                      }
                    />
                    <div className="flex flex-1 items-center justify-between gap-2">
                      <span
                        className={
                          task.isCompleted
                            ? "text-muted-foreground line-through"
                            : ""
                        }
                      >
                        {task.title}
                      </span>
                      <div className="flex items-center gap-1.5">
                        <Badge
                          variant="outline"
                          className={
                            CATEGORY_COLOR_MAP[task.category] ?? ""
                          }
                        >
                          {task.category}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {task.assignee}
                        </span>
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </TableCell>
        </TableRow>
      )}
    </>
  );
}
