"use client";

import { useMemo } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import {
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  Building2,
  Briefcase,
  Calendar,
  User,
  CreditCard,
  Shield,
  Landmark,
  Contact,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { employees } from "@/lib/dummy-data";
import { StatusBadge } from "@/components/shared/status-badge";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button, buttonVariants } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

const GENDER_LABELS: Record<string, string> = {
  MALE: "Laki-laki",
  FEMALE: "Perempuan",
};

const RELIGION_LABELS: Record<string, string> = {
  ISLAM: "Islam",
  KRISTEN: "Kristen",
  KATOLIK: "Katolik",
  HINDU: "Hindu",
  BUDDHA: "Buddha",
  KONGHUCU: "Konghucu",
  LAINNYA: "Lainnya",
};

const MARITAL_STATUS_LABELS: Record<string, string> = {
  SINGLE: "Belum Menikah",
  MARRIED: "Menikah",
  DIVORCED: "Cerai Hidup",
  WIDOWED: "Cerai Mati",
};

const TYPE_LABELS: Record<string, string> = {
  PERMANENT: "Tetap (PKWTT)",
  CONTRACT: "Kontrak (PKWT)",
  PROBATION: "Probation",
  INTERNSHIP: "Magang",
};

const PTKP_LABELS: Record<string, string> = {
  TK0: "TK/0 - Belum Kawin, 0 Tanggungan",
  TK1: "TK/1 - Belum Kawin, 1 Tanggungan",
  TK2: "TK/2 - Belum Kawin, 2 Tanggungan",
  TK3: "TK/3 - Belum Kawin, 3 Tanggungan",
  K0: "K/0 - Kawin, 0 Tanggungan",
  K1: "K/1 - Kawin, 1 Tanggungan",
  K2: "K/2 - Kawin, 2 Tanggungan",
  K3: "K/3 - Kawin, 3 Tanggungan",
  KI0: "K/I/0 - Kawin, Penghasilan Istri Digabung, 0",
  KI1: "K/I/1 - Kawin, Penghasilan Istri Digabung, 1",
  KI2: "K/I/2 - Kawin, Penghasilan Istri Digabung, 2",
  KI3: "K/I/3 - Kawin, Penghasilan Istri Digabung, 3",
};

const TAX_METHOD_LABELS: Record<string, string> = {
  GROSS: "Gross",
  GROSS_UP: "Gross Up",
  NETT: "Nett",
};

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
}

function formatDate(dateStr: string): string {
  return format(new Date(dateStr), "dd MMMM yyyy", { locale: idLocale });
}

function getInitials(firstName: string, lastName: string): string {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
}

function InfoItem({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div className="space-y-0.5 sm:space-y-1">
      <p className="text-xs text-muted-foreground sm:text-sm">{label}</p>
      <p className="text-sm font-medium">{value || "-"}</p>
    </div>
  );
}

function SectionHeader({
  icon: Icon,
  title,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <Icon className="size-4 text-primary" />
      <h3 className="text-sm font-semibold">{title}</h3>
    </div>
  );
}

export default function EmployeeDetailPage() {
  const params = useParams<{ id: string }>();

  const employee = useMemo(
    () => employees.find((emp) => emp.id === params.id && !emp.isDeleted),
    [params.id],
  );

  if (!employee) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-20">
        <h2 className="text-xl font-semibold">Karyawan tidak ditemukan</h2>
        <p className="text-muted-foreground">
          Data karyawan dengan ID tersebut tidak ditemukan atau telah dihapus.
        </p>
        <Link href="/employees" className={cn(buttonVariants({ variant: "outline" }))}>
          <ArrowLeft data-icon="inline-start" />
          Kembali ke Data Karyawan
        </Link>
      </div>
    );
  }

  const fullName = `${employee.firstName} ${employee.lastName}`;

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Back button */}
      <Link href="/employees" className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}>
        <ArrowLeft data-icon="inline-start" />
        Kembali
      </Link>

      {/* Profile header with gradient banner */}
      <Card className="overflow-hidden">
        <div className="h-20 bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-500 sm:h-28" />
        <CardContent className="relative pb-6">
          {/* Mobile: centered avatar + stacked layout */}
          <div className="-mt-10 mb-3 flex flex-col items-center sm:-mt-14 sm:mb-4 sm:flex-row sm:items-end sm:gap-4">
            <Avatar className="size-20 border-4 border-background shadow-lg sm:size-24">
              <AvatarFallback className="text-xl font-semibold bg-primary text-primary-foreground sm:text-2xl">
                {getInitials(employee.firstName, employee.lastName)}
              </AvatarFallback>
            </Avatar>

            {/* Desktop: name beside avatar */}
            <div className="hidden sm:block sm:pb-1">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-2xl font-bold tracking-tight">{fullName}</h1>
                <StatusBadge status={employee.status} />
                <Badge variant="outline">{TYPE_LABELS[employee.type] ?? employee.type}</Badge>
              </div>
              <p className="mt-0.5 text-xs text-muted-foreground font-mono">
                {employee.employeeNumber}
              </p>
            </div>
          </div>

          {/* Mobile: centered name + badges */}
          <div className="flex flex-col items-center text-center sm:hidden">
            <h1 className="text-xl font-bold tracking-tight">{fullName}</h1>
            <div className="mt-1.5 flex flex-wrap items-center justify-center gap-1.5">
              <StatusBadge status={employee.status} />
              <Badge variant="outline">{TYPE_LABELS[employee.type] ?? employee.type}</Badge>
            </div>
            <p className="mt-1 text-xs text-muted-foreground font-mono">
              {employee.employeeNumber}
            </p>
          </div>

          {/* Contact info row */}
          <div className="mt-3 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-sm text-muted-foreground sm:justify-start sm:gap-x-5">
            <span className="flex items-center gap-1.5">
              <Briefcase className="size-4" />
              {employee.positionName}
            </span>
            <span className="flex items-center gap-1.5">
              <Building2 className="size-4" />
              {employee.departmentName}
            </span>
            <span className="flex items-center gap-1.5">
              <Mail className="size-4" />
              <span className="truncate max-w-[180px] sm:max-w-none">{employee.email}</span>
            </span>
            <span className="flex items-center gap-1.5">
              <Phone className="size-4" />
              {employee.phone}
            </span>
          </div>

          {/* Quick info pills - scrollable on mobile */}
          <div className="mt-4 -mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
            <div className="flex gap-2 sm:flex-wrap">
              <Badge variant="secondary" className="shrink-0 gap-1.5 px-3 py-1 text-xs font-normal">
                <Calendar className="size-3" />
                Bergabung {format(new Date(employee.joinDate), "dd MMM yyyy", { locale: idLocale })}
              </Badge>
              <Badge variant="secondary" className="shrink-0 gap-1.5 px-3 py-1 text-xs font-normal">
                <Building2 className="size-3" />
                {employee.departmentName}
              </Badge>
              <Badge variant="secondary" className="shrink-0 gap-1.5 px-3 py-1 text-xs font-normal">
                <Briefcase className="size-3" />
                {employee.positionName}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="pribadi">
        <TabsList className="w-full sm:w-auto">
          <TabsTrigger value="pribadi" className="flex-1 sm:flex-initial">Informasi Pribadi</TabsTrigger>
          <TabsTrigger value="kepegawaian" className="flex-1 sm:flex-initial">Kepegawaian</TabsTrigger>
          <TabsTrigger value="keuangan" className="flex-1 sm:flex-initial">Keuangan & Pajak</TabsTrigger>
        </TabsList>

        {/* Tab: Informasi Pribadi */}
        <TabsContent value="pribadi">
          <Card>
            <CardHeader>
              <CardTitle>Informasi Pribadi</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <SectionHeader icon={User} title="Data Diri" />
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6">
                <InfoItem label="NIK" value={employee.nik} />
                <InfoItem
                  label="Tempat / Tanggal Lahir"
                  value={`${employee.placeOfBirth}, ${formatDate(employee.dateOfBirth)}`}
                />
                <InfoItem label="Jenis Kelamin" value={GENDER_LABELS[employee.gender]} />
                <InfoItem label="Agama" value={RELIGION_LABELS[employee.religion] ?? employee.religion} />
                <InfoItem label="Status Pernikahan" value={MARITAL_STATUS_LABELS[employee.maritalStatus]} />
                <InfoItem label="Jumlah Tanggungan" value={String(employee.dependents)} />
              </div>

              <Separator />

              <SectionHeader icon={MapPin} title="Alamat & Kontak" />
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6">
                <InfoItem label="Alamat" value={employee.address} />
                <InfoItem label="Kota" value={employee.city} />
                <InfoItem label="Provinsi" value={employee.province} />
                <InfoItem label="No. HP" value={employee.phone} />
                <InfoItem label="Email" value={employee.email} />
              </div>

              <Separator />

              <SectionHeader icon={Contact} title="Kontak Darurat" />
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6">
                <InfoItem label="Nama" value={employee.emergencyName} />
                <InfoItem label="No. Telepon" value={employee.emergencyPhone} />
                <InfoItem label="Hubungan" value={employee.emergencyRelation} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Kepegawaian */}
        <TabsContent value="kepegawaian">
          <Card>
            <CardHeader>
              <CardTitle>Informasi Kepegawaian</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <SectionHeader icon={Briefcase} title="Jabatan & Penempatan" />
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6">
                <InfoItem label="No. Karyawan" value={employee.employeeNumber} />
                <InfoItem label="Departemen" value={employee.departmentName} />
                <InfoItem label="Jabatan" value={employee.positionName} />
                <InfoItem label="Atasan Langsung" value={employee.managerName ?? "-"} />
                <InfoItem label="Status" value={employee.status} />
                <InfoItem label="Tipe Kepegawaian" value={TYPE_LABELS[employee.type] ?? employee.type} />
                <InfoItem label="Tanggal Masuk" value={formatDate(employee.joinDate)} />
                <InfoItem
                  label="Tanggal Berakhir Kontrak"
                  value={employee.endDate ? formatDate(employee.endDate) : "-"}
                />
              </div>

              <Separator />

              <SectionHeader icon={CreditCard} title="Pajak & Gaji" />
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6">
                <InfoItem label="Status PTKP" value={PTKP_LABELS[employee.ptkpStatus] ?? employee.ptkpStatus} />
                <InfoItem label="Metode Pajak" value={TAX_METHOD_LABELS[employee.taxMethod] ?? employee.taxMethod} />
                <InfoItem label="Gaji Pokok" value={formatCurrency(employee.basicSalary)} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Keuangan & Pajak */}
        <TabsContent value="keuangan">
          <Card>
            <CardHeader>
              <CardTitle>Keuangan & Pajak</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <SectionHeader icon={Shield} title="NPWP & BPJS" />
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6">
                <InfoItem label="NPWP" value={employee.npwp || "-"} />
                <InfoItem label="BPJS Kesehatan" value={employee.bpjsKesNumber} />
                <InfoItem label="BPJS Ketenagakerjaan" value={employee.bpjsTkNumber} />
              </div>

              <Separator />

              <SectionHeader icon={Landmark} title="Informasi Rekening" />
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6">
                <InfoItem label="Bank" value={employee.bankName} />
                <InfoItem label="No. Rekening" value={employee.bankAccountNo} />
                <InfoItem label="Atas Nama" value={employee.bankAccountName} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
