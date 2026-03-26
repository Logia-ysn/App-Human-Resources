"use client";

import { useAppStore } from "@/lib/store/app-store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/shared/status-badge";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import { UserCircle, Briefcase, MapPin, Phone, Mail, Shield } from "lucide-react";

const GENDER_LABEL: Record<string, string> = { MALE: "Laki-laki", FEMALE: "Perempuan" };
const RELIGION_LABEL: Record<string, string> = { ISLAM: "Islam", KRISTEN: "Kristen", KATOLIK: "Katolik", HINDU: "Hindu", BUDDHA: "Buddha", KONGHUCU: "Konghucu", LAINNYA: "Lainnya" };
const MARITAL_LABEL: Record<string, string> = { SINGLE: "Belum Menikah", MARRIED: "Menikah", DIVORCED: "Cerai Hidup", WIDOWED: "Cerai Mati" };

function InfoItem({ label, value }: { label: string; value: string | number | null | undefined }) {
  return (
    <div className="space-y-1">
      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{label}</p>
      <p className="text-sm font-medium text-foreground">{value || "-"}</p>
    </div>
  );
}

export default function EssProfilePage() {
  const employees = useAppStore((s) => s.employees);
  const emp = employees[1];
  const initials = `${emp.firstName[0]}${emp.lastName[0]}`;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
          <UserCircle className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Profil Saya</h1>
          <p className="text-sm text-muted-foreground">Informasi profil dan data kepegawaian Anda</p>
        </div>
      </div>

      <Card className="shadow-sm overflow-hidden">
        <div className="h-24 bg-gradient-to-r from-primary/80 to-primary/40" />
        <CardContent className="relative pt-0 pb-6 px-6">
          <div className="flex items-end gap-5 -mt-10">
            <Avatar className="h-20 w-20 text-2xl border-4 border-background shadow-md">
              <AvatarFallback className="bg-primary text-primary-foreground font-bold">{initials}</AvatarFallback>
            </Avatar>
            <div className="flex-1 pb-1">
              <h2 className="text-xl font-bold">{emp.firstName} {emp.lastName}</h2>
              <p className="text-muted-foreground">{emp.positionName} — {emp.departmentName}</p>
            </div>
            <div className="flex gap-2 pb-1">
              <StatusBadge status={emp.status} />
              <Badge variant="outline" className="font-medium">{emp.type === "PERMANENT" ? "Tetap (PKWTT)" : emp.type}</Badge>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5"><Mail className="h-3.5 w-3.5" />{emp.email}</span>
            <span className="flex items-center gap-1.5"><Phone className="h-3.5 w-3.5" />{emp.phone}</span>
            <span className="flex items-center gap-1.5"><Briefcase className="h-3.5 w-3.5" />{emp.employeeNumber}</span>
            <span className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5" />{emp.city}, {emp.province}</span>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="shadow-sm">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-2">
              <UserCircle className="h-4 w-4 text-primary" />
              <CardTitle className="text-base">Informasi Pribadi</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-5">
            <InfoItem label="NIK" value={emp.nik} />
            <InfoItem label="Tempat, Tgl Lahir" value={`${emp.placeOfBirth}, ${format(new Date(emp.dateOfBirth), "dd MMM yyyy", { locale: idLocale })}`} />
            <InfoItem label="Jenis Kelamin" value={GENDER_LABEL[emp.gender]} />
            <InfoItem label="Agama" value={RELIGION_LABEL[emp.religion]} />
            <InfoItem label="Status Pernikahan" value={MARITAL_LABEL[emp.maritalStatus]} />
            <InfoItem label="Tanggungan" value={emp.dependents} />
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-2">
              <Briefcase className="h-4 w-4 text-primary" />
              <CardTitle className="text-base">Data Kepegawaian</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-5">
            <InfoItem label="No. Karyawan" value={emp.employeeNumber} />
            <InfoItem label="Departemen" value={emp.departmentName} />
            <InfoItem label="Jabatan" value={emp.positionName} />
            <InfoItem label="Atasan" value={emp.managerName} />
            <InfoItem label="Tgl Masuk" value={format(new Date(emp.joinDate), "dd MMM yyyy", { locale: idLocale })} />
            <InfoItem label="Status PTKP" value={emp.ptkpStatus} />
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-primary" />
              <CardTitle className="text-base">Alamat</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-5">
            <InfoItem label="Alamat" value={emp.address} />
            <InfoItem label="Kota" value={emp.city} />
            <InfoItem label="Provinsi" value={emp.province} />
            <InfoItem label="Kode Pos" value={emp.postalCode} />
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-primary" />
              <CardTitle className="text-base">Kontak Darurat</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-5">
            <InfoItem label="Nama" value={emp.emergencyName} />
            <InfoItem label="Telepon" value={emp.emergencyPhone} />
            <InfoItem label="Hubungan" value={emp.emergencyRelation} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
