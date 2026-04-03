"use client";

import { Card, CardContent } from "@/components/ui/card";
import { BarChart3 } from "lucide-react";

export default function PerformancePage() {
  return (
    <div className="space-y-6">
      <h1 className="text-lg sm:text-2xl font-bold tracking-tight">Penilaian Kinerja</h1>
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16 text-center">
          <BarChart3 className="h-12 w-12 text-muted-foreground/30 mb-4" />
          <p className="text-lg font-semibold">Fitur Penilaian Kinerja</p>
          <p className="text-sm text-muted-foreground mt-1">
            Modul performance review sedang dalam proses migrasi ke database.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
