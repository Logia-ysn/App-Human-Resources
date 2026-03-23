"use client";

import { performanceReviews, RATING_LABELS, REVIEW_STATUS_LABELS } from "@/lib/dummy-data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { BarChart3 } from "lucide-react";

const RATING_COLORS: Record<string, string> = {
  OUTSTANDING: "bg-green-100 text-green-800",
  EXCEEDS_EXPECTATIONS: "bg-blue-100 text-blue-800",
  MEETS_EXPECTATIONS: "bg-yellow-100 text-yellow-800",
  BELOW_EXPECTATIONS: "bg-orange-100 text-orange-800",
  UNSATISFACTORY: "bg-red-100 text-red-800",
};

export default function EssPerformancePage() {
  // Demo: emp-2 (Sari Dewi)
  const myReviews = performanceReviews.filter((r) => r.employeeId === "emp-2");

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">Penilaian Kinerja Saya</h1>

      {myReviews.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">Belum ada penilaian kinerja.</CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {myReviews.map((r) => (
            <Card key={r.id}>
              <CardHeader className="flex flex-row items-center justify-between">
                <div className="flex items-center gap-3">
                  <BarChart3 className="h-5 w-5 text-muted-foreground" />
                  <CardTitle className="text-base">{r.cycleName}</CardTitle>
                </div>
                <Badge variant="outline" className={r.rating ? RATING_COLORS[r.rating] : ""}>{r.rating ? RATING_LABELS[r.rating] : REVIEW_STATUS_LABELS[r.status]}</Badge>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div><p className="text-xs text-muted-foreground">Status</p><p className="text-sm font-medium">{REVIEW_STATUS_LABELS[r.status]}</p></div>
                  <div><p className="text-xs text-muted-foreground">Self Score</p><p className="text-sm font-semibold">{r.selfScore ?? "-"}</p></div>
                  <div><p className="text-xs text-muted-foreground">Manager Score</p><p className="text-sm font-semibold">{r.managerScore ?? "-"}</p></div>
                  <div><p className="text-xs text-muted-foreground">Final Score</p><p className="text-lg font-bold">{r.finalScore ?? "-"}</p></div>
                </div>
                <p className="mt-3 text-xs text-muted-foreground">Reviewer: {r.reviewerName}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
