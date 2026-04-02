"use client";

import { useState, useRef, useCallback } from "react";
import { toast } from "sonner";
import type { CompanySettings } from "@/lib/dummy-data";
import type { PayrollConfig } from "@/lib/dummy-data/payroll-config";
import type { AppConfig } from "@/lib/dummy-data/app-config";
import { useAppStore } from "@/lib/store/app-store";
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
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Trash2,
  RotateCcw,
  Database,
  AlertTriangle,
  Building2,
  Wallet,
  Clock,
  CalendarDays,
  ClipboardList,
  Settings,
  Download,
  Upload,
  FileJson,
  ShieldCheck,
  ImagePlus,
  X,
} from "lucide-react";

// ---------- Constants ----------

const provinces = [
  "Aceh",
  "Bali",
  "Banten",
  "Bengkulu",
  "DI Yogyakarta",
  "DKI Jakarta",
  "Gorontalo",
  "Jambi",
  "Jawa Barat",
  "Jawa Tengah",
  "Jawa Timur",
  "Kalimantan Barat",
  "Kalimantan Selatan",
  "Kalimantan Tengah",
  "Kalimantan Timur",
  "Kalimantan Utara",
  "Kepulauan Bangka Belitung",
  "Kepulauan Riau",
  "Lampung",
  "Maluku",
  "Maluku Utara",
  "Nusa Tenggara Barat",
  "Nusa Tenggara Timur",
  "Papua",
  "Papua Barat",
  "Riau",
  "Sulawesi Barat",
  "Sulawesi Selatan",
  "Sulawesi Tengah",
  "Sulawesi Tenggara",
  "Sulawesi Utara",
  "Sumatera Barat",
  "Sumatera Selatan",
  "Sumatera Utara",
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

function configToForm(config: PayrollConfig): PayrollConfigForm {
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

function formToConfig(formData: PayrollConfigForm): Partial<PayrollConfig> {
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
          <CompanyTab />
        </TabsContent>

        <TabsContent value="penggajian">
          <PayrollTab />
        </TabsContent>

        <TabsContent value="jam-kerja">
          <WorkHoursTab />
        </TabsContent>

        <TabsContent value="cuti">
          <LeaveTab />
        </TabsContent>

        <TabsContent value="absensi">
          <AttendanceTab />
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

function CompanyTab() {
  const storeSettings = useAppStore((s) => s.companySettings);
  const updateCompanySettings = useAppStore((s) => s.updateCompanySettings);
  const [form, setForm] = useState<CompanySettings>({ ...storeSettings });
  const logoInputRef = useRef<HTMLInputElement>(null);

  function handleChange(field: keyof CompanySettings, value: string | number) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    updateCompanySettings(form);
    toast.success("Informasi perusahaan berhasil disimpan");
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
      updateCompanySettings({ logoUrl: dataUrl });
      toast.success("Logo berhasil diperbarui");
    };
    reader.readAsDataURL(file);

    if (logoInputRef.current) logoInputRef.current.value = "";
  }

  function handleRemoveLogo() {
    setForm((prev) => ({ ...prev, logoUrl: "" }));
    updateCompanySettings({ logoUrl: "" });
    toast.success("Logo berhasil dihapus");
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
            {/* Preview */}
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

            {/* Upload actions */}
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
        <Button type="submit">Simpan Pengaturan</Button>
      </div>
    </form>
  );
}

// =================================================================
// Tab 2: Penggajian
// =================================================================

function PayrollTab() {
  const storeSettings = useAppStore((s) => s.companySettings);
  const updateCompanySettings = useAppStore((s) => s.updateCompanySettings);
  const payrollConfig = useAppStore((s) => s.payrollConfig);
  const updatePayrollConfig = useAppStore((s) => s.updatePayrollConfig);

  const [form, setForm] = useState<CompanySettings>({ ...storeSettings });
  const [configForm, setConfigForm] = useState<PayrollConfigForm>(() =>
    configToForm(payrollConfig),
  );

  function handleChange(field: keyof CompanySettings, value: string | number) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function handleConfigChange(field: keyof PayrollConfigForm, value: string | number) {
    setConfigForm((prev) => ({ ...prev, [field]: value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    updateCompanySettings({
      umrAmount: form.umrAmount,
      umrRegion: form.umrRegion,
      cutOffDate: form.cutOffDate,
      payDate: form.payDate,
    });
    updatePayrollConfig(formToConfig(configForm));
    toast.success("Pengaturan penggajian berhasil disimpan");
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
              value={formatCurrency(form.umrAmount)}
              onChange={(e) =>
                handleChange("umrAmount", parseCurrency(e.target.value))
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="umrRegion">Wilayah UMR</Label>
            <Select
              value={form.umrRegion}
              onValueChange={(val) => val !== null && handleChange("umrRegion", val)}
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
              value={form.cutOffDate}
              onValueChange={(val) => val !== null && handleChange("cutOffDate", val)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Pilih tanggal" />
              </SelectTrigger>
              <SelectContent>
                {dateOptions.map((d) => (
                  <SelectItem key={d} value={d}>
                    Tanggal {d}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="payDate">Tanggal Gajian</Label>
            <Select
              value={form.payDate}
              onValueChange={(val) => val !== null && handleChange("payDate", val)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Pilih tanggal" />
              </SelectTrigger>
              <SelectContent>
                {dateOptions.map((d) => (
                  <SelectItem key={d} value={d}>
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
        <Button type="submit">Simpan Pengaturan</Button>
      </div>
    </form>
  );
}

// =================================================================
// Tab 3: Jam Kerja
// =================================================================

function WorkHoursTab() {
  const appConfig = useAppStore((s) => s.appConfig);
  const updateAppConfig = useAppStore((s) => s.updateAppConfig);

  const [form, setForm] = useState<
    Pick<
      AppConfig,
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

  function toggleWorkDay(day: number) {
    setForm((prev) => {
      const exists = prev.workDays.includes(day);
      const updated = exists
        ? prev.workDays.filter((d) => d !== day)
        : [...prev.workDays, day];
      return { ...prev, workDays: updated };
    });
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    updateAppConfig(form);
    toast.success("Konfigurasi jam kerja berhasil disimpan");
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Konfigurasi Jam Kerja */}
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

      {/* Konfigurasi Overtime */}
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
        <Button type="submit">Simpan Pengaturan</Button>
      </div>
    </form>
  );
}

// =================================================================
// Tab 4: Cuti
// =================================================================

function LeaveTab() {
  const appConfig = useAppStore((s) => s.appConfig);
  const updateAppConfig = useAppStore((s) => s.updateAppConfig);

  const [form, setForm] = useState<
    Pick<
      AppConfig,
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

  function handleNumberChange(
    field: keyof typeof form,
    value: string,
  ) {
    setForm((prev) => ({ ...prev, [field]: parseInt(value) || 0 }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    updateAppConfig(form);
    toast.success("Kebijakan cuti berhasil disimpan");
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Kebijakan Cuti */}
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

      {/* Cuti Khusus */}
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
        <Button type="submit">Simpan Pengaturan</Button>
      </div>
    </form>
  );
}

// =================================================================
// Tab 5: Absensi
// =================================================================

function AttendanceTab() {
  const appConfig = useAppStore((s) => s.appConfig);
  const updateAppConfig = useAppStore((s) => s.updateAppConfig);

  const [form, setForm] = useState<
    Pick<
      AppConfig,
      "attendanceMethod" | "gpsRadiusMeters" | "autoCheckoutTime" | "allowOutOfSchedule"
    >
  >({
    attendanceMethod: appConfig.attendanceMethod,
    gpsRadiusMeters: appConfig.gpsRadiusMeters,
    autoCheckoutTime: appConfig.autoCheckoutTime,
    allowOutOfSchedule: appConfig.allowOutOfSchedule,
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    updateAppConfig(form);
    toast.success("Konfigurasi absensi berhasil disimpan");
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
                    attendanceMethod: val as AppConfig["attendanceMethod"],
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
        <Button type="submit">Simpan Pengaturan</Button>
      </div>
    </form>
  );
}

// =================================================================
// Tab 6: Sistem (Data Management)
// =================================================================

// ---------- Backup/Restore helpers ----------

const BACKUP_VERSION = 1;
const STORE_KEY = "hris-app-store";

type BackupFile = {
  _meta: {
    version: number;
    appName: string;
    createdAt: string;
    description: string;
  };
  state: Record<string, unknown>;
};

function createBackupPayload(description: string): BackupFile {
  const raw = localStorage.getItem(STORE_KEY);
  if (!raw) throw new Error("Store data tidak ditemukan di localStorage");
  const parsed = JSON.parse(raw);
  return {
    _meta: {
      version: BACKUP_VERSION,
      appName: "HRIS",
      createdAt: new Date().toISOString(),
      description,
    },
    state: parsed.state ?? parsed,
  };
}

function validateBackupFile(data: unknown): data is BackupFile {
  if (typeof data !== "object" || data === null) return false;
  const obj = data as Record<string, unknown>;
  if (typeof obj._meta !== "object" || obj._meta === null) return false;
  const meta = obj._meta as Record<string, unknown>;
  if (meta.appName !== "HRIS") return false;
  if (typeof meta.version !== "number") return false;
  if (typeof obj.state !== "object" || obj.state === null) return false;
  return true;
}

function downloadJson(payload: BackupFile) {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const timeStr = new Date().toTimeString().slice(0, 5).replace(":", "");
  const filename = `hris-backup-${dateStr}-${timeStr}.json`;
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// ---------- DataManagementSection ----------

function DataManagementSection() {
  const isUsingDemoData = useAppStore((s) => s.isUsingDemoData);
  const resetAllData = useAppStore((s) => s.resetAllData);
  const restoreDemoData = useAppStore((s) => s.restoreDemoData);
  const employees = useAppStore((s) => s.employees);
  const departments = useAppStore((s) => s.departments);

  const [resetDialogOpen, setResetDialogOpen] = useState(false);
  const [restoreDialogOpen, setRestoreDialogOpen] = useState(false);
  const [restoreBackupDialogOpen, setRestoreBackupDialogOpen] = useState(false);
  const [backupDesc, setBackupDesc] = useState("");
  const [restorePreview, setRestorePreview] = useState<BackupFile | null>(null);
  const [restoreError, setRestoreError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleReset() {
    resetAllData();
    setResetDialogOpen(false);
    toast.success("Semua data berhasil dihapus");
  }

  function handleRestore() {
    restoreDemoData();
    setRestoreDialogOpen(false);
    toast.success("Data demo berhasil dimuat");
  }

  const handleBackup = useCallback(() => {
    try {
      const payload = createBackupPayload(backupDesc || "Manual backup");
      downloadJson(payload);
      setBackupDesc("");
      toast.success("Backup berhasil diunduh");
    } catch {
      toast.error("Gagal membuat backup");
    }
  }, [backupDesc]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setRestoreError("");
    setRestorePreview(null);

    if (!file.name.endsWith(".json")) {
      setRestoreError("File harus berformat JSON");
      return;
    }

    if (file.size > 50 * 1024 * 1024) {
      setRestoreError("Ukuran file terlalu besar (maks 50MB)");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (!validateBackupFile(parsed)) {
          setRestoreError("File bukan backup HRIS yang valid");
          return;
        }
        setRestorePreview(parsed);
        setRestoreBackupDialogOpen(true);
      } catch {
        setRestoreError("File JSON tidak valid");
      }
    };
    reader.readAsText(file);
  }, []);

  const handleRestoreBackup = useCallback(() => {
    if (!restorePreview) return;
    try {
      // Write directly to localStorage in the Zustand persist format
      const currentRaw = localStorage.getItem(STORE_KEY);
      const currentParsed = currentRaw ? JSON.parse(currentRaw) : {};
      const newData = {
        ...currentParsed,
        state: {
          ...restorePreview.state,
          isUsingDemoData: false,
          hasBeenInitialized: true,
        },
      };
      localStorage.setItem(STORE_KEY, JSON.stringify(newData));

      // Reload to pick up the new state
      setRestoreBackupDialogOpen(false);
      setRestorePreview(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      toast.success("Data berhasil di-restore dari backup. Halaman akan dimuat ulang...");
      setTimeout(() => window.location.reload(), 1000);
    } catch {
      toast.error("Gagal me-restore data dari backup");
    }
  }, [restorePreview]);

  const activeEmps = employees.filter((e) => !e.isDeleted).length;
  const activeDepts = departments.filter((d) => d.isActive).length;

  return (
    <div className="space-y-6">
      {/* Backup & Restore */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-muted-foreground" />
            <CardTitle>Backup & Restore</CardTitle>
          </div>
          <CardDescription>
            Simpan salinan data HRIS ke file JSON, atau pulihkan dari file backup sebelumnya.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          {/* Current data summary */}
          <div className="rounded-lg border bg-muted/30 p-4">
            <p className="text-sm font-medium mb-2">Ringkasan Data Saat Ini</p>
            <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground sm:grid-cols-4">
              <div>
                <span className="font-medium text-foreground">{activeEmps}</span> Karyawan
              </div>
              <div>
                <span className="font-medium text-foreground">{activeDepts}</span> Departemen
              </div>
              <div>
                <span className="font-medium text-foreground">
                  {isUsingDemoData ? "Demo" : "Custom"}
                </span> Mode
              </div>
              <div>
                <FileJson className="mr-1 inline h-3.5 w-3.5" />
                localStorage
              </div>
            </div>
          </div>

          {/* Backup section */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold flex items-center gap-1.5">
              <Download className="h-4 w-4 text-emerald-600" />
              Backup Data
            </h3>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
              <div className="flex-1 space-y-1.5">
                <Label htmlFor="backup-desc" className="text-xs text-muted-foreground">
                  Deskripsi (opsional)
                </Label>
                <Input
                  id="backup-desc"
                  placeholder="Contoh: Sebelum reset data, Data akhir bulan..."
                  value={backupDesc}
                  onChange={(e) => setBackupDesc((e.target as HTMLInputElement).value)}
                />
              </div>
              <Button onClick={handleBackup} className="shrink-0">
                <Download className="mr-1.5 h-4 w-4" />
                Download Backup
              </Button>
            </div>
          </div>

          <Separator />

          {/* Restore section */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold flex items-center gap-1.5">
              <Upload className="h-4 w-4 text-blue-600" />
              Restore dari Backup
            </h3>
            <p className="text-xs text-muted-foreground">
              Pilih file backup JSON HRIS untuk mengembalikan data. Data saat ini akan ditimpa.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                className="hidden"
                onChange={handleFileSelect}
              />
              <Button
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="mr-1.5 h-4 w-4" />
                Pilih File Backup
              </Button>
              {restoreError && (
                <p className="text-sm text-destructive flex items-center gap-1">
                  <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                  {restoreError}
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Restore Backup Confirmation Dialog */}
      <Dialog open={restoreBackupDialogOpen} onOpenChange={setRestoreBackupDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100">
                <Upload className="h-4 w-4 text-blue-600" />
              </div>
              <DialogTitle>Restore dari Backup</DialogTitle>
            </div>
            <DialogDescription>
              Data saat ini akan ditimpa dengan data dari file backup.
            </DialogDescription>
          </DialogHeader>
          {restorePreview && (
            <div className="rounded-lg border bg-muted/30 p-4 text-sm space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tanggal backup</span>
                <span className="font-medium">
                  {new Date(restorePreview._meta.createdAt).toLocaleString("id-ID")}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Deskripsi</span>
                <span className="font-medium">{restorePreview._meta.description}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Versi</span>
                <span className="font-medium">v{restorePreview._meta.version}</span>
              </div>
              {Array.isArray(restorePreview.state.employees) && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Karyawan</span>
                  <span className="font-medium">
                    {restorePreview.state.employees.length} data
                  </span>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <DialogClose
              render={<Button variant="outline" />}
            >
              Batal
            </DialogClose>
            <Button onClick={handleRestoreBackup}>
              <Upload className="mr-1.5 h-4 w-4" />
              Ya, Restore Sekarang
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Data Management (existing) */}
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
          {/* Status */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Status saat ini:</span>
            {isUsingDemoData ? (
              <Badge variant="secondary">Menggunakan data demo</Badge>
            ) : (
              <Badge variant="outline">Data kosong (fresh start)</Badge>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap gap-3">
            {/* Hapus Semua Data */}
            <Dialog open={resetDialogOpen} onOpenChange={setResetDialogOpen}>
              <DialogTrigger
                render={
                  <Button variant="destructive" size="lg">
                    <Trash2 className="mr-1.5 h-4 w-4" data-icon="inline-start" />
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
                    dapat dibatalkan. Disarankan untuk membuat backup terlebih dahulu.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <DialogClose
                    render={<Button variant="outline" />}
                  >
                    Batal
                  </DialogClose>
                  <Button variant="destructive" onClick={handleReset}>
                    Ya, Hapus Semua
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {/* Muat Data Demo */}
            <Dialog open={restoreDialogOpen} onOpenChange={setRestoreDialogOpen}>
              <DialogTrigger
                render={
                  <Button variant="secondary" size="lg">
                    <RotateCcw className="mr-1.5 h-4 w-4" data-icon="inline-start" />
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
                    Ini akan mengganti semua data saat ini dengan data demo.
                    Lanjutkan?
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <DialogClose
                    render={<Button variant="outline" />}
                  >
                    Batal
                  </DialogClose>
                  <Button onClick={handleRestore}>Ya, Muat Data Demo</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
