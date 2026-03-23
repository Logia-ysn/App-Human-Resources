"use client";

import { trainingParticipants, CATEGORY_LABELS } from "@/lib/dummy-data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/shared/status-badge";
import { GraduationCap, Star } from "lucide-react";

const PARTICIPANT_STATUS_MAP: Record<string, string> = {
  REGISTERED: "PENDING",
  ATTENDED: "ACTIVE",
  COMPLETED_TRAINING: "APPROVED",
  ABSENT: "REJECTED",
};

export default function EssTrainingPage() {
  // Demo: emp-4 (Dewi Lestari) - has multiple trainings
  const myTrainings = trainingParticipants.filter((t) => t.employeeId === "emp-4");

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">Training Saya</h1>

      {myTrainings.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">Belum ada training yang diikuti.</CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <GraduationCap className="h-5 w-5 text-muted-foreground" />
              <CardTitle>Daftar Training</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Training</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Skor</TableHead>
                  <TableHead>Lulus</TableHead>
                  <TableHead>Rating</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {myTrainings.map((t) => (
                  <TableRow key={t.id}>
                    <TableCell className="font-medium">{t.trainingTitle}</TableCell>
                    <TableCell><StatusBadge status={PARTICIPANT_STATUS_MAP[t.status] || t.status} /></TableCell>
                    <TableCell>{t.score ?? "-"}</TableCell>
                    <TableCell>{t.isPassed === null ? "-" : t.isPassed ? <Badge className="bg-green-100 text-green-800 border-0">Lulus</Badge> : <Badge className="bg-red-100 text-red-800 border-0">Tidak Lulus</Badge>}</TableCell>
                    <TableCell>
                      {t.rating ? (
                        <div className="flex items-center gap-1">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star key={i} className={`h-3 w-3 ${i < t.rating! ? "text-yellow-500 fill-yellow-500" : "text-gray-300"}`} />
                          ))}
                        </div>
                      ) : "-"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
