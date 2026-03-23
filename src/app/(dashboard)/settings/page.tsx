"use client";

import { useState } from "react";
import { toast } from "sonner";
import { companySettings, type CompanySettings } from "@/lib/dummy-data";
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

export default function SettingsPage() {
  const [form, setForm] = useState<CompanySettings>({ ...companySettings });

  function handleChange(field: keyof CompanySettings, value: string | number) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
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

        <div className="flex justify-end">
          <Button type="submit">Simpan Pengaturan</Button>
        </div>
      </form>
    </div>
  );
}
