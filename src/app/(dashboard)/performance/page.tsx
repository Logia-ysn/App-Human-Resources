"use client";

import { useState, useMemo } from "react";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import { BarChart3, TrendingUp, Plus } from "lucide-react";
import { toast } from "sonner";

import {
  reviewCycles,
  performanceReviews,
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

export default function PerformancePage() {
  const [cycles, setCycles] = useState<ReviewCycleRecord[]>([...reviewCycles]);
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

    setCycles((prev) => [...prev, newCycle]);
    setDialogOpen(false);
    toast.success("Siklus review berhasil ditambahkan");
  }

  // -- Hasil Review helpers --

  const filteredReviews = useMemo(() => {
    if (selectedCycleId === "ALL") return performanceReviews;
    return performanceReviews.filter((r) => r.cycleId === selectedCycleId);
  }, [selectedCycleId]);

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
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10">
          <BarChart3 className="size-5 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Penilaian Kinerja
          </h1>
          <p className="text-sm text-muted-foreground">
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
        </TabsContent>

        {/* Tab: Hasil Review */}
        <TabsContent value="hasil">
          <div className="space-y-6">
            {/* Filter */}
            <Card className="shadow-sm">
              <CardContent>
                <div className="flex items-center gap-4">
                  <Label className="text-sm font-medium">Siklus Review:</Label>
                  <Select
                    value={selectedCycleId}
                    onValueChange={handleCycleFilterChange}
                  >
                    <SelectTrigger className="w-[260px]">
                      <SelectValue placeholder="Pilih siklus review" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ALL">Semua Siklus</SelectItem>
                      {reviewCycles.map((cycle) => (
                        <SelectItem key={cycle.id} value={cycle.id}>
                          {cycle.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <Card className="shadow-sm border-l-4 border-l-blue-500">
                <CardContent>
                  <div className="flex items-center gap-3">
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-blue-100">
                      <TrendingUp className="size-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Rata-rata Skor
                      </p>
                      <p className="text-2xl font-bold">
                        {averageScore > 0 ? averageScore.toFixed(1) : "-"}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-sm border-l-4 border-l-green-500">
                <CardContent>
                  <div className="flex items-center gap-3">
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-green-100">
                      <BarChart3 className="size-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Total Review
                      </p>
                      <p className="text-2xl font-bold">
                        {filteredReviews.length}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-sm border-l-4 border-l-purple-500">
                <CardContent>
                  <p className="mb-2 text-sm font-medium text-muted-foreground">
                    Distribusi Rating
                  </p>
                  <div className="space-y-1.5">
                    {Object.entries(scoreDistribution).map(([key, count]) => (
                      <div
                        key={key}
                        className="flex items-center justify-between text-xs"
                      >
                        <span>{RATING_LABELS[key] ?? key}</span>
                        <Badge
                          variant="outline"
                          className={`border-0 ${RATING_COLORS[key] ?? ""}`}
                        >
                          {count}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Review Results Table */}
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
