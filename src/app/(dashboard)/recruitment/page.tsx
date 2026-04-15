"use client";

import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import { Briefcase, Users, MapPin, Calendar } from "lucide-react";

import { useJobPostings, useApplicants } from "@/hooks/use-recruitment";
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

const TYPE_LABELS: Record<string, string> = {
  PERMANENT: "Tetap",
  CONTRACT: "Kontrak",
  PROBATION: "Probation",
  INTERNSHIP: "Magang",
};

function formatCurrency(amount: string | number): string {
  const num = typeof amount === "string" ? Number(amount) : amount;
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(num || 0);
}

export default function RecruitmentPage() {
  const { postings, isLoading: postingsLoading } = useJobPostings();
  const { applicants, isLoading: applicantsLoading } = useApplicants();

  if (postingsLoading || applicantsLoading) {
    return (
      <LoadingState />
    );
  }

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex items-center gap-2.5 border-b border-border pb-4">
        <Briefcase className="size-5 text-muted-foreground" strokeWidth={1.75} />
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Rekrutmen</h1>
          <p className="text-xs text-muted-foreground">
            Lowongan kerja dan pelamar
          </p>
        </div>
      </div>

      <Tabs defaultValue="postings">
        <TabsList>
          <TabsTrigger value="postings">Lowongan ({postings.length})</TabsTrigger>
          <TabsTrigger value="applicants">Pelamar ({applicants.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="postings">
          <div className="grid gap-4 md:grid-cols-2">
            {postings.length === 0 ? (
              <Card className="md:col-span-2">
                <CardContent className="p-0">
                  <EmptyState
                    icon={Briefcase}
                    title="Belum ada lowongan kerja"
                    description="Lowongan yang dibuka akan muncul di sini."
                  />
                </CardContent>
              </Card>
            ) : (
              postings.map((p) => (
                <Card key={p.id} className="transition-colors hover:bg-muted/40">
                  <CardHeader>
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <CardTitle className="text-base">{p.title}</CardTitle>
                        <p className="text-sm text-muted-foreground mt-1">
                          {p.department.name} • {p.position.name}
                        </p>
                      </div>
                      <StatusBadge status={p.status} />
                    </div>
                    <div className="flex flex-wrap gap-1 mt-2">
                      <Badge variant="outline" className="text-xs">
                        {TYPE_LABELS[p.type] ?? p.type}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {p.vacancies} posisi
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <MapPin className="h-3.5 w-3.5" />
                      {p.location}
                    </div>
                    {p.closingDate && (
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Calendar className="h-3.5 w-3.5" />
                        Tutup: {format(new Date(p.closingDate), "dd MMM yyyy", { locale: idLocale })}
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Users className="h-3.5 w-3.5" />
                      {p._count.applicants} pelamar
                    </div>
                    {p.showSalary && (p.salaryMin || p.salaryMax) && (
                      <div className="text-xs pt-2 border-t">
                        <span className="text-muted-foreground">Gaji: </span>
                        <span className="font-semibold">
                          {p.salaryMin && formatCurrency(p.salaryMin)}
                          {p.salaryMin && p.salaryMax && " – "}
                          {p.salaryMax && formatCurrency(p.salaryMax)}
                        </span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="applicants">
          <Card>
            <CardHeader>
              <CardTitle>Daftar Pelamar</CardTitle>
            </CardHeader>
            <CardContent className="px-0">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead>Nama</TableHead>
                    <TableHead>Lowongan</TableHead>
                    <TableHead>Email / HP</TableHead>
                    <TableHead className="text-center">Pengalaman</TableHead>
                    <TableHead>Interview</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {applicants.length === 0 ? (
                    <EmptyRow colSpan={6}>Belum ada pelamar.</EmptyRow>
                  ) : (
                    applicants.map((a) => (
                      <TableRow key={a.id} className="hover:bg-muted/50">
                        <TableCell className="font-medium">
                          {a.name}
                          {a.currentCompany && (
                            <div className="text-xs text-muted-foreground">
                              {a.currentCompany}
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="line-clamp-1 max-w-[240px]">{a.jobPosting.title}</div>
                          <div className="text-xs text-muted-foreground">
                            {a.jobPosting.department.name}
                          </div>
                        </TableCell>
                        <TableCell className="text-sm">
                          {a.email}
                          <div className="text-xs text-muted-foreground">{a.phone}</div>
                        </TableCell>
                        <TableCell className="text-center">
                          {a.yearsExperience != null ? `${a.yearsExperience} thn` : "-"}
                        </TableCell>
                        <TableCell>
                          {a.interviews[0] ? (
                            <div className="text-xs">
                              Round {a.interviews[0].round}
                              <div className="text-muted-foreground">
                                {format(new Date(a.interviews[0].scheduledAt), "dd MMM", {
                                  locale: idLocale,
                                })}
                              </div>
                            </div>
                          ) : (
                            <span className="text-xs text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <StatusBadge status={a.status} />
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
