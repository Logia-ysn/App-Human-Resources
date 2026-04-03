"use client";

import { useAuth } from "@/components/providers/auth-context";
import { Card, CardContent } from "@/components/ui/card";
import { Clock } from "lucide-react";

export default function EssShiftsPage() {
  const { employeeId } = useAuth();

  if (!employeeId) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center space-y-2">
          <Clock className="h-12 w-12 text-muted-foreground/40 mx-auto" />
          <p className="text-lg font-medium">Data karyawan tidak ditemukan</p>
          <p className="text-sm text-muted-foreground">
            Akun Anda belum terhubung dengan data karyawan.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-lg sm:text-2xl font-bold tracking-tight">Jadwal Shift Saya</h1>
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16 text-center">
          <Clock className="h-12 w-12 text-muted-foreground/30 mb-4" />
          <p className="text-lg font-semibold">Fitur Jadwal Shift</p>
          <p className="text-sm text-muted-foreground mt-1">
            Modul shift sedang dalam proses migrasi ke database.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
