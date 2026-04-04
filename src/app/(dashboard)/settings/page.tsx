"use client";

import { useState, useRef } from "react";
import { toast } from "sonner";
import { useCompany, useUpdateCompany, useAppConfig, useUpdateAppConfig } from "@/hooks/use-settings";
import type { AppConfigData } from "@/hooks/use-settings";
import type { Company } from "@prisma/client";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
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
import { Separator } from "@/components/ui/separator";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Building2,
  Wallet,
  Clock,
  CalendarDays,
  ClipboardList,
  Settings,
  ImagePlus,
  X,
  Loader2,
  Trash2,
  RotateCcw,
  Database,
  AlertTriangle,
} from "lucide-react";

// ---------- Constants ----------

const provinces = [
  "Aceh", "Bali", "Banten", "Bengkulu", "DI Yogyakarta", "DKI Jakarta",
  "Gorontalo", "Jambi", "Jawa Barat", "Jawa Tengah", "Jawa Timur",
  "Kalimantan Barat", "Kalimantan Selatan", "Kalimantan Tengah",
  "Kalimantan Timur", "Kalimantan Utara", "Kepulauan Bangka Belitung",
  "Kepulauan Riau", "Lampung", "Maluku", "Maluku Utara",
  "Nusa Tenggara Barat", "Nusa Tenggara Timur", "Papua", "Papua Barat",
  "Riau", "Sulawesi Barat", "Sulawesi Selatan", "Sulawesi Tengah",
  "Sulawesi Tenggara", "Sulawesi Utara", "Sumatera Barat",
  "Sumatera Selatan", "Sumatera Utara",
];

const WORK_DAYS_LABELS: { value: number; label: string }[] = [
  { value: 1, label: "Sen" },
  { value: 2, label: "Sel" },
  { value: 3, label: "Rab" },
  { value: 4, label: "Kam" },
  { value: 5, label: "Jum" },
  { value: 6, label: "Sab" },
  { value: 0, label: "Min" },
];

// ---------- Utilities ----------

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

function parseCurrency(value: string): number {
  const cleaned = value.replace(/[^\d]/g, "");
  return cleaned === "" ? 0 : parseInt(cleaned, 10);
}

// ---------- Payroll form helpers ----------

type PayrollConfigForm = {
  bpjsKesCompanyRate: string;
  bpjsKesEmployeeRate: string;
  bpjsKesCap: number;
  bpjsTkJhtRate: string;
  bpjsTkJkkRate: string;
  bpjsTkJkmRate: string;
  bpjsTkJpRate: string;
  bpjsTkJpCap: number;
  pph21NonTaxableIncome: number;
};

function configToForm(config: AppConfigData): PayrollConfigForm {
  return {
    bpjsKesCompanyRate: String(config.bpjsKesCompanyRate * 100),
    bpjsKesEmployeeRate: String(config.bpjsKesEmployeeRate * 100),
    bpjsKesCap: config.bpjsKesCap,
    bpjsTkJhtRate: String(config.bpjsTkJhtRate * 100),
    bpjsTkJkkRate: String(config.bpjsTkJkkRate * 100),
    bpjsTkJkmRate: String(config.bpjsTkJkmRate * 100),
    bpjsTkJpRate: String(config.bpjsTkJpRate * 100),
    bpjsTkJpCap: config.bpjsTkJpCap,
    pph21NonTaxableIncome: config.pph21NonTaxableIncome,
  };
}

function formToConfig(formData: PayrollConfigForm): Partial<AppConfigData> {
  return {
    bpjsKesCompanyRate: parseFloat(formData.bpjsKesCompanyRate) / 100 || 0,
    bpjsKesEmployeeRate: parseFloat(formData.bpjsKesEmployeeRate) / 100 || 0,
    bpjsKesCap: formData.bpjsKesCap,
    bpjsTkJhtRate: parseFloat(formData.bpjsTkJhtRate) / 100 || 0,
    bpjsTkJkkRate: parseFloat(formData.bpjsTkJkkRate) / 100 || 0,
    bpjsTkJkmRate: parseFloat(formData.bpjsTkJkmRate) / 100 || 0,
    bpjsTkJpRate: parseFloat(formData.bpjsTkJpRate) / 100 || 0,
    bpjsTkJpCap: formData.bpjsTkJpCap,
    pph21NonTaxableIncome: formData.pph21NonTaxableIncome,
  };
}

// ---------- Main Page ----------

export default function SettingsPage() {
  const { company, isLoading: compLoading } = useCompany();
  const { config, isLoading: configLoading } = useAppConfig();

  if (compLoading || configLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>Pengaturan</BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Perusahaan</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <h1 className="mt-2 text-2xl font-bold tracking-tight">
          Pengaturan Perusahaan
        </h1>
        <p className="text-muted-foreground">
          Kelola informasi dan konfigurasi perusahaan Anda.
        </p>
      </div>

      <Separator />

      <Tabs defaultValue="perusahaan">
        <TabsList className="flex w-full flex-wrap gap-1">
          <TabsTrigger value="perusahaan">
            <Building2 className="mr-1.5 h-4 w-4" />
            Perusahaan
          </TabsTrigger>
          <TabsTrigger value="penggajian">
            <Wallet className="mr-1.5 h-4 w-4" />
            Penggajian
          </TabsTrigger>
          <TabsTrigger value="jam-kerja">
            <Clock className="mr-1.5 h-4 w-4" />
            Jam Kerja
          </TabsTrigger>
          <TabsTrigger value="cuti">
            <CalendarDays className="mr-1.5 h-4 w-4" />
            Cuti
          </TabsTrigger>
          <TabsTrigger value="absensi">
            <ClipboardList className="mr-1.5 h-4 w-4" />
            Absensi
          </TabsTrigger>
          <TabsTrigger value="sistem">
            <Settings className="mr-1.5 h-4 w-4" />
            Sistem
          </TabsTrigger>
        </TabsList>

        <TabsContent value="perusahaan">
          {company && <CompanyTab company={company} />}
        </TabsContent>

        <TabsContent value="penggajian">
          {company && <PayrollTab company={company} appConfig={config} />}
        </TabsContent>

        <TabsContent value="jam-kerja">
          <WorkHoursTab appConfig={config} />
        </TabsContent>

        <TabsContent value="cuti">
          <LeaveTab appConfig={config} />
        </TabsContent>

        <TabsContent value="absensi">
          <AttendanceTab appConfig={config} />
        </TabsContent>

        <TabsContent value="sistem">
          <DataManagementSection />
        </TabsContent>
      </Tabs>
    </div>
  );
}

// =================================================================
// Tab 1: Perusahaan
// =================================================================

type CompanyForm = {
  name: string;
  legalName: string;
  npwp: string;
  address: string;
  city: string;
  province: string;
  postalCode: string;
  phone: string;
  email: string;
  website: string;
  logoUrl: string;
};

function CompanyTab({ company }: { company: Company }) {
  const { mutate } = useCompany();
  const updateCompany = useUpdateCompany();

  const [form, setForm] = useState<CompanyForm>({
    name: company.name,
    legalName: company.legalName,
    npwp: company.npwp ?? "",
    address: company.address,
    city: company.city,
    province: company.province,
    postalCode: company.postalCode ?? "",
    phone: company.phone ?? "",
    email: company.email ?? "",
    website: company.website ?? "",
    logoUrl: company.logoUrl ?? "",
  });
  const [saving, setSaving] = useState(false);
  const logoInputRef = useRef<HTMLInputElement>(null);

  function handleChange(field: keyof CompanyForm, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await updateCompany.trigger(form);
      await mutate();
      toast.success("Informasi perusahaan berhasil disimpan");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Gagal menyimpan");
    } finally {
      setSaving(false);
    }
  }

  function handleLogoSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("File harus berupa gambar (PNG, JPG, SVG, WebP)");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast.error("Ukuran logo maksimal 2MB");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setForm((prev) => ({ ...prev, logoUrl: dataUrl }));
    };
    reader.readAsDataURL(file);

    if (logoInputRef.current) logoInputRef.current.value = "";
  }

  function handleRemoveLogo() {
    setForm((prev) => ({ ...prev, logoUrl: "" }));
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Logo Perusahaan */}
      <Card>
        <CardHeader>
          <CardTitle>Logo Perusahaan</CardTitle>
          <CardDescription>
            Logo ditampilkan di sidebar, header, dan dokumen. Format: PNG, JPG, SVG, WebP. Maks 2MB.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-6">
            <div className="relative flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-xl border-2 border-dashed border-muted-foreground/25 bg-muted/30">
              {form.logoUrl ? (
                <>
                  <img
                    src={form.logoUrl}
                    alt="Logo perusahaan"
                    className="h-full w-full object-contain p-2"
                  />
                  <button
                    type="button"
                    onClick={handleRemoveLogo}
                    className="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full bg-destructive text-white shadow-sm hover:bg-destructive/90 transition-colors"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </>
              ) : (
                <Building2 className="h-10 w-10 text-muted-foreground/40" />
              )}
            </div>

            <div className="space-y-2">
              <input
                ref={logoInputRef}
                type="file"
                accept="image/png,image/jpeg,image/svg+xml,image/webp"
                className="hidden"
                onChange={handleLogoSelect}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => logoInputRef.current?.click()}
              >
                <ImagePlus className="mr-1.5 h-4 w-4" />
                {form.logoUrl ? "Ganti Logo" : "Upload Logo"}
              </Button>
              <p className="text-xs text-muted-foreground">
                Disarankan ukuran 256x256 px atau lebih, rasio 1:1.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Informasi Perusahaan */}
      <Card>
        <CardHeader>
          <CardTitle>Informasi Perusahaan</CardTitle>
          <CardDescription>
            Data dasar perusahaan yang digunakan di seluruh sistem.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="name">Nama Perusahaan</Label>
            <Input
              id="name"
              value={form.name}
              onChange={(e) => handleChange("name", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="legalName">Nama Legal / Badan Hukum</Label>
            <Input
              id="legalName"
              value={form.legalName}
              onChange={(e) => handleChange("legalName", e.target.value)}
            />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="npwp">NPWP</Label>
            <Input
              id="npwp"
              value={form.npwp}
              onChange={(e) => handleChange("npwp", e.target.value)}
            />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="address">Alamat</Label>
            <Input
              id="address"
              value={form.address}
              onChange={(e) => handleChange("address", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="city">Kota</Label>
            <Input
              id="city"
              value={form.city}
              onChange={(e) => handleChange("city", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="province">Provinsi</Label>
            <Select
              value={form.province}
              onValueChange={(val) => val !== null && handleChange("province", val)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Pilih provinsi" />
              </SelectTrigger>
              <SelectContent>
                {provinces.map((prov) => (
                  <SelectItem key={prov} value={prov}>
                    {prov}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="postalCode">Kode Pos</Label>
            <Input
              id="postalCode"
              value={form.postalCode}
              onChange={(e) => handleChange("postalCode", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Telepon</Label>
            <Input
              id="phone"
              type="tel"
              value={form.phone}
              onChange={(e) => handleChange("phone", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={form.email}
              onChange={(e) => handleChange("email", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="website">Website</Label>
            <Input
              id="website"
              type="url"
              value={form.website}
              onChange={(e) => handleChange("website", e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button type="submit" disabled={saving}>
          {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Simpan Pengaturan
        </Button>
      </div>
    </form>
  );
}

// =================================================================
// Tab 2: Penggajian
// =================================================================

function PayrollTab({ company, appConfig }: { company: Company; appConfig: AppConfigData }) {
  const { mutate: mutateCompany } = useCompany();
  const updateCompany = useUpdateCompany();
  const { mutate: mutateConfig } = useAppConfig();
  const updateConfig = useUpdateAppConfig();

  const [umrAmount, setUmrAmount] = useState(Number(company.umrAmount));
  const [umrRegion, setUmrRegion] = useState(company.umrRegion);
  const [cutOffDate, setCutOffDate] = useState(String(company.cutOffDate));
  const [payDate, setPayDate] = useState(String(company.payDate));
  const [configForm, setConfigForm] = useState<PayrollConfigForm>(() =>
    configToForm(appConfig),
  );
  const [saving, setSaving] = useState(false);

  function handleConfigChange(field: keyof PayrollConfigForm, value: string | number) {
    setConfigForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await Promise.all([
        updateCompany.trigger({
          umrAmount: umrAmount as unknown as import("@prisma/client/runtime/library").Decimal,
          umrRegion,
          cutOffDate: parseInt(cutOffDate),
          payDate: parseInt(payDate),
        }),
        updateConfig.trigger(formToConfig(configForm)),
      ]);
      await Promise.all([mutateCompany(), mutateConfig()]);
      toast.success("Pengaturan penggajian berhasil disimpan");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Gagal menyimpan");
    } finally {
      setSaving(false);
    }
  }

  const dateOptions = Array.from({ length: 31 }, (_, i) => i + 1);

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* UMR & Tanggal Payroll */}
      <Card>
        <CardHeader>
          <CardTitle>Konfigurasi Payroll</CardTitle>
          <CardDescription>
            Pengaturan UMR dan tanggal penggajian.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="umrAmount">UMR</Label>
            <Input
              id="umrAmount"
              value={formatCurrency(umrAmount)}
              onChange={(e) => setUmrAmount(parseCurrency(e.target.value))}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="umrRegion">Wilayah UMR</Label>
            <Select
              value={umrRegion}
              onValueChange={(val) => val !== null && setUmrRegion(val)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Pilih wilayah" />
              </SelectTrigger>
              <SelectContent>
                {provinces.map((prov) => (
                  <SelectItem key={prov} value={prov}>
                    {prov}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="cutOffDate">Tanggal Cut Off</Label>
            <Select
              value={cutOffDate}
              onValueChange={(val) => val !== null && setCutOffDate(val)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Pilih tanggal" />
              </SelectTrigger>
              <SelectContent>
                {dateOptions.map((d) => (
                  <SelectItem key={d} value={String(d)}>
                    Tanggal {d}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="payDate">Tanggal Gajian</Label>
            <Select
              value={payDate}
              onValueChange={(val) => val !== null && setPayDate(val)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Pilih tanggal" />
              </SelectTrigger>
              <SelectContent>
                {dateOptions.map((d) => (
                  <SelectItem key={d} value={String(d)}>
                    Tanggal {d}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* BPJS & PPh 21 */}
      <Card>
        <CardHeader>
          <CardTitle>Tarif BPJS & PPh 21</CardTitle>
          <CardDescription>
            Atur tarif potongan BPJS dan pajak penghasilan.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* BPJS Kesehatan */}
          <div>
            <h4 className="text-sm font-semibold mb-3">BPJS Kesehatan</h4>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="bpjsKesCompanyRate">Tarif Perusahaan (%)</Label>
                <div className="relative">
                  <Input
                    id="bpjsKesCompanyRate"
                    type="number"
                    step="0.01"
                    min="0"
                    value={configForm.bpjsKesCompanyRate}
                    onChange={(e) =>
                      handleConfigChange("bpjsKesCompanyRate", e.target.value)
                    }
                  />
                  <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                    %
                  </span>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="bpjsKesEmployeeRate">Tarif Karyawan (%)</Label>
                <div className="relative">
                  <Input
                    id="bpjsKesEmployeeRate"
                    type="number"
                    step="0.01"
                    min="0"
                    value={configForm.bpjsKesEmployeeRate}
                    onChange={(e) =>
                      handleConfigChange("bpjsKesEmployeeRate", e.target.value)
                    }
                  />
                  <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                    %
                  </span>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="bpjsKesCap">Batas Gaji Maksimum</Label>
                <div className="relative">
                  <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                    Rp
                  </span>
                  <Input
                    id="bpjsKesCap"
                    className="pl-8"
                    value={formatCurrency(configForm.bpjsKesCap)}
                    onChange={(e) =>
                      handleConfigChange("bpjsKesCap", parseCurrency(e.target.value))
                    }
                  />
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* BPJS Ketenagakerjaan */}
          <div>
            <h4 className="text-sm font-semibold mb-3">BPJS Ketenagakerjaan</h4>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="bpjsTkJhtRate">JHT Karyawan (%)</Label>
                <div className="relative">
                  <Input
                    id="bpjsTkJhtRate"
                    type="number"
                    step="0.01"
                    min="0"
                    value={configForm.bpjsTkJhtRate}
                    onChange={(e) =>
                      handleConfigChange("bpjsTkJhtRate", e.target.value)
                    }
                  />
                  <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                    %
                  </span>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="bpjsTkJkkRate">JKK Perusahaan (%)</Label>
                <div className="relative">
                  <Input
                    id="bpjsTkJkkRate"
                    type="number"
                    step="0.01"
                    min="0"
                    value={configForm.bpjsTkJkkRate}
                    onChange={(e) =>
                      handleConfigChange("bpjsTkJkkRate", e.target.value)
                    }
                  />
                  <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                    %
                  </span>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="bpjsTkJkmRate">JKM Perusahaan (%)</Label>
                <div className="relative">
                  <Input
                    id="bpjsTkJkmRate"
                    type="number"
                    step="0.01"
                    min="0"
                    value={configForm.bpjsTkJkmRate}
                    onChange={(e) =>
                      handleConfigChange("bpjsTkJkmRate", e.target.value)
                    }
                  />
                  <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                    %
                  </span>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="bpjsTkJpRate">JP Karyawan (%)</Label>
                <div className="relative">
                  <Input
                    id="bpjsTkJpRate"
                    type="number"
                    step="0.01"
                    min="0"
                    value={configForm.bpjsTkJpRate}
                    onChange={(e) =>
                      handleConfigChange("bpjsTkJpRate", e.target.value)
                    }
                  />
                  <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                    %
                  </span>
                </div>
              </div>
            </div>
            <div className="mt-4">
              <div className="space-y-2">
                <Label htmlFor="bpjsTkJpCap">Batas Gaji JP</Label>
                <div className="relative">
                  <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                    Rp
                  </span>
                  <Input
                    id="bpjsTkJpCap"
                    className="pl-8"
                    value={formatCurrency(configForm.bpjsTkJpCap)}
                    onChange={(e) =>
                      handleConfigChange("bpjsTkJpCap", parseCurrency(e.target.value))
                    }
                  />
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* PPh 21 */}
          <div>
            <h4 className="text-sm font-semibold mb-3">PPh 21</h4>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="pph21NonTaxableIncome">PTKP (TK/0) per Tahun</Label>
                <div className="relative">
                  <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                    Rp
                  </span>
                  <Input
                    id="pph21NonTaxableIncome"
                    className="pl-8"
                    value={formatCurrency(configForm.pph21NonTaxableIncome)}
                    onChange={(e) =>
                      handleConfigChange(
                        "pph21NonTaxableIncome",
                        parseCurrency(e.target.value),
                      )
                    }
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Lapisan Tarif PPh 21 (Tahunan)</Label>
                <div className="rounded-md border">
                  <div className="grid grid-cols-2 gap-0 text-sm">
                    <div className="border-b border-r bg-muted/50 px-3 py-2 font-medium">
                      Penghasilan Kena Pajak
                    </div>
                    <div className="border-b bg-muted/50 px-3 py-2 font-medium">
                      Tarif
                    </div>
                    <div className="border-b border-r px-3 py-2 text-muted-foreground">
                      s.d. Rp 60.000.000
                    </div>
                    <div className="border-b px-3 py-2">5%</div>
                    <div className="border-b border-r px-3 py-2 text-muted-foreground">
                      Rp 60jt - Rp 250jt
                    </div>
                    <div className="border-b px-3 py-2">15%</div>
                    <div className="border-b border-r px-3 py-2 text-muted-foreground">
                      Rp 250jt - Rp 500jt
                    </div>
                    <div className="border-b px-3 py-2">25%</div>
                    <div className="border-r px-3 py-2 text-muted-foreground">
                      Di atas Rp 500jt
                    </div>
                    <div className="px-3 py-2">30%</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button type="submit" disabled={saving}>
          {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Simpan Pengaturan
        </Button>
      </div>
    </form>
  );
}

// =================================================================
// Tab 3: Jam Kerja
// =================================================================

function WorkHoursTab({ appConfig }: { appConfig: AppConfigData }) {
  const { mutate } = useAppConfig();
  const updateConfig = useUpdateAppConfig();

  const [form, setForm] = useState<
    Pick<
      AppConfigData,
      | "defaultStartTime"
      | "defaultEndTime"
      | "lateToleranceMinutes"
      | "breakDurationMinutes"
      | "workDays"
      | "overtimeMultiplier"
      | "minOvertimeMinutes"
      | "maxOvertimeHoursPerDay"
    >
  >({
    defaultStartTime: appConfig.defaultStartTime,
    defaultEndTime: appConfig.defaultEndTime,
    lateToleranceMinutes: appConfig.lateToleranceMinutes,
    breakDurationMinutes: appConfig.breakDurationMinutes,
    workDays: [...appConfig.workDays],
    overtimeMultiplier: appConfig.overtimeMultiplier,
    minOvertimeMinutes: appConfig.minOvertimeMinutes,
    maxOvertimeHoursPerDay: appConfig.maxOvertimeHoursPerDay,
  });
  const [saving, setSaving] = useState(false);

  function toggleWorkDay(day: number) {
    setForm((prev) => {
      const exists = prev.workDays.includes(day);
      const updated = exists
        ? prev.workDays.filter((d) => d !== day)
        : [...prev.workDays, day];
      return { ...prev, workDays: updated };
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await updateConfig.trigger(form);
      await mutate();
      toast.success("Konfigurasi jam kerja berhasil disimpan");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Gagal menyimpan");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Konfigurasi Jam Kerja</CardTitle>
          <CardDescription>
            Atur jam kerja default, toleransi keterlambatan, dan hari kerja.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="defaultStartTime">Jam Masuk Default</Label>
              <Input
                id="defaultStartTime"
                type="time"
                value={form.defaultStartTime}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, defaultStartTime: e.target.value }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="defaultEndTime">Jam Pulang Default</Label>
              <Input
                id="defaultEndTime"
                type="time"
                value={form.defaultEndTime}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, defaultEndTime: e.target.value }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lateToleranceMinutes">Toleransi Keterlambatan (menit)</Label>
              <Input
                id="lateToleranceMinutes"
                type="number"
                min="0"
                value={form.lateToleranceMinutes}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    lateToleranceMinutes: parseInt(e.target.value) || 0,
                  }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="breakDurationMinutes">Durasi Istirahat (menit)</Label>
              <Input
                id="breakDurationMinutes"
                type="number"
                min="0"
                value={form.breakDurationMinutes}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    breakDurationMinutes: parseInt(e.target.value) || 0,
                  }))
                }
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Hari Kerja</Label>
            <div className="flex flex-wrap gap-2">
              {WORK_DAYS_LABELS.map(({ value, label }) => {
                const active = form.workDays.includes(value);
                return (
                  <button
                    key={value}
                    type="button"
                    onClick={() => toggleWorkDay(value)}
                    className={`inline-flex h-9 items-center justify-center rounded-md border px-3 text-sm font-medium transition-colors ${
                      active
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-input bg-background text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Konfigurasi Overtime</CardTitle>
          <CardDescription>
            Atur tarif dan batas lembur karyawan.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="overtimeMultiplier">Tarif Lembur (multiplier)</Label>
            <div className="relative">
              <Input
                id="overtimeMultiplier"
                type="number"
                step="0.1"
                min="1"
                value={form.overtimeMultiplier}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    overtimeMultiplier: parseFloat(e.target.value) || 1,
                  }))
                }
              />
              <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                x
              </span>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="minOvertimeMinutes">Minimal Lembur (menit)</Label>
            <Input
              id="minOvertimeMinutes"
              type="number"
              min="0"
              value={form.minOvertimeMinutes}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  minOvertimeMinutes: parseInt(e.target.value) || 0,
                }))
              }
            />
            <p className="text-xs text-muted-foreground">
              Minimal waktu lembur sebelum dihitung (mis. 60 = min 1 jam)
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="maxOvertimeHoursPerDay">Maks. Lembur per Hari (jam)</Label>
            <Input
              id="maxOvertimeHoursPerDay"
              type="number"
              min="0"
              value={form.maxOvertimeHoursPerDay}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  maxOvertimeHoursPerDay: parseInt(e.target.value) || 0,
                }))
              }
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button type="submit" disabled={saving}>
          {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Simpan Pengaturan
        </Button>
      </div>
    </form>
  );
}

// =================================================================
// Tab 4: Cuti
// =================================================================

function LeaveTab({ appConfig }: { appConfig: AppConfigData }) {
  const { mutate } = useAppConfig();
  const updateConfig = useUpdateAppConfig();

  const [form, setForm] = useState<
    Pick<
      AppConfigData,
      | "annualLeaveEntitlement"
      | "leaveWaitingPeriodMonths"
      | "maxCarryOverDays"
      | "collectiveLeaveDays"
      | "weddingLeaveDays"
      | "maternityLeaveDays"
      | "paternityLeaveDays"
      | "bereavementLeaveDays"
      | "sickWithoutNoteDays"
    >
  >({
    annualLeaveEntitlement: appConfig.annualLeaveEntitlement,
    leaveWaitingPeriodMonths: appConfig.leaveWaitingPeriodMonths,
    maxCarryOverDays: appConfig.maxCarryOverDays,
    collectiveLeaveDays: appConfig.collectiveLeaveDays,
    weddingLeaveDays: appConfig.weddingLeaveDays,
    maternityLeaveDays: appConfig.maternityLeaveDays,
    paternityLeaveDays: appConfig.paternityLeaveDays,
    bereavementLeaveDays: appConfig.bereavementLeaveDays,
    sickWithoutNoteDays: appConfig.sickWithoutNoteDays,
  });
  const [saving, setSaving] = useState(false);

  function handleNumberChange(field: keyof typeof form, value: string) {
    setForm((prev) => ({ ...prev, [field]: parseInt(value) || 0 }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await updateConfig.trigger(form);
      await mutate();
      toast.success("Kebijakan cuti berhasil disimpan");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Gagal menyimpan");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Kebijakan Cuti</CardTitle>
          <CardDescription>
            Konfigurasi jatah cuti tahunan dan aturan carry over.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="annualLeaveEntitlement">Jatah Cuti Tahunan (hari)</Label>
            <Input
              id="annualLeaveEntitlement"
              type="number"
              min="0"
              value={form.annualLeaveEntitlement}
              onChange={(e) => handleNumberChange("annualLeaveEntitlement", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="leaveWaitingPeriodMonths">Masa Tunggu Cuti (bulan)</Label>
            <Input
              id="leaveWaitingPeriodMonths"
              type="number"
              min="0"
              value={form.leaveWaitingPeriodMonths}
              onChange={(e) => handleNumberChange("leaveWaitingPeriodMonths", e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Jumlah bulan setelah bergabung sebelum dapat mengambil cuti
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="maxCarryOverDays">Carry Over Maksimal (hari)</Label>
            <Input
              id="maxCarryOverDays"
              type="number"
              min="0"
              value={form.maxCarryOverDays}
              onChange={(e) => handleNumberChange("maxCarryOverDays", e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Sisa cuti yang bisa dibawa ke tahun depan
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="collectiveLeaveDays">Cuti Bersama per Tahun (hari)</Label>
            <Input
              id="collectiveLeaveDays"
              type="number"
              min="0"
              value={form.collectiveLeaveDays}
              onChange={(e) => handleNumberChange("collectiveLeaveDays", e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Cuti Khusus (Default Hari)</CardTitle>
          <CardDescription>
            Atur jumlah hari default untuk setiap jenis cuti khusus.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="weddingLeaveDays">Cuti Menikah</Label>
            <div className="relative">
              <Input
                id="weddingLeaveDays"
                type="number"
                min="0"
                value={form.weddingLeaveDays}
                onChange={(e) => handleNumberChange("weddingLeaveDays", e.target.value)}
              />
              <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                hari
              </span>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="maternityLeaveDays">Cuti Melahirkan</Label>
            <div className="relative">
              <Input
                id="maternityLeaveDays"
                type="number"
                min="0"
                value={form.maternityLeaveDays}
                onChange={(e) => handleNumberChange("maternityLeaveDays", e.target.value)}
              />
              <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                hari
              </span>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="paternityLeaveDays">Cuti Ayah</Label>
            <div className="relative">
              <Input
                id="paternityLeaveDays"
                type="number"
                min="0"
                value={form.paternityLeaveDays}
                onChange={(e) => handleNumberChange("paternityLeaveDays", e.target.value)}
              />
              <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                hari
              </span>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="bereavementLeaveDays">Cuti Duka</Label>
            <div className="relative">
              <Input
                id="bereavementLeaveDays"
                type="number"
                min="0"
                value={form.bereavementLeaveDays}
                onChange={(e) => handleNumberChange("bereavementLeaveDays", e.target.value)}
              />
              <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                hari
              </span>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="sickWithoutNoteDays">Cuti Sakit Tanpa Surat</Label>
            <div className="relative">
              <Input
                id="sickWithoutNoteDays"
                type="number"
                min="0"
                value={form.sickWithoutNoteDays}
                onChange={(e) => handleNumberChange("sickWithoutNoteDays", e.target.value)}
              />
              <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                hari
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              Maks. hari berturut tanpa surat dokter
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button type="submit" disabled={saving}>
          {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Simpan Pengaturan
        </Button>
      </div>
    </form>
  );
}

// =================================================================
// Tab 5: Absensi
// =================================================================

function AttendanceTab({ appConfig }: { appConfig: AppConfigData }) {
  const { mutate } = useAppConfig();
  const updateConfig = useUpdateAppConfig();

  const [form, setForm] = useState<
    Pick<
      AppConfigData,
      "attendanceMethod" | "gpsRadiusMeters" | "autoCheckoutTime" | "allowOutOfSchedule"
    >
  >({
    attendanceMethod: appConfig.attendanceMethod,
    gpsRadiusMeters: appConfig.gpsRadiusMeters,
    autoCheckoutTime: appConfig.autoCheckoutTime,
    allowOutOfSchedule: appConfig.allowOutOfSchedule,
  });
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await updateConfig.trigger(form);
      await mutate();
      toast.success("Konfigurasi absensi berhasil disimpan");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Gagal menyimpan");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Konfigurasi Absensi</CardTitle>
          <CardDescription>
            Atur metode absensi, radius GPS, dan kebijakan checkout otomatis.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="attendanceMethod">Metode Absensi</Label>
              <Select
                value={form.attendanceMethod}
                onValueChange={(val) =>
                  val !== null &&
                  setForm((prev) => ({
                    ...prev,
                    attendanceMethod: val as AppConfigData["attendanceMethod"],
                  }))
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Pilih metode" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MANUAL">Manual</SelectItem>
                  <SelectItem value="GPS">GPS</SelectItem>
                  <SelectItem value="FINGERPRINT">Fingerprint</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="gpsRadiusMeters">Radius GPS (meter)</Label>
              <Input
                id="gpsRadiusMeters"
                type="number"
                min="0"
                value={form.gpsRadiusMeters}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    gpsRadiusMeters: parseInt(e.target.value) || 0,
                  }))
                }
                disabled={form.attendanceMethod !== "GPS"}
              />
              <p className="text-xs text-muted-foreground">
                Hanya berlaku untuk metode GPS
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="autoCheckoutTime">Auto Checkout Jam</Label>
              <Input
                id="autoCheckoutTime"
                type="time"
                value={form.autoCheckoutTime}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, autoCheckoutTime: e.target.value }))
                }
              />
              <p className="text-xs text-muted-foreground">
                Checkout otomatis jika karyawan belum checkout
              </p>
            </div>

            <div className="flex items-center justify-between rounded-md border p-3">
              <div className="space-y-0.5">
                <Label htmlFor="allowOutOfSchedule">Izinkan Absensi di Luar Jadwal</Label>
                <p className="text-xs text-muted-foreground">
                  Karyawan dapat melakukan absensi di luar jam kerja yang dijadwalkan
                </p>
              </div>
              <Switch
                id="allowOutOfSchedule"
                checked={form.allowOutOfSchedule}
                onCheckedChange={(checked: boolean) =>
                  setForm((prev) => ({ ...prev, allowOutOfSchedule: checked }))
                }
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button type="submit" disabled={saving}>
          {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Simpan Pengaturan
        </Button>
      </div>
    </form>
  );
}

// =================================================================
// Tab 6: Sistem (Data Management)
// =================================================================

function DataManagementSection() {
  const [resetDialogOpen, setResetDialogOpen] = useState(false);
  const [reseedDialogOpen, setReseedDialogOpen] = useState(false);
  const [processing, setProcessing] = useState(false);

  async function handleAction(action: "reset" | "reseed") {
    setProcessing(true);
    try {
      const res = await fetch("/api/settings/reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error ?? "Gagal");
      }
      toast.success(json.data.message);
      setResetDialogOpen(false);
      setReseedDialogOpen(false);
      setTimeout(() => window.location.reload(), 800);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Operasi gagal");
    } finally {
      setProcessing(false);
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Database className="h-5 w-5 text-muted-foreground" />
            <CardTitle>Manajemen Data</CardTitle>
          </div>
          <CardDescription>
            Hapus semua data untuk memulai dari awal, atau muat ulang data demo.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-3">
            {/* Hapus Semua Data */}
            <Dialog open={resetDialogOpen} onOpenChange={setResetDialogOpen}>
              <DialogTrigger
                render={
                  <Button variant="destructive" size="lg">
                    <Trash2 className="mr-1.5 h-4 w-4" />
                    Hapus Semua Data
                  </Button>
                }
              />
              <DialogContent>
                <DialogHeader>
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-destructive/10">
                      <AlertTriangle className="h-4 w-4 text-destructive" />
                    </div>
                    <DialogTitle>Hapus Semua Data</DialogTitle>
                  </div>
                  <DialogDescription>
                    Apakah Anda yakin ingin menghapus semua data? Tindakan ini tidak
                    dapat dibatalkan. Semua data karyawan, absensi, cuti, dan lainnya
                    akan dihapus dari database.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <DialogClose render={<Button variant="outline" />}>
                    Batal
                  </DialogClose>
                  <Button
                    variant="destructive"
                    onClick={() => handleAction("reset")}
                    disabled={processing}
                  >
                    {processing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Ya, Hapus Semua
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {/* Muat Data Demo */}
            <Dialog open={reseedDialogOpen} onOpenChange={setReseedDialogOpen}>
              <DialogTrigger
                render={
                  <Button variant="secondary" size="lg">
                    <RotateCcw className="mr-1.5 h-4 w-4" />
                    Muat Data Demo
                  </Button>
                }
              />
              <DialogContent>
                <DialogHeader>
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100">
                      <RotateCcw className="h-4 w-4 text-blue-600" />
                    </div>
                    <DialogTitle>Muat Data Demo</DialogTitle>
                  </div>
                  <DialogDescription>
                    Ini akan menghapus semua data saat ini dan menggantinya dengan
                    data demo (perusahaan, departemen, posisi, dan akun login).
                    Lanjutkan?
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <DialogClose render={<Button variant="outline" />}>
                    Batal
                  </DialogClose>
                  <Button
                    onClick={() => handleAction("reseed")}
                    disabled={processing}
                  >
                    {processing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Ya, Muat Data Demo
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <p className="text-xs text-muted-foreground">
            Data demo mencakup: 1 perusahaan, 9 departemen, 15 posisi, dan 4 akun login.
            Anda akan otomatis logout setelah reset.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
