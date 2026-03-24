"use client";

import { useState, useMemo } from "react";
import { GraduationCap, Plus, Users, BookOpen, Clock, CheckCircle } from "lucide-react";
import { toast } from "sonner";

import {
  trainings as initialTrainings,
  trainingParticipants,
  CATEGORY_LABELS,
  METHOD_LABELS,
  TRAINING_STATUS_LABELS,
  type TrainingRecord,
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

const formatCurrency = (n: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(n);

const TRAINING_STATUS_TO_BADGE: Record<string, string> = {
  IN_PROGRESS: "ACTIVE",
  COMPLETED: "APPROVED",
  REGISTRATION_OPEN: "PENDING",
  PLANNED: "DRAFT",
};

const CATEGORY_COLOR_MAP: Record<string, string> = {
  TECHNICAL: "bg-blue-100 text-blue-800 border-blue-200",
  SOFT_SKILL: "bg-purple-100 text-purple-800 border-purple-200",
  LEADERSHIP: "bg-amber-100 text-amber-800 border-amber-200",
  COMPLIANCE: "bg-red-100 text-red-800 border-red-200",
  SAFETY: "bg-orange-100 text-orange-800 border-orange-200",
  ONBOARDING: "bg-green-100 text-green-800 border-green-200",
};

function renderStars(rating: number | null) {
  if (rating == null) return <span className="text-muted-foreground">-</span>;
  return (
    <span className="text-yellow-500">
      {"★".repeat(rating)}
      {"☆".repeat(5 - rating)}
    </span>
  );
}

export default function TrainingPage() {
  const [trainings, setTrainings] =
    useState<TrainingRecord[]>(initialTrainings);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [participantFilter, setParticipantFilter] = useState("ALL");

  // Form state
  const [formTitle, setFormTitle] = useState("");
  const [formCategory, setFormCategory] = useState<string>("TECHNICAL");
  const [formMethod, setFormMethod] = useState<string>("ONLINE");
  const [formProvider, setFormProvider] = useState("");
  const [formTrainer, setFormTrainer] = useState("");
  const [formLocation, setFormLocation] = useState("");
  const [formStartDate, setFormStartDate] = useState("");
  const [formEndDate, setFormEndDate] = useState("");
  const [formMaxParticipants, setFormMaxParticipants] = useState("");
  const [formCostPerPerson, setFormCostPerPerson] = useState("");
  const [formDescription, setFormDescription] = useState("");

  // Summary counts
  const summary = useMemo(() => {
    const total = trainings.length;
    const berlangsung = trainings.filter(
      (t) => t.status === "IN_PROGRESS",
    ).length;
    const pendaftaran = trainings.filter(
      (t) => t.status === "REGISTRATION_OPEN",
    ).length;
    const selesai = trainings.filter((t) => t.status === "COMPLETED").length;
    return { total, berlangsung, pendaftaran, selesai };
  }, [trainings]);

  // Filtered participants
  const filteredParticipants = useMemo(() => {
    if (participantFilter === "ALL") return trainingParticipants;
    return trainingParticipants.filter(
      (p) => p.trainingId === participantFilter,
    );
  }, [participantFilter]);

  const resetForm = () => {
    setFormTitle("");
    setFormCategory("TECHNICAL");
    setFormMethod("ONLINE");
    setFormProvider("");
    setFormTrainer("");
    setFormLocation("");
    setFormStartDate("");
    setFormEndDate("");
    setFormMaxParticipants("");
    setFormCostPerPerson("");
    setFormDescription("");
  };

  const handleAddTraining = () => {
    if (
      !formTitle.trim() ||
      !formProvider.trim() ||
      !formStartDate ||
      !formEndDate
    ) {
      return;
    }

    const newTraining: TrainingRecord = {
      id: `tr-${Date.now()}`,
      title: formTitle.trim(),
      category: formCategory as TrainingRecord["category"],
      provider: formProvider.trim(),
      trainer: formTrainer.trim(),
      method: formMethod as TrainingRecord["method"],
      location: formLocation.trim(),
      startDate: formStartDate,
      endDate: formEndDate,
      maxParticipants: parseInt(formMaxParticipants, 10) || 20,
      enrolledCount: 0,
      costPerPerson: parseInt(formCostPerPerson, 10) || 0,
      status: "PLANNED",
      createdAt: new Date().toISOString().split("T")[0],
    };

    setTrainings((prev) => [...prev, newTraining]);
    resetForm();
    setDialogOpen(false);
    toast.success("Training berhasil ditambahkan");
  };

  const isFormValid =
    formTitle.trim() !== "" &&
    formProvider.trim() !== "" &&
    formStartDate !== "" &&
    formEndDate !== "";

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10">
          <GraduationCap className="size-5 text-primary" />
        </div>
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
            Manajemen Training
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Kelola program pelatihan dan peserta training
          </p>
        </div>
      </div>

      <Tabs defaultValue="program">
        <TabsList>
          <TabsTrigger value="program">
            <GraduationCap className="size-4" />
            Program Training
          </TabsTrigger>
          <TabsTrigger value="peserta">
            <Users className="size-4" />
            Peserta
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: Program Training */}
        <TabsContent value="program">
          <div className="space-y-4">
            {/* Stat Cards - 2 col mobile, 4 col desktop */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              <Card className="p-3 sm:p-4 shadow-sm border-l-4 border-l-blue-500">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-100">
                    <BookOpen className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-xl sm:text-2xl font-bold">{summary.total}</p>
                    <p className="text-[11px] sm:text-xs text-muted-foreground">Total Program</p>
                  </div>
                </div>
              </Card>

              <Card className="p-3 sm:p-4 shadow-sm border-l-4 border-l-green-500">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-green-100">
                    <GraduationCap className="h-4 w-4 text-green-600" />
                  </div>
                  <div>
                    <p className="text-xl sm:text-2xl font-bold">{summary.berlangsung}</p>
                    <p className="text-[11px] sm:text-xs text-muted-foreground">Berlangsung</p>
                  </div>
                </div>
              </Card>

              <Card className="p-3 sm:p-4 shadow-sm border-l-4 border-l-yellow-500">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-yellow-100">
                    <Clock className="h-4 w-4 text-yellow-600" />
                  </div>
                  <div>
                    <p className="text-xl sm:text-2xl font-bold">{summary.pendaftaran}</p>
                    <p className="text-[11px] sm:text-xs text-muted-foreground">Pendaftaran Buka</p>
                  </div>
                </div>
              </Card>

              <Card className="p-3 sm:p-4 shadow-sm border-l-4 border-l-gray-400">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gray-100">
                    <CheckCircle className="h-4 w-4 text-gray-500" />
                  </div>
                  <div>
                    <p className="text-xl sm:text-2xl font-bold">{summary.selesai}</p>
                    <p className="text-[11px] sm:text-xs text-muted-foreground">Selesai</p>
                  </div>
                </div>
              </Card>
            </div>

            <div className="flex justify-end">
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger
                  render={
                    <Button>
                      <Plus data-icon="inline-start" />
                      Tambah Training
                    </Button>
                  }
                />
                <DialogContent className="sm:max-w-lg">
                  <DialogHeader>
                    <DialogTitle>Tambah Training Baru</DialogTitle>
                  </DialogHeader>
                  <div className="grid gap-4 py-2">
                    <div className="grid gap-2">
                      <Label htmlFor="training-title">Judul Training</Label>
                      <Input
                        id="training-title"
                        placeholder="Masukkan judul training"
                        value={formTitle}
                        onChange={(e) => setFormTitle(e.target.value)}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label>Kategori</Label>
                        <Select
                          value={formCategory}
                          onValueChange={(val: string | null) =>
                            setFormCategory(val ?? "TECHNICAL")
                          }
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Pilih kategori" />
                          </SelectTrigger>
                          <SelectContent>
                            {Object.entries(CATEGORY_LABELS).map(
                              ([key, label]) => (
                                <SelectItem key={key} value={key}>
                                  {label}
                                </SelectItem>
                              ),
                            )}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="grid gap-2">
                        <Label>Metode</Label>
                        <Select
                          value={formMethod}
                          onValueChange={(val: string | null) =>
                            setFormMethod(val ?? "ONLINE")
                          }
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Pilih metode" />
                          </SelectTrigger>
                          <SelectContent>
                            {Object.entries(METHOD_LABELS).map(
                              ([key, label]) => (
                                <SelectItem key={key} value={key}>
                                  {label}
                                </SelectItem>
                              ),
                            )}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="training-provider">Penyedia</Label>
                      <Input
                        id="training-provider"
                        placeholder="Nama penyedia training"
                        value={formProvider}
                        onChange={(e) => setFormProvider(e.target.value)}
                      />
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="training-trainer">Trainer</Label>
                      <Input
                        id="training-trainer"
                        placeholder="Nama trainer"
                        value={formTrainer}
                        onChange={(e) => setFormTrainer(e.target.value)}
                      />
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="training-location">Lokasi</Label>
                      <Input
                        id="training-location"
                        placeholder="Lokasi training"
                        value={formLocation}
                        onChange={(e) => setFormLocation(e.target.value)}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="training-start">Tanggal Mulai</Label>
                        <Input
                          id="training-start"
                          type="date"
                          value={formStartDate}
                          onChange={(e) => setFormStartDate(e.target.value)}
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="training-end">Tanggal Selesai</Label>
                        <Input
                          id="training-end"
                          type="date"
                          value={formEndDate}
                          onChange={(e) => setFormEndDate(e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="training-max">Maks. Peserta</Label>
                        <Input
                          id="training-max"
                          type="number"
                          placeholder="20"
                          value={formMaxParticipants}
                          onChange={(e) =>
                            setFormMaxParticipants(e.target.value)
                          }
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="training-cost">Biaya / Orang</Label>
                        <Input
                          id="training-cost"
                          type="number"
                          placeholder="0"
                          value={formCostPerPerson}
                          onChange={(e) => setFormCostPerPerson(e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="training-desc">Deskripsi</Label>
                      <Textarea
                        id="training-desc"
                        placeholder="Deskripsi training (opsional)"
                        value={formDescription}
                        onChange={(e) => setFormDescription(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      onClick={() => {
                        resetForm();
                        setDialogOpen(false);
                      }}
                    >
                      Batal
                    </Button>
                    <Button onClick={handleAddTraining} disabled={!isFormValid}>
                      Simpan
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            {/* Mobile card view for training programs */}
            <div className="md:hidden space-y-3">
              {trainings.length === 0 ? (
                <Card className="p-4">
                  <p className="text-center text-sm text-muted-foreground">
                    Tidak ada data training.
                  </p>
                </Card>
              ) : (
                trainings.map((training) => (
                  <Card key={training.id} className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1 mr-2">
                        <p className="font-medium text-sm">{training.title}</p>
                        <div className="flex flex-wrap gap-1.5 mt-1">
                          <Badge
                            variant="outline"
                            className={`text-xs ${CATEGORY_COLOR_MAP[training.category] ?? ""}`}
                          >
                            {CATEGORY_LABELS[training.category] ?? training.category}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {METHOD_LABELS[training.method] ?? training.method}
                          </Badge>
                        </div>
                      </div>
                      <StatusBadge
                        status={
                          TRAINING_STATUS_TO_BADGE[training.status] ?? training.status
                        }
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm mt-3">
                      <div>
                        <p className="text-[11px] text-muted-foreground">Tanggal</p>
                        <p className="font-medium text-xs">{training.startDate} - {training.endDate}</p>
                      </div>
                      <div>
                        <p className="text-[11px] text-muted-foreground">Peserta</p>
                        <p className="font-medium">{training.enrolledCount}/{training.maxParticipants}</p>
                      </div>
                      <div>
                        <p className="text-[11px] text-muted-foreground">Penyedia</p>
                        <p className="font-medium text-xs truncate">{training.provider}</p>
                      </div>
                      <div>
                        <p className="text-[11px] text-muted-foreground">Biaya/Orang</p>
                        <p className="font-medium text-xs">{formatCurrency(training.costPerPerson)}</p>
                      </div>
                    </div>
                    <div className="mt-3 pt-2 border-t">
                      <Button variant="ghost" size="sm" className="w-full">
                        Detail
                      </Button>
                    </div>
                  </Card>
                ))
              )}
            </div>

            {/* Desktop table view */}
            <div className="hidden md:block">
              <Card className="shadow-sm">
                <CardContent className="px-0">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/50">
                        <TableHead>Judul</TableHead>
                        <TableHead>Kategori</TableHead>
                        <TableHead>Metode</TableHead>
                        <TableHead>Penyedia</TableHead>
                        <TableHead>Tanggal</TableHead>
                        <TableHead>Peserta</TableHead>
                        <TableHead>Biaya/Orang</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Aksi</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {trainings.length === 0 ? (
                        <TableRow>
                          <TableCell
                            colSpan={9}
                            className="h-24 text-center text-muted-foreground"
                          >
                            Tidak ada data training.
                          </TableCell>
                        </TableRow>
                      ) : (
                        trainings.map((training) => (
                          <TableRow key={training.id} className="hover:bg-muted/50">
                            <TableCell className="font-medium">
                              {training.title}
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant="outline"
                                className={CATEGORY_COLOR_MAP[training.category] ?? ""}
                              >
                                {CATEGORY_LABELS[training.category] ??
                                  training.category}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline">
                                {METHOD_LABELS[training.method] ??
                                  training.method}
                              </Badge>
                            </TableCell>
                            <TableCell>{training.provider}</TableCell>
                            <TableCell className="whitespace-nowrap">
                              {training.startDate} - {training.endDate}
                            </TableCell>
                            <TableCell>
                              {training.enrolledCount}/{training.maxParticipants}
                            </TableCell>
                            <TableCell className="whitespace-nowrap">
                              {formatCurrency(training.costPerPerson)}
                            </TableCell>
                            <TableCell>
                              <StatusBadge
                                status={
                                  TRAINING_STATUS_TO_BADGE[training.status] ??
                                  training.status
                                }
                              />
                            </TableCell>
                            <TableCell className="text-right">
                              <Button variant="ghost" size="xs">
                                Detail
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
          </div>
        </TabsContent>

        {/* Tab 2: Peserta */}
        <TabsContent value="peserta">
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <Select
                value={participantFilter}
                onValueChange={(val: string | null) =>
                  setParticipantFilter(val ?? "ALL")
                }
              >
                <SelectTrigger className="w-full sm:w-[280px]">
                  <SelectValue placeholder="Filter training" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Semua Training</SelectItem>
                  {trainings.map((t) => (
                    <SelectItem key={t.id} value={t.id}>
                      {t.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Mobile compact list for participants */}
            <div className="md:hidden space-y-3">
              {filteredParticipants.length === 0 ? (
                <Card className="p-4">
                  <p className="text-center text-sm text-muted-foreground">
                    Tidak ada data peserta.
                  </p>
                </Card>
              ) : (
                filteredParticipants.map((participant) => (
                  <Card key={participant.id} className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <p className="font-medium text-sm">{participant.employeeName}</p>
                        <p className="text-xs text-muted-foreground">{participant.trainingTitle}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        {participant.score != null && (
                          <span
                            className={`text-sm font-bold ${
                              participant.score >= 90
                                ? "text-green-700"
                                : participant.score >= 70
                                  ? "text-blue-700"
                                  : "text-orange-600"
                            }`}
                          >
                            {participant.score}
                          </span>
                        )}
                        {participant.isPassed == null ? (
                          <Badge variant="outline" className="text-xs text-muted-foreground">
                            -
                          </Badge>
                        ) : participant.isPassed ? (
                          <Badge
                            variant="outline"
                            className="border-0 bg-green-100 text-green-800 text-xs"
                          >
                            Lulus
                          </Badge>
                        ) : (
                          <Badge
                            variant="outline"
                            className="border-0 bg-red-100 text-red-800 text-xs"
                          >
                            Tidak Lulus
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">{participant.departmentName}</span>
                      {renderStars(participant.rating)}
                    </div>
                  </Card>
                ))
              )}
            </div>

            {/* Desktop table view */}
            <div className="hidden md:block">
              <Card className="shadow-sm">
                <CardContent className="px-0">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/50">
                        <TableHead>Nama</TableHead>
                        <TableHead>Departemen</TableHead>
                        <TableHead>Training</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Skor</TableHead>
                        <TableHead>Lulus</TableHead>
                        <TableHead>Rating</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredParticipants.length === 0 ? (
                        <TableRow>
                          <TableCell
                            colSpan={7}
                            className="h-24 text-center text-muted-foreground"
                          >
                            Tidak ada data peserta.
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredParticipants.map((participant) => (
                          <TableRow key={participant.id} className="hover:bg-muted/50">
                            <TableCell className="font-medium">
                              {participant.employeeName}
                            </TableCell>
                            <TableCell>{participant.departmentName}</TableCell>
                            <TableCell>{participant.trainingTitle}</TableCell>
                            <TableCell>
                              <StatusBadge status={participant.status} />
                            </TableCell>
                            <TableCell>
                              {participant.score != null ? (
                                <span
                                  className={
                                    participant.score >= 90
                                      ? "font-semibold text-green-700"
                                      : participant.score >= 70
                                        ? "font-semibold text-blue-700"
                                        : "font-semibold text-orange-600"
                                  }
                                >
                                  {participant.score}
                                </span>
                              ) : (
                                <span className="text-muted-foreground">-</span>
                              )}
                            </TableCell>
                            <TableCell>
                              {participant.isPassed == null ? (
                                <span className="text-muted-foreground">-</span>
                              ) : participant.isPassed ? (
                                <Badge
                                  variant="outline"
                                  className="border-0 bg-green-100 text-green-800"
                                >
                                  Lulus
                                </Badge>
                              ) : (
                                <Badge
                                  variant="outline"
                                  className="border-0 bg-red-100 text-red-800"
                                >
                                  Tidak Lulus
                                </Badge>
                              )}
                            </TableCell>
                            <TableCell>{renderStars(participant.rating)}</TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
