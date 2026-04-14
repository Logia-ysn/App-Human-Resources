"use client";

import {
  ArrowLeft,
  ArrowRight,
  Check,
  User,
  Briefcase,
  CreditCard,
  Contact,
  Landmark,
  MapPin,
  Loader2,
} from "lucide-react";
import type { PtkpStatus } from "@prisma/client";

import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { DateInput } from "@/components/shared/date-input";

const STEPS = [
  { number: 1, label: "Data Pribadi", icon: User },
  { number: 2, label: "Kepegawaian", icon: Briefcase },
  { number: 3, label: "Keuangan & Pajak", icon: CreditCard },
] as const;

const GENDER_OPTIONS = [
  { value: "MALE", label: "Laki-laki" },
  { value: "FEMALE", label: "Perempuan" },
] as const;

const RELIGION_OPTIONS = [
  "Islam",
  "Kristen",
  "Katolik",
  "Hindu",
  "Buddha",
  "Konghucu",
  "Lainnya",
] as const;

const MARITAL_OPTIONS = [
  { value: "SINGLE", label: "Belum Menikah" },
  { value: "MARRIED", label: "Menikah" },
  { value: "DIVORCED", label: "Cerai Hidup" },
  { value: "WIDOWED", label: "Cerai Mati" },
] as const;

const TYPE_OPTIONS = [
  { value: "PERMANENT", label: "Tetap" },
  { value: "CONTRACT", label: "Kontrak" },
  { value: "PROBATION", label: "Probation" },
  { value: "INTERNSHIP", label: "Magang" },
] as const;

export const PTKP_OPTIONS: PtkpStatus[] = [
  "TK0", "TK1", "TK2", "TK3",
  "K0", "K1", "K2", "K3",
  "KI0", "KI1", "KI2", "KI3",
];

const TAX_METHOD_OPTIONS = [
  { value: "GROSS", label: "Gross" },
  { value: "GROSS_UP", label: "Gross Up" },
  { value: "NETT", label: "Nett" },
] as const;

const BANK_OPTIONS = [
  "BCA",
  "Mandiri",
  "BNI",
  "BRI",
  "CIMB Niaga",
  "Danamon",
  "Lainnya",
] as const;

export type EmployeeFormData = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  gender: string;
  dateOfBirth: string;
  placeOfBirth: string;
  religion: string;
  maritalStatus: string;
  dependents: string;
  nik: string;
  address: string;
  city: string;
  province: string;
  postalCode: string;
  emergencyName: string;
  emergencyPhone: string;
  emergencyRelation: string;
  departmentId: string;
  positionId: string;
  managerId: string;
  type: string;
  joinDate: string;
  endDate: string;
  basicSalary: string;
  allowanceTransport: string;
  allowanceMeal: string;
  allowancePosition: string;
  allowanceOther: string;
  npwp: string;
  ptkpStatus: PtkpStatus | "";
  taxMethod: string;
  bpjsKesNumber: string;
  bpjsTkNumber: string;
  bankName: string;
  bankAccountNo: string;
  bankAccountName: string;
};

export const INITIAL_FORM: EmployeeFormData = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  gender: "",
  dateOfBirth: "",
  placeOfBirth: "",
  religion: "",
  maritalStatus: "",
  dependents: "",
  nik: "",
  address: "",
  city: "",
  province: "",
  postalCode: "",
  emergencyName: "",
  emergencyPhone: "",
  emergencyRelation: "",
  departmentId: "",
  positionId: "",
  managerId: "",
  type: "",
  joinDate: "",
  endDate: "",
  basicSalary: "",
  allowanceTransport: "",
  allowanceMeal: "",
  allowancePosition: "",
  allowanceOther: "",
  npwp: "",
  ptkpStatus: "",
  taxMethod: "",
  bpjsKesNumber: "",
  bpjsTkNumber: "",
  bankName: "",
  bankAccountNo: "",
  bankAccountName: "",
};

function formatCurrencyInput(value: string): string {
  const num = value.replace(/\D/g, "");
  if (!num) return "";
  return new Intl.NumberFormat("id-ID").format(Number(num));
}

function SectionHeader({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 mt-0.5">
        <Icon className="size-4 text-primary" />
      </div>
      <div>
        <h3 className="text-base font-semibold">{title}</h3>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}

export function StepIndicator({ currentStep }: { currentStep: number }) {
  return (
    <div className="flex items-center justify-center gap-0 overflow-x-auto">
      {STEPS.map((step, index) => {
        const StepIcon = step.icon;
        const isCompleted = currentStep > step.number;
        const isActive = currentStep === step.number;

        return (
          <div key={step.number} className="flex items-center">
            <div className="flex flex-col items-center gap-1.5 sm:gap-2">
              <div
                className={`flex size-10 items-center justify-center rounded-full border-2 text-sm font-medium transition-all duration-200 ${
                  isCompleted
                    ? "border-primary bg-primary text-primary-foreground shadow-sm"
                    : isActive
                      ? "border-primary bg-primary text-primary-foreground shadow-md ring-4 ring-primary/20"
                      : "border-muted-foreground/30 bg-background text-muted-foreground"
                }`}
              >
                {isCompleted ? (
                  <Check className="size-5" />
                ) : (
                  <StepIcon className="size-4" />
                )}
              </div>
              <span
                className={`hidden text-xs font-medium whitespace-nowrap transition-colors sm:block ${
                  isActive
                    ? "text-primary font-semibold"
                    : isCompleted
                      ? "text-foreground"
                      : "text-muted-foreground"
                }`}
              >
                {step.label}
              </span>
            </div>
            {index < STEPS.length - 1 && (
              <div
                className={`mx-3 mb-0 h-0.5 w-10 rounded-full transition-colors sm:mx-4 sm:mb-6 sm:w-28 ${
                  currentStep > step.number
                    ? "bg-primary"
                    : "bg-muted-foreground/20"
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

type Department = { id: string; name: string; isActive: boolean };
type Position = { id: string; name: string; departmentId: string; isActive: boolean };
type ActiveEmployee = { id: string; firstName: string; lastName: string; position: { name: string } };

interface EmployeeFormProps {
  mode: "new" | "edit";
  form: EmployeeFormData;
  currentStep: number;
  saving: boolean;
  departments: Department[];
  filteredPositions: Position[];
  activeEmployees: ActiveEmployee[];
  showEndDate: boolean;
  handleChange: (field: keyof EmployeeFormData, value: string) => void;
  handleNext: () => void;
  handlePrevious: () => void;
  handleSubmit: () => void;
}

export function EmployeeForm({
  mode,
  form,
  currentStep,
  saving,
  departments,
  filteredPositions,
  activeEmployees,
  showEndDate,
  handleChange,
  handleNext,
  handlePrevious,
  handleSubmit,
}: EmployeeFormProps) {
  return (
    <Card>
      <CardContent className="pt-6">
        {currentStep === 1 && (
          <div className="space-y-6">
            <SectionHeader
              icon={User}
              title="Informasi Dasar"
              description="Data pribadi karyawan"
            />
            <Separator />

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="firstName">Nama Depan</Label>
                <Input
                  id="firstName"
                  placeholder="Nama depan"
                  value={form.firstName}
                  onChange={(e) => handleChange("firstName", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Nama Belakang</Label>
                <Input
                  id="lastName"
                  placeholder="Nama belakang"
                  value={form.lastName}
                  onChange={(e) => handleChange("lastName", e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="email@company.co.id"
                  value={form.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">No. Telepon</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="08xxxxxxxxxx"
                  value={form.phone}
                  onChange={(e) => handleChange("phone", e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Jenis Kelamin</Label>
                <Select
                  value={form.gender}
                  onValueChange={(val) =>
                    val !== null && handleChange("gender", val)
                  }
                  items={GENDER_OPTIONS.map((o) => ({ value: o.value, label: o.label }))}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Pilih jenis kelamin" />
                  </SelectTrigger>
                  <SelectContent>
                    {GENDER_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="nik">NIK (KTP)</Label>
                <Input
                  id="nik"
                  placeholder="16 digit NIK"
                  maxLength={16}
                  value={form.nik}
                  onChange={(e) => handleChange("nik", e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="dateOfBirth">Tanggal Lahir</Label>
                <DateInput
                  id="dateOfBirth"
                  value={form.dateOfBirth}
                  onChange={(v) => handleChange("dateOfBirth", v)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="placeOfBirth">Tempat Lahir</Label>
                <Input
                  id="placeOfBirth"
                  placeholder="Kota tempat lahir"
                  value={form.placeOfBirth}
                  onChange={(e) => handleChange("placeOfBirth", e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div className="space-y-2">
                <Label>Agama</Label>
                <Select
                  value={form.religion}
                  onValueChange={(val) =>
                    val !== null && handleChange("religion", val)
                  }
                  items={RELIGION_OPTIONS.map((r) => ({ value: r, label: r }))}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Pilih agama" />
                  </SelectTrigger>
                  <SelectContent>
                    {RELIGION_OPTIONS.map((r) => (
                      <SelectItem key={r} value={r}>
                        {r}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Status Pernikahan</Label>
                <Select
                  value={form.maritalStatus}
                  onValueChange={(val) =>
                    val !== null && handleChange("maritalStatus", val)
                  }
                  items={MARITAL_OPTIONS.map((o) => ({ value: o.value, label: o.label }))}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Pilih status" />
                  </SelectTrigger>
                  <SelectContent>
                    {MARITAL_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="dependents">Jumlah Tanggungan</Label>
                <Input
                  id="dependents"
                  type="number"
                  min="0"
                  placeholder="0"
                  value={form.dependents}
                  onChange={(e) => handleChange("dependents", e.target.value)}
                />
              </div>
            </div>

            <Separator />

            <SectionHeader
              icon={MapPin}
              title="Alamat"
              description="Alamat tempat tinggal karyawan"
            />

            <div className="space-y-2">
              <Label htmlFor="address">Alamat Lengkap</Label>
              <Textarea
                id="address"
                placeholder="Alamat lengkap"
                value={form.address}
                onChange={(e) => handleChange("address", e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="city">Kota</Label>
                <Input
                  id="city"
                  placeholder="Kota"
                  value={form.city}
                  onChange={(e) => handleChange("city", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="province">Provinsi</Label>
                <Input
                  id="province"
                  placeholder="Provinsi"
                  value={form.province}
                  onChange={(e) => handleChange("province", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="postalCode">Kode Pos</Label>
                <Input
                  id="postalCode"
                  placeholder="Kode pos"
                  value={form.postalCode}
                  onChange={(e) => handleChange("postalCode", e.target.value)}
                />
              </div>
            </div>

            <Separator />

            <SectionHeader
              icon={Contact}
              title="Kontak Darurat"
              description="Informasi kontak darurat karyawan"
            />

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="emergencyName">Nama</Label>
                <Input
                  id="emergencyName"
                  placeholder="Nama kontak darurat"
                  value={form.emergencyName}
                  onChange={(e) => handleChange("emergencyName", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="emergencyPhone">No. Telepon</Label>
                <Input
                  id="emergencyPhone"
                  type="tel"
                  placeholder="08xxxxxxxxxx"
                  value={form.emergencyPhone}
                  onChange={(e) => handleChange("emergencyPhone", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="emergencyRelation">Hubungan</Label>
                <Input
                  id="emergencyRelation"
                  placeholder="Contoh: Istri, Suami, Ayah"
                  value={form.emergencyRelation}
                  onChange={(e) => handleChange("emergencyRelation", e.target.value)}
                />
              </div>
            </div>
          </div>
        )}

        {currentStep === 2 && (
          <div className="space-y-6">
            <SectionHeader
              icon={Briefcase}
              title="Data Kepegawaian"
              description="Informasi jabatan dan penempatan"
            />
            <Separator />

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Departemen</Label>
                <Select
                  value={form.departmentId}
                  onValueChange={(val) =>
                    val !== null && handleChange("departmentId", val)
                  }
                  items={departments
                    .filter((d) => d.isActive)
                    .map((dept) => ({ value: dept.id, label: dept.name }))}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Pilih departemen" />
                  </SelectTrigger>
                  <SelectContent>
                    {departments
                      .filter((d) => d.isActive)
                      .map((dept) => (
                        <SelectItem key={dept.id} value={dept.id}>
                          {dept.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Jabatan</Label>
                <Select
                  value={form.positionId}
                  onValueChange={(val) =>
                    val !== null && handleChange("positionId", val)
                  }
                  disabled={!form.departmentId}
                  items={filteredPositions.map((pos) => ({
                    value: pos.id,
                    label: pos.name,
                  }))}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue
                      placeholder={
                        form.departmentId
                          ? "Pilih jabatan"
                          : "Pilih departemen terlebih dahulu"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredPositions.map((pos) => (
                      <SelectItem key={pos.id} value={pos.id}>
                        {pos.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Atasan Langsung</Label>
                <Select
                  value={form.managerId}
                  onValueChange={(val) =>
                    val !== null && handleChange("managerId", val)
                  }
                  items={activeEmployees.map((emp) => ({
                    value: emp.id,
                    label: `${emp.firstName} ${emp.lastName} - ${emp.position.name}`,
                  }))}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Pilih atasan langsung" />
                  </SelectTrigger>
                  <SelectContent>
                    {activeEmployees.map((emp) => (
                      <SelectItem key={emp.id} value={emp.id}>
                        {emp.firstName} {emp.lastName} - {emp.position.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Status Kepegawaian</Label>
                <Select
                  value={form.type}
                  onValueChange={(val) =>
                    val !== null && handleChange("type", val)
                  }
                  items={TYPE_OPTIONS.map((o) => ({ value: o.value, label: o.label }))}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Pilih status kepegawaian" />
                  </SelectTrigger>
                  <SelectContent>
                    {TYPE_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="joinDate">Tanggal Bergabung</Label>
                <DateInput
                  id="joinDate"
                  value={form.joinDate}
                  onChange={(v) => handleChange("joinDate", v)}
                />
              </div>
              {showEndDate && (
                <div className="space-y-2">
                  <Label htmlFor="endDate">Tanggal Berakhir</Label>
                  <DateInput
                    id="endDate"
                    value={form.endDate}
                    onChange={(v) => handleChange("endDate", v)}
                  />
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="basicSalary">Gaji Pokok</Label>
              <div className="relative">
                <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                  Rp
                </span>
                <Input
                  id="basicSalary"
                  className="pl-8"
                  placeholder="0"
                  value={formatCurrencyInput(form.basicSalary)}
                  onChange={(e) => {
                    const raw = e.target.value.replace(/\D/g, "");
                    handleChange("basicSalary", raw);
                  }}
                />
              </div>
            </div>

            <Separator />

            <SectionHeader
              icon={CreditCard}
              title="Tunjangan"
              description="Tunjangan bulanan karyawan"
            />

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="allowanceTransport">Tunjangan Transport</Label>
                <div className="relative">
                  <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                    Rp
                  </span>
                  <Input
                    id="allowanceTransport"
                    className="pl-8"
                    placeholder="0"
                    value={formatCurrencyInput(form.allowanceTransport)}
                    onChange={(e) => {
                      const raw = e.target.value.replace(/\D/g, "");
                      handleChange("allowanceTransport", raw);
                    }}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="allowanceMeal">Tunjangan Makan</Label>
                <div className="relative">
                  <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                    Rp
                  </span>
                  <Input
                    id="allowanceMeal"
                    className="pl-8"
                    placeholder="0"
                    value={formatCurrencyInput(form.allowanceMeal)}
                    onChange={(e) => {
                      const raw = e.target.value.replace(/\D/g, "");
                      handleChange("allowanceMeal", raw);
                    }}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="allowancePosition">Tunjangan Jabatan</Label>
                <div className="relative">
                  <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                    Rp
                  </span>
                  <Input
                    id="allowancePosition"
                    className="pl-8"
                    placeholder="0"
                    value={formatCurrencyInput(form.allowancePosition)}
                    onChange={(e) => {
                      const raw = e.target.value.replace(/\D/g, "");
                      handleChange("allowancePosition", raw);
                    }}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="allowanceOther">Tunjangan Lainnya</Label>
                <div className="relative">
                  <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                    Rp
                  </span>
                  <Input
                    id="allowanceOther"
                    className="pl-8"
                    placeholder="0"
                    value={formatCurrencyInput(form.allowanceOther)}
                    onChange={(e) => {
                      const raw = e.target.value.replace(/\D/g, "");
                      handleChange("allowanceOther", raw);
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {currentStep === 3 && (
          <div className="space-y-6">
            <SectionHeader
              icon={CreditCard}
              title="Data Keuangan & Pajak"
              description="Informasi pajak, BPJS, dan rekening bank"
            />
            <Separator />

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="npwp">NPWP</Label>
                <Input
                  id="npwp"
                  placeholder="XX.XXX.XXX.X-XXX.XXX"
                  value={form.npwp}
                  onChange={(e) => handleChange("npwp", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Status PTKP</Label>
                <Select
                  value={form.ptkpStatus}
                  onValueChange={(val) =>
                    val !== null && handleChange("ptkpStatus", val)
                  }
                  items={PTKP_OPTIONS.map((o) => ({ value: o, label: o }))}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Pilih status PTKP" />
                  </SelectTrigger>
                  <SelectContent>
                    {PTKP_OPTIONS.map((opt) => (
                      <SelectItem key={opt} value={opt}>
                        {opt}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Metode Pajak</Label>
              <Select
                value={form.taxMethod}
                onValueChange={(val) =>
                  val !== null && handleChange("taxMethod", val)
                }
                items={TAX_METHOD_OPTIONS.map((o) => ({ value: o.value, label: o.label }))}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Pilih metode pajak" />
                </SelectTrigger>
                <SelectContent>
                  {TAX_METHOD_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="bpjsKesNumber">No. BPJS Kesehatan</Label>
                <Input
                  id="bpjsKesNumber"
                  placeholder="Nomor BPJS Kesehatan"
                  value={form.bpjsKesNumber}
                  onChange={(e) => handleChange("bpjsKesNumber", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bpjsTkNumber">No. BPJS Ketenagakerjaan</Label>
                <Input
                  id="bpjsTkNumber"
                  placeholder="Nomor BPJS Ketenagakerjaan"
                  value={form.bpjsTkNumber}
                  onChange={(e) => handleChange("bpjsTkNumber", e.target.value)}
                />
              </div>
            </div>

            <Separator />

            <SectionHeader
              icon={Landmark}
              title="Rekening Bank"
              description="Informasi rekening untuk pembayaran gaji"
            />

            <div className="space-y-2">
              <Label>Nama Bank</Label>
              <Select
                value={form.bankName}
                onValueChange={(val) =>
                  val !== null && handleChange("bankName", val)
                }
                items={BANK_OPTIONS.map((b) => ({ value: b, label: b }))}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Pilih bank" />
                </SelectTrigger>
                <SelectContent>
                  {BANK_OPTIONS.map((bank) => (
                    <SelectItem key={bank} value={bank}>
                      {bank}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="bankAccountNo">Nomor Rekening</Label>
                <Input
                  id="bankAccountNo"
                  placeholder="Nomor rekening"
                  value={form.bankAccountNo}
                  onChange={(e) => handleChange("bankAccountNo", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bankAccountName">Nama Pemilik Rekening</Label>
                <Input
                  id="bankAccountName"
                  placeholder="Sesuai buku tabungan"
                  value={form.bankAccountName}
                  onChange={(e) => handleChange("bankAccountName", e.target.value)}
                />
              </div>
            </div>
          </div>
        )}

        <Separator className="my-6" />

        <div className="sticky bottom-0 bg-card pb-safe flex flex-col gap-3 sm:relative sm:flex-row sm:justify-between">
          <Button
            variant="outline"
            className="w-full sm:w-auto"
            onClick={handlePrevious}
            disabled={currentStep === 1}
          >
            <ArrowLeft data-icon="inline-start" className="size-4" />
            Sebelumnya
          </Button>
          {currentStep < 3 ? (
            <Button className="w-full sm:w-auto" onClick={handleNext}>
              Selanjutnya
              <ArrowRight data-icon="inline-end" className="size-4" />
            </Button>
          ) : (
            <Button className="w-full sm:w-auto" onClick={handleSubmit} disabled={saving}>
              {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Check data-icon="inline-start" className="size-4" />}
              {mode === "new" ? "Simpan Karyawan" : "Simpan Perubahan"}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
