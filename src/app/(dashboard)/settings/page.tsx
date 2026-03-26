"use client";

import { useState } from "react";
import { toast } from "sonner";
import type { CompanySettings } from "@/lib/dummy-data";
import type { PayrollConfig } from "@/lib/dummy-data/payroll-config";
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
import { Badge } from "@/components/ui/badge";
import { Trash2, RotateCcw, Database, AlertTriangle } from "lucide-react";

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

export default function SettingsPage() {
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
    updateCompanySettings(form);
    updatePayrollConfig(formToConfig(configForm));
    toast.success("Pengaturan berhasil disimpan");
  }

  const dateOptions = Array.from({ length: 31 }, (_, i) => i + 1);

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

      <form onSubmit={handleSubmit} className="space-y-6">
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

        {/* Konfigurasi Payroll */}
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

        {/* Tarif BPJS & PPh 21 */}
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

      <Separator />

      {/* Manajemen Data */}
      <DataManagementSection />
    </div>
  );
}

function DataManagementSection() {
  const isUsingDemoData = useAppStore((s) => s.isUsingDemoData);
  const resetAllData = useAppStore((s) => s.resetAllData);
  const restoreDemoData = useAppStore((s) => s.restoreDemoData);
  const [resetDialogOpen, setResetDialogOpen] = useState(false);
  const [restoreDialogOpen, setRestoreDialogOpen] = useState(false);

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

  return (
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
                  dapat dibatalkan.
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
  );
}
