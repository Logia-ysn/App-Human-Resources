"use client";

import { useState, useMemo } from "react";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import { BarChart3, TrendingUp, Plus } from "lucide-react";
import { toast } from "sonner";

import { useAppStore } from "@/lib/store/app-store";
import {
  RATING_LABELS,
  REVIEW_STATUS_LABELS,
  type ReviewCycleRecord,
} from "@/lib/dummy-data";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const CYCLE_TYPE_LABELS: Record<string, string> = {
  QUARTERLY: "Kuartalan",
  SEMI_ANNUAL: "Semester",
  ANNUAL: "Tahunan",
};

const CYCLE_STATUS_MAP: Record<string, string> = {
  DRAFT: "DRAFT",
  ACTIVE: "ACTIVE",
  REVIEW_IN_PROGRESS: "PROCESSING",
  COMPLETED: "APPROVED",
};

const RATING_COLORS: Record<string, string> = {
  OUTSTANDING: "bg-green-100 text-green-800 hover:bg-green-100",
  EXCEEDS_EXPECTATIONS: "bg-blue-100 text-blue-800 hover:bg-blue-100",
  MEETS_EXPECTATIONS: "bg-yellow-100 text-yellow-800 hover:bg-yellow-100",
  BELOW_EXPECTATIONS: "bg-orange-100 text-orange-800 hover:bg-orange-100",
  UNSATISFACTORY: "bg-red-100 text-red-800 hover:bg-red-100",
};

const SCORE_BAR_COLORS: Record<string, string> = {
  high: "bg-green-500",
  mid: "bg-blue-500",
  low: "bg-orange-500",
};

type CycleFormData = {
  name: string;
  type: ReviewCycleRecord["type"];
  startDate: string;
  endDate: string;
  selfReviewDeadline: string;
  managerReviewDeadline: string;
};

const EMPTY_CYCLE_FORM: CycleFormData = {
  name: "",
  type: "QUARTERLY",
  startDate: "",
  endDate: "",
  selfReviewDeadline: "",
  managerReviewDeadline: "",
};

function formatDate(dateStr: string): string {
  return format(new Date(dateStr), "dd MMM yyyy", { locale: idLocale });
}

function getScoreBarColor(score: number | null): string {
  if (score === null) return "bg-gray-200";
  if (score >= 90) return SCORE_BAR_COLORS.high;
  if (score >= 70) return SCORE_BAR_COLORS.mid;
  return SCORE_BAR_COLORS.low;
}

export default function PerformancePage() {
  const cycles = useAppStore((s) => s.reviewCycles);
  const performanceReviews = useAppStore((s) => s.performanceReviews);
  const storeAddReviewCycle = useAppStore((s) => s.addReviewCycle);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [cycleForm, setCycleForm] = useState<CycleFormData>(EMPTY_CYCLE_FORM);
  const [selectedCycleId, setSelectedCycleId] = useState<string>("ALL");

  // -- Siklus Review helpers --

  function openCreateCycle() {
    setCycleForm(EMPTY_CYCLE_FORM);
    setDialogOpen(true);
  }

  function handleCreateCycle() {
    if (
      !cycleForm.name.trim() ||
      !cycleForm.startDate ||
      !cycleForm.endDate ||
      !cycleForm.selfReviewDeadline ||
      !cycleForm.managerReviewDeadline
    ) {
      toast.error("Semua field wajib diisi");
      return;
    }

    const newCycle: ReviewCycleRecord = {
      id: `rc-${Date.now()}`,
      name: cycleForm.name.trim(),
      type: cycleForm.type,
      startDate: cycleForm.startDate,
      endDate: cycleForm.endDate,
      selfReviewDeadline: cycleForm.selfReviewDeadline,
      managerReviewDeadline: cycleForm.managerReviewDeadline,
      status: "DRAFT",
      totalReviews: 0,
      completedReviews: 0,
    };

    storeAddReviewCycle(newCycle);
    setDialogOpen(false);
    toast.success("Siklus review berhasil ditambahkan");
  }

  // -- Hasil Review helpers --

  const filteredReviews = useMemo(() => {
    if (selectedCycleId === "ALL") return performanceReviews;
    return performanceReviews.filter((r) => r.cycleId === selectedCycleId);
  }, [performanceReviews, selectedCycleId]);

  const completedReviews = useMemo(
    () => filteredReviews.filter((r) => r.finalScore !== null),
    [filteredReviews],
  );

  const averageScore = useMemo(() => {
    if (completedReviews.length === 0) return 0;
    const total = completedReviews.reduce(
      (sum, r) => sum + (r.finalScore ?? 0),
      0,
    );
    return total / completedReviews.length;
  }, [completedReviews]);

  const scoreDistribution = useMemo(() => {
    const dist: Record<string, number> = {
      OUTSTANDING: 0,
      EXCEEDS_EXPECTATIONS: 0,
      MEETS_EXPECTATIONS: 0,
      BELOW_EXPECTATIONS: 0,
      UNSATISFACTORY: 0,
    };
    for (const review of completedReviews) {
      if (review.rating !== null) {
        dist[review.rating] = (dist[review.rating] ?? 0) + 1;
      }
    }
    return dist;
  }, [completedReviews]);

  const handleCycleFilterChange = (value: string | null) => {
    setSelectedCycleId(value ?? "ALL");
  };

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10">
          <BarChart3 className="size-5 text-primary" />
        </div>
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
            Penilaian Kinerja
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Kelola siklus review dan hasil penilaian kinerja karyawan.
          </p>
        </div>
      </div>

      <Tabs defaultValue="siklus">
        <TabsList>
          <TabsTrigger value="siklus">Siklus Review</TabsTrigger>
          <TabsTrigger value="hasil">Hasil Review</TabsTrigger>
        </TabsList>

        {/* Tab: Siklus Review */}
        <TabsContent value="siklus">
          {/* Floating action button on mobile */}
          <div className="md:hidden flex justify-end mb-4">
            <Button onClick={openCreateCycle} size="sm">
              <Plus className="size-4 mr-1" />
              Tambah Siklus
            </Button>
          </div>

          {/* Mobile card view for review cycles */}
          <div className="md:hidden space-y-3">
            {cycles.length === 0 ? (
              <Card className="p-4">
                <p className="text-center text-sm text-muted-foreground">
                  Tidak ada data siklus review.
                </p>
              </Card>
            ) : (
              cycles.map((cycle) => (
                <Card key={cycle.id} className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-medium text-sm">{cycle.name}</p>
                      <Badge variant="outline" className="text-xs mt-1">
                        {CYCLE_TYPE_LABELS[cycle.type] ?? cycle.type}
                      </Badge>
                    </div>
                    <StatusBadge
                      status={CYCLE_STATUS_MAP[cycle.status] ?? cycle.status}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm mt-3">
                    <div>
                      <p className="text-[11px] text-muted-foreground">Periode</p>
                      <p className="font-medium text-xs">
                        {formatDate(cycle.startDate)} - {formatDate(cycle.endDate)}
                      </p>
                    </div>
                    <div>
                      <p className="text-[11px] text-muted-foreground">Progress</p>
                      <p className="font-medium">{cycle.completedReviews}/{cycle.totalReviews}</p>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>

          {/* Desktop table view */}
          <div className="hidden md:block">
            <Card className="shadow-sm">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Daftar Siklus Review</CardTitle>
                  <Button onClick={openCreateCycle}>
                    <Plus className="size-4" data-icon="inline-start" />
                    Tambah Siklus
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="px-0">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead>Nama Siklus</TableHead>
                      <TableHead>Tipe</TableHead>
                      <TableHead>Periode</TableHead>
                      <TableHead>Deadline Self Review</TableHead>
                      <TableHead>Deadline Manager</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-center">Progress</TableHead>
                      <TableHead className="text-right">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {cycles.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={8}
                          className="h-24 text-center text-muted-foreground"
                        >
                          Tidak ada data siklus review.
                        </TableCell>
                      </TableRow>
                    ) : (
                      cycles.map((cycle) => (
                        <TableRow key={cycle.id} className="hover:bg-muted/50">
                          <TableCell className="font-medium">
                            {cycle.name}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {CYCLE_TYPE_LABELS[cycle.type] ?? cycle.type}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {formatDate(cycle.startDate)} -{" "}
                            {formatDate(cycle.endDate)}
                          </TableCell>
                          <TableCell>
                            {formatDate(cycle.selfReviewDeadline)}
                          </TableCell>
                          <TableCell>
                            {formatDate(cycle.managerReviewDeadline)}
                          </TableCell>
                          <TableCell>
                            <StatusBadge
                              status={CYCLE_STATUS_MAP[cycle.status] ?? cycle.status}
                            />
                          </TableCell>
                          <TableCell className="text-center">
                            <span className="text-sm">
                              {cycle.completedReviews}/{cycle.totalReviews}
                            </span>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="icon-sm">
                              <BarChart3 className="size-4" />
                              <span className="sr-only">Detail</span>
                            </Button>
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

        {/* Tab: Hasil Review */}
        <TabsContent value="hasil">
          <div className="space-y-4 md:space-y-6">
            {/* Filter */}
            <Card className="shadow-sm">
              <CardContent>
                <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                  <Label className="text-sm font-medium">Siklus Review:</Label>
                  <Select
                    value={selectedCycleId}
                    onValueChange={handleCycleFilterChange}
                  >
                    <SelectTrigger className="w-full sm:w-[260px]">
                      <SelectValue placeholder="Pilih siklus review" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ALL">Semua Siklus</SelectItem>
                      {cycles.map((cycle) => (
                        <SelectItem key={cycle.id} value={cycle.id}>
                          {cycle.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Summary Cards - 2 col mobile, 3 col desktop */}
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
              <Card className="p-3 sm:p-4 shadow-sm border-l-4 border-l-blue-500">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-100">
                    <TrendingUp className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-xl sm:text-2xl font-bold">
                      {averageScore > 0 ? averageScore.toFixed(1) : "-"}
                    </p>
                    <p className="text-[11px] sm:text-xs text-muted-foreground">Rata-rata Skor</p>
                  </div>
                </div>
              </Card>

              <Card className="p-3 sm:p-4 shadow-sm border-l-4 border-l-green-500">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-green-100">
                    <BarChart3 className="h-4 w-4 text-green-600" />
                  </div>
                  <div>
                    <p className="text-xl sm:text-2xl font-bold">{filteredReviews.length}</p>
                    <p className="text-[11px] sm:text-xs text-muted-foreground">Total Review</p>
                  </div>
                </div>
              </Card>

              <Card className="col-span-2 lg:col-span-1 p-3 sm:p-4 shadow-sm border-l-4 border-l-purple-500">
                <p className="mb-2 text-xs sm:text-sm font-medium text-muted-foreground">
                  Distribusi Rating
                </p>
                <div className="space-y-1.5">
                  {Object.entries(scoreDistribution).map(([key, count]) => (
                    <div
                      key={key}
                      className="flex items-center justify-between text-xs"
                    >
                      <span className="truncate mr-2">{RATING_LABELS[key] ?? key}</span>
                      <Badge
                        variant="outline"
                        className={`border-0 shrink-0 ${RATING_COLORS[key] ?? ""}`}
                      >
                        {count}
                      </Badge>
                    </div>
                  ))}
                </div>
              </Card>
            </div>

            {/* Mobile card view for review results */}
            <div className="md:hidden space-y-3">
              {filteredReviews.length === 0 ? (
                <Card className="p-4">
                  <p className="text-center text-sm text-muted-foreground">
                    Tidak ada data review.
                  </p>
                </Card>
              ) : (
                filteredReviews.map((review) => (
                  <Card key={review.id} className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="font-medium text-sm">{review.employeeName}</p>
                        <p className="text-xs text-muted-foreground">{review.positionName}</p>
                      </div>
                      {review.rating !== null ? (
                        <Badge
                          variant="outline"
                          className={`border-0 text-xs ${RATING_COLORS[review.rating] ?? ""}`}
                        >
                          {RATING_LABELS[review.rating] ?? review.rating}
                        </Badge>
                      ) : (
                        <span className="text-xs text-muted-foreground">-</span>
                      )}
                    </div>

                    {/* Score bars for mobile */}
                    <div className="space-y-2 mt-3">
                      <div>
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="text-muted-foreground">Self Score</span>
                          <span className="font-semibold">{review.selfScore ?? "-"}</span>
                        </div>
                        <div className="h-2 w-full rounded-full bg-muted">
                          <div
                            className={`h-2 rounded-full transition-all ${getScoreBarColor(review.selfScore)}`}
                            style={{ width: `${review.selfScore ?? 0}%` }}
                          />
                        </div>
                      </div>
                      <div>
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="text-muted-foreground">Manager Score</span>
                          <span className="font-semibold">{review.managerScore ?? "-"}</span>
                        </div>
                        <div className="h-2 w-full rounded-full bg-muted">
                          <div
                            className={`h-2 rounded-full transition-all ${getScoreBarColor(review.managerScore)}`}
                            style={{ width: `${review.managerScore ?? 0}%` }}
                          />
                        </div>
                      </div>
                      <div>
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="text-muted-foreground">Final Score</span>
                          <span className="font-bold">{review.finalScore ?? "-"}</span>
                        </div>
                        <div className="h-2.5 w-full rounded-full bg-muted">
                          <div
                            className={`h-2.5 rounded-full transition-all ${getScoreBarColor(review.finalScore)}`}
                            style={{ width: `${review.finalScore ?? 0}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </Card>
                ))
              )}
            </div>

            {/* Desktop table view */}
            <div className="hidden md:block">
              <Card className="shadow-sm">
                <CardHeader>
                  <CardTitle>Hasil Penilaian Kinerja</CardTitle>
                </CardHeader>
                <CardContent className="px-0">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/50">
                        <TableHead>Nama</TableHead>
                        <TableHead>Departemen</TableHead>
                        <TableHead>Jabatan</TableHead>
                        <TableHead>Reviewer</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-center">Self Score</TableHead>
                        <TableHead className="text-center">
                          Manager Score
                        </TableHead>
                        <TableHead className="text-center">
                          Final Score
                        </TableHead>
                        <TableHead>Rating</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredReviews.length === 0 ? (
                        <TableRow>
                          <TableCell
                            colSpan={9}
                            className="h-24 text-center text-muted-foreground"
                          >
                            Tidak ada data review.
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredReviews.map((review) => {
                          const scoreColor = (score: number | null) => {
                            if (score === null) return "";
                            if (score >= 90) return "text-green-700 font-semibold";
                            if (score >= 70) return "text-blue-700 font-semibold";
                            return "text-orange-600 font-semibold";
                          };
                          return (
                          <TableRow key={review.id} className="hover:bg-muted/50">
                            <TableCell className="font-medium">
                              {review.employeeName}
                            </TableCell>
                            <TableCell>{review.departmentName}</TableCell>
                            <TableCell>{review.positionName}</TableCell>
                            <TableCell>{review.reviewerName}</TableCell>
                            <TableCell>
                              <Badge variant="outline">
                                {REVIEW_STATUS_LABELS[review.status] ??
                                  review.status}
                              </Badge>
                            </TableCell>
                            <TableCell className={`text-center ${scoreColor(review.selfScore)}`}>
                              {review.selfScore ?? "-"}
                            </TableCell>
                            <TableCell className={`text-center ${scoreColor(review.managerScore)}`}>
                              {review.managerScore ?? "-"}
                            </TableCell>
                            <TableCell className={`text-center ${scoreColor(review.finalScore)}`}>
                              {review.finalScore ?? "-"}
                            </TableCell>
                            <TableCell>
                              {review.rating !== null ? (
                                <Badge
                                  variant="outline"
                                  className={`border-0 ${RATING_COLORS[review.rating] ?? ""}`}
                                >
                                  {RATING_LABELS[review.rating] ?? review.rating}
                                </Badge>
                              ) : (
                                <span className="text-muted-foreground">-</span>
                              )}
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
          </div>
        </TabsContent>
      </Tabs>

      {/* Dialog: Tambah Siklus */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Tambah Siklus Review</DialogTitle>
            <DialogDescription>
              Buat siklus penilaian kinerja baru.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4">
            <div className="space-y-2">
              <Label htmlFor="cycle-name">Nama Siklus</Label>
              <Input
                id="cycle-name"
                placeholder="Contoh: Review Q1 2026"
                value={cycleForm.name}
                onChange={(e) =>
                  setCycleForm((prev) => ({ ...prev, name: e.target.value }))
                }
              />
            </div>

            <div className="space-y-2">
              <Label>Tipe</Label>
              <Select
                value={cycleForm.type}
                onValueChange={(val) =>
                  val !== null &&
                  setCycleForm((prev) => ({
                    ...prev,
                    type: val as ReviewCycleRecord["type"],
                  }))
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Pilih tipe" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="QUARTERLY">Kuartalan</SelectItem>
                  <SelectItem value="SEMI_ANNUAL">Semester</SelectItem>
                  <SelectItem value="ANNUAL">Tahunan</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="cycle-start">Tanggal Mulai</Label>
                <Input
                  id="cycle-start"
                  type="date"
                  value={cycleForm.startDate}
                  onChange={(e) =>
                    setCycleForm((prev) => ({
                      ...prev,
                      startDate: e.target.value,
                    }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cycle-end">Tanggal Selesai</Label>
                <Input
                  id="cycle-end"
                  type="date"
                  value={cycleForm.endDate}
                  onChange={(e) =>
                    setCycleForm((prev) => ({
                      ...prev,
                      endDate: e.target.value,
                    }))
                  }
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="cycle-self-deadline">
                  Deadline Self Review
                </Label>
                <Input
                  id="cycle-self-deadline"
                  type="date"
                  value={cycleForm.selfReviewDeadline}
                  onChange={(e) =>
                    setCycleForm((prev) => ({
                      ...prev,
                      selfReviewDeadline: e.target.value,
                    }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cycle-mgr-deadline">
                  Deadline Manager Review
                </Label>
                <Input
                  id="cycle-mgr-deadline"
                  type="date"
                  value={cycleForm.managerReviewDeadline}
                  onChange={(e) =>
                    setCycleForm((prev) => ({
                      ...prev,
                      managerReviewDeadline: e.target.value,
                    }))
                  }
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Batal
            </Button>
            <Button onClick={handleCreateCycle}>Tambah</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
