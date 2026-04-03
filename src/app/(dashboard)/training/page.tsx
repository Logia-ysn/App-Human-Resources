"use client";

import { Card, CardContent } from "@/components/ui/card";
import { GraduationCap } from "lucide-react";

export default function TrainingPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-lg sm:text-2xl font-bold tracking-tight">Training</h1>
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16 text-center">
          <GraduationCap className="h-12 w-12 text-muted-foreground/30 mb-4" />
          <p className="text-lg font-semibold">Fitur Training</p>
          <p className="text-sm text-muted-foreground mt-1">
            Modul training sedang dalam proses migrasi ke database.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
