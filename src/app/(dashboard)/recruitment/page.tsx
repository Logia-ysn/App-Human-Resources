"use client";

import { useState, useMemo } from "react";
import { Briefcase, Users, Plus, Eye, UserPlus, FileText } from "lucide-react";
import { toast } from "sonner";

import {
  jobPostings as initialJobPostings,
  applicants as initialApplicants,
  type JobPostingRecord,
  type ApplicantRecord,
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
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const TYPE_LABELS: Record<string, string> = {
  PERMANENT: "Tetap",
  CONTRACT: "Kontrak",
  INTERNSHIP: "Magang",
};

const APPLICANT_STATUSES: ApplicantRecord["status"][] = [
  "NEW",
  "SCREENING",
  "SHORTLISTED",
  "INTERVIEW",
  "OFFERED",
  "ACCEPTED",
  "REJECTED",
  "WITHDRAWN",
];

const APPLICANT_STATUS_LABELS: Record<string, string> = {
  NEW: "Baru",
  SCREENING: "Screening",
  SHORTLISTED: "Shortlist",
  INTERVIEW: "Interview",
  OFFERED: "Ditawarkan",
  ACCEPTED: "Diterima",
  REJECTED: "Ditolak",
  WITHDRAWN: "Mengundurkan",
};

const DEPARTMENT_OPTIONS = [
  "Information Technology",
  "Human Resources",
  "Finance & Accounting",
  "Marketing",
  "Operations",
  "Sales",
  "Legal & Compliance",
  "General Affairs",
];

const TYPE_OPTIONS: JobPostingRecord["type"][] = [
  "PERMANENT",
  "CONTRACT",
  "INTERNSHIP",
];

const currencyFormat = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

type JobFormData = {
  title: string;
  department: string;
  type: JobPostingRecord["type"];
  location: string;
  vacancies: string;
  salaryMin: string;
  salaryMax: string;
  description: string;
};

const EMPTY_JOB_FORM: JobFormData = {
  title: "",
  department: "",
  type: "PERMANENT",
  location: "",
  vacancies: "1",
  salaryMin: "",
  salaryMax: "",
  description: "",
};

export default function RecruitmentPage() {
  const [jobPostings, setJobPostings] =
    useState<JobPostingRecord[]>(initialJobPostings);
  const [applicantsList, setApplicantsList] =
    useState<ApplicantRecord[]>(initialApplicants);

  const [activeTab, setActiveTab] = useState("lowongan");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [jobForm, setJobForm] = useState<JobFormData>(EMPTY_JOB_FORM);

  // Applicant filter by job posting
  const [applicantJobFilter, setApplicantJobFilter] = useState<string>("ALL");

  // --- Summary counts ---
  const totalJobs = jobPostings.length;
  const publishedJobs = jobPostings.filter(
    (j) => j.status === "PUBLISHED"
  ).length;
  const draftJobs = jobPostings.filter((j) => j.status === "DRAFT").length;
  const closedJobs = jobPostings.filter((j) => j.status === "CLOSED").length;

  // --- Filtered applicants ---
  const filteredApplicants = useMemo(() => {
    if (applicantJobFilter === "ALL") return applicantsList;
    return applicantsList.filter(
      (a) => a.jobPostingId === applicantJobFilter
    );
  }, [applicantsList, applicantJobFilter]);

  // --- Applicant status counts ---
  const applicantStatusCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const status of APPLICANT_STATUSES) {
      counts[status] = filteredApplicants.filter(
        (a) => a.status === status
      ).length;
    }
    return counts;
  }, [filteredApplicants]);

  // --- Job form handlers ---
  function openCreateJob() {
    setJobForm(EMPTY_JOB_FORM);
    setDialogOpen(true);
  }

  function handleJobSubmit() {
    if (!jobForm.title.trim() || !jobForm.department || !jobForm.location.trim()) {
      toast.error("Judul, departemen, dan lokasi wajib diisi");
      return;
    }

    const newJob: JobPostingRecord = {
      id: `job-${Date.now()}`,
      title: jobForm.title.trim(),
      departmentName: jobForm.department,
      positionName: jobForm.title.trim(),
      type: jobForm.type,
      location: jobForm.location.trim(),
      vacancies: Number(jobForm.vacancies) || 1,
      salaryMin: jobForm.salaryMin ? Number(jobForm.salaryMin) : null,
      salaryMax: jobForm.salaryMax ? Number(jobForm.salaryMax) : null,
      showSalary: true,
      status: "DRAFT",
      applicantCount: 0,
      publishedAt: null,
      closingDate: null,
      createdAt: new Date().toISOString().split("T")[0],
    };

    setJobPostings((prev) => [...prev, newJob]);
    setDialogOpen(false);
    toast.success("Lowongan berhasil ditambahkan");
  }

  function handlePublishJob(jobId: string) {
    setJobPostings((prev) =>
      prev.map((j) =>
        j.id === jobId
          ? {
              ...j,
              status: "PUBLISHED" as const,
              publishedAt: new Date().toISOString().split("T")[0],
            }
          : j
      )
    );
    toast.success("Lowongan berhasil dipublikasikan");
  }

  function handleCloseJob(jobId: string) {
    setJobPostings((prev) =>
      prev.map((j) =>
        j.id === jobId
          ? { ...j, status: "CLOSED" as const }
          : j
      )
    );
    toast.success("Lowongan berhasil ditutup");
  }

  function handleViewApplicants(jobId: string) {
    setApplicantJobFilter(jobId);
    setActiveTab("pelamar");
  }

  // --- Applicant status change ---
  function handleApplicantStatusChange(
    applicantId: string,
    newStatus: ApplicantRecord["status"]
  ) {
    setApplicantsList((prev) =>
      prev.map((a) =>
        a.id === applicantId ? { ...a, status: newStatus } : a
      )
    );
    toast.success(`Status pelamar berhasil diubah ke ${APPLICANT_STATUS_LABELS[newStatus]}`);
  }

  function formatSalaryRange(
    min: number | null,
    max: number | null
  ): string {
    if (min == null && max == null) return "-";
    if (min != null && max != null) {
      return `${currencyFormat.format(min)} - ${currencyFormat.format(max)}`;
    }
    if (min != null) return `>= ${currencyFormat.format(min)}`;
    return `<= ${currencyFormat.format(max!)}`;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10">
          <UserPlus className="size-5 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Rekrutmen</h1>
          <p className="text-sm text-muted-foreground">
            Kelola lowongan kerja dan pelamar
          </p>
        </div>
      </div>

      <Tabs
        defaultValue="lowongan"
        value={activeTab}
        onValueChange={(val) => setActiveTab(val as string)}
      >
        <TabsList>
          <TabsTrigger value="lowongan">
            <Briefcase className="size-4" />
            Lowongan Kerja
          </TabsTrigger>
          <TabsTrigger value="pelamar">
            <Users className="size-4" />
            Pelamar
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: Lowongan Kerja */}
        <TabsContent value="lowongan">
          <div className="space-y-6">
            {/* Summary cards */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Card className="shadow-sm border-l-4 border-l-blue-500">
                <CardContent>
                  <div className="flex items-center gap-3">
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-blue-100">
                      <Briefcase className="size-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Total Lowongan</p>
                      <p className="text-2xl font-bold">{totalJobs}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="shadow-sm border-l-4 border-l-green-500">
                <CardContent>
                  <div className="flex items-center gap-3">
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-green-100">
                      <Eye className="size-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Dipublikasi</p>
                      <p className="text-2xl font-bold">{publishedJobs}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="shadow-sm border-l-4 border-l-gray-400">
                <CardContent>
                  <div className="flex items-center gap-3">
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-gray-100">
                      <FileText className="size-5 text-gray-500" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Draft</p>
                      <p className="text-2xl font-bold">{draftJobs}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="shadow-sm border-l-4 border-l-red-400">
                <CardContent>
                  <div className="flex items-center gap-3">
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-red-100">
                      <Briefcase className="size-5 text-red-500" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Ditutup</p>
                      <p className="text-2xl font-bold">{closedJobs}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Job Postings Table */}
            <Card className="shadow-sm">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Daftar Lowongan</CardTitle>
                  <Button onClick={openCreateJob}>
                    <Plus className="size-4" data-icon="inline-start" />
                    Tambah Lowongan
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="px-0">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead>Judul</TableHead>
                      <TableHead>Departemen</TableHead>
                      <TableHead>Tipe</TableHead>
                      <TableHead>Lokasi</TableHead>
                      <TableHead className="text-center">Lowongan</TableHead>
                      <TableHead className="text-center">Pelamar</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {jobPostings.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={8}
                          className="h-24 text-center text-muted-foreground"
                        >
                          Tidak ada data lowongan.
                        </TableCell>
                      </TableRow>
                    ) : (
                      jobPostings.map((job) => (
                        <TableRow key={job.id} className="hover:bg-muted/50">
                          <TableCell className="font-medium">
                            {job.title}
                          </TableCell>
                          <TableCell>{job.departmentName}</TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {TYPE_LABELS[job.type] ?? job.type}
                            </Badge>
                          </TableCell>
                          <TableCell>{job.location}</TableCell>
                          <TableCell className="text-center">
                            {job.vacancies}
                          </TableCell>
                          <TableCell className="text-center">
                            {job.applicantCount}
                          </TableCell>
                          <TableCell>
                            <StatusBadge status={job.status} />
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-1">
                              <Button
                                variant="ghost"
                                size="icon-xs"
                                onClick={() => handleViewApplicants(job.id)}
                                title="Lihat Pelamar"
                              >
                                <Eye className="size-4" />
                                <span className="sr-only">Lihat Pelamar</span>
                              </Button>
                              {job.status === "DRAFT" && (
                                <Button
                                  variant="outline"
                                  size="xs"
                                  onClick={() => handlePublishJob(job.id)}
                                >
                                  Publish
                                </Button>
                              )}
                              {job.status === "PUBLISHED" && (
                                <Button
                                  variant="outline"
                                  size="xs"
                                  onClick={() => handleCloseJob(job.id)}
                                >
                                  Tutup
                                </Button>
                              )}
                            </div>
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

        {/* Tab 2: Pelamar */}
        <TabsContent value="pelamar">
          <div className="space-y-6">
            {/* Status pipeline badges */}
            <Card className="shadow-sm">
              <CardContent>
                <div className="flex flex-wrap items-center gap-2">
                  {APPLICANT_STATUSES.map((status) => {
                    const colorMap: Record<string, string> = {
                      NEW: "bg-blue-100 text-blue-800 border-blue-200",
                      SCREENING: "bg-yellow-100 text-yellow-800 border-yellow-200",
                      SHORTLISTED: "bg-indigo-100 text-indigo-800 border-indigo-200",
                      INTERVIEW: "bg-purple-100 text-purple-800 border-purple-200",
                      OFFERED: "bg-cyan-100 text-cyan-800 border-cyan-200",
                      ACCEPTED: "bg-green-100 text-green-800 border-green-200",
                      REJECTED: "bg-red-100 text-red-800 border-red-200",
                      WITHDRAWN: "bg-gray-100 text-gray-800 border-gray-200",
                    };
                    return (
                      <Badge
                        key={status}
                        variant="outline"
                        className={`gap-1.5 px-3 py-1.5 ${colorMap[status] ?? ""}`}
                      >
                        {APPLICANT_STATUS_LABELS[status]}
                        <span className="rounded-full bg-white/60 px-1.5 py-0.5 text-xs font-bold">
                          {applicantStatusCounts[status] ?? 0}
                        </span>
                      </Badge>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Applicants Table */}
            <Card className="shadow-sm">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Daftar Pelamar</CardTitle>
                  <Select
                    value={applicantJobFilter}
                    onValueChange={(val) =>
                      setApplicantJobFilter((val as string) ?? "ALL")
                    }
                  >
                    <SelectTrigger className="w-[260px]">
                      <SelectValue placeholder="Semua Lowongan" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ALL">Semua Lowongan</SelectItem>
                      {jobPostings.map((job) => (
                        <SelectItem key={job.id} value={job.id}>
                          {job.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent className="px-0">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead>Nama</TableHead>
                      <TableHead>Posisi Dilamar</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Sumber</TableHead>
                      <TableHead className="text-center">Pengalaman</TableHead>
                      <TableHead>Gaji Harapan</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredApplicants.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={8}
                          className="h-24 text-center text-muted-foreground"
                        >
                          Tidak ada data pelamar.
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredApplicants.map((applicant) => (
                        <TableRow key={applicant.id} className="hover:bg-muted/50">
                          <TableCell className="font-medium">
                            {applicant.name}
                          </TableCell>
                          <TableCell>{applicant.jobTitle}</TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {applicant.email}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{applicant.source}</Badge>
                          </TableCell>
                          <TableCell className="text-center">
                            {applicant.yearsExperience} thn
                          </TableCell>
                          <TableCell>
                            {applicant.expectedSalary != null
                              ? currencyFormat.format(applicant.expectedSalary)
                              : "-"}
                          </TableCell>
                          <TableCell>
                            <StatusBadge status={applicant.status} />
                          </TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger
                                render={
                                  <Button variant="outline" size="xs" />
                                }
                              >
                                Ubah Status
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuLabel>
                                  Ubah Status
                                </DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                {APPLICANT_STATUSES.filter(
                                  (s) => s !== applicant.status
                                ).map((status) => (
                                  <DropdownMenuItem
                                    key={status}
                                    onClick={() =>
                                      handleApplicantStatusChange(
                                        applicant.id,
                                        status
                                      )
                                    }
                                  >
                                    {APPLICANT_STATUS_LABELS[status]}
                                  </DropdownMenuItem>
                                ))}
                              </DropdownMenuContent>
                            </DropdownMenu>
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
      </Tabs>

      {/* Add Job Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Tambah Lowongan</DialogTitle>
            <DialogDescription>
              Isi data lowongan kerja baru.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4">
            <div className="space-y-2">
              <Label htmlFor="job-title">Judul Lowongan</Label>
              <Input
                id="job-title"
                placeholder="Contoh: Senior Software Developer"
                value={jobForm.title}
                onChange={(e) =>
                  setJobForm((prev) => ({ ...prev, title: e.target.value }))
                }
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Departemen</Label>
                <Select
                  value={jobForm.department || undefined}
                  onValueChange={(val) =>
                    setJobForm((prev) => ({
                      ...prev,
                      department: val as string,
                    }))
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Pilih departemen" />
                  </SelectTrigger>
                  <SelectContent>
                    {DEPARTMENT_OPTIONS.map((dept) => (
                      <SelectItem key={dept} value={dept}>
                        {dept}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Tipe</Label>
                <Select
                  value={jobForm.type}
                  onValueChange={(val) =>
                    setJobForm((prev) => ({
                      ...prev,
                      type: val as JobPostingRecord["type"],
                    }))
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Pilih tipe" />
                  </SelectTrigger>
                  <SelectContent>
                    {TYPE_OPTIONS.map((t) => (
                      <SelectItem key={t} value={t}>
                        {TYPE_LABELS[t]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="job-location">Lokasi</Label>
                <Input
                  id="job-location"
                  placeholder="Contoh: Jakarta Selatan"
                  value={jobForm.location}
                  onChange={(e) =>
                    setJobForm((prev) => ({
                      ...prev,
                      location: e.target.value,
                    }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="job-vacancies">Jumlah Lowongan</Label>
                <Input
                  id="job-vacancies"
                  type="number"
                  min="1"
                  placeholder="1"
                  value={jobForm.vacancies}
                  onChange={(e) =>
                    setJobForm((prev) => ({
                      ...prev,
                      vacancies: e.target.value,
                    }))
                  }
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="job-salary-min">Gaji Minimum</Label>
                <Input
                  id="job-salary-min"
                  type="number"
                  placeholder="0"
                  value={jobForm.salaryMin}
                  onChange={(e) =>
                    setJobForm((prev) => ({
                      ...prev,
                      salaryMin: e.target.value,
                    }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="job-salary-max">Gaji Maksimum</Label>
                <Input
                  id="job-salary-max"
                  type="number"
                  placeholder="0"
                  value={jobForm.salaryMax}
                  onChange={(e) =>
                    setJobForm((prev) => ({
                      ...prev,
                      salaryMax: e.target.value,
                    }))
                  }
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="job-desc">Deskripsi</Label>
              <Textarea
                id="job-desc"
                placeholder="Deskripsi lowongan..."
                value={jobForm.description}
                onChange={(e) =>
                  setJobForm((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Batal
            </Button>
            <Button onClick={handleJobSubmit}>Tambah</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
