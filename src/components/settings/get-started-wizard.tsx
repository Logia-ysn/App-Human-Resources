"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Rocket, Loader2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
import { useCreateCompany, useCompany, useSetupStatus } from "@/hooks/use-settings";

const PROVINCES = [
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

type Form = {
  name: string;
  legalName: string;
  address: string;
  city: string;
  province: string;
  umrAmount: string;
  umrRegion: string;
};

function formatIDR(value: string) {
  const digits = value.replace(/\D/g, "");
  if (!digits) return "";
  return new Intl.NumberFormat("id-ID").format(parseInt(digits, 10));
}

export function GetStartedWizard() {
  const createCompany = useCreateCompany();
  const { mutate: mutateCompany } = useCompany();
  const { mutate: mutateStatus } = useSetupStatus();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<Form>({
    name: "",
    legalName: "",
    address: "",
    city: "",
    province: "",
    umrAmount: "",
    umrRegion: "",
  });

  function update<K extends keyof Form>(field: K, value: Form[K]) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const umrDigits = form.umrAmount.replace(/\D/g, "");
    if (!umrDigits) {
      toast.error("UMR wajib diisi");
      return;
    }
    setSaving(true);
    try {
      await createCompany.trigger({
        name: form.name.trim(),
        legalName: form.legalName.trim(),
        address: form.address.trim(),
        city: form.city.trim(),
        province: form.province,
        umrAmount: umrDigits,
        umrRegion: form.umrRegion.trim(),
      });
      await Promise.all([mutateCompany(), mutateStatus()]);
      toast.success("Perusahaan berhasil dibuat");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Gagal membuat perusahaan");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Rocket className="h-5 w-5" />
          </div>
          <div>
            <CardTitle>Mulai dari sini</CardTitle>
            <CardDescription>
              Isi data perusahaan Anda untuk mulai menggunakan HRIS. Pengaturan lain akan aktif setelah ini.
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="gs-name">Nama Perusahaan *</Label>
            <Input
              id="gs-name"
              required
              maxLength={200}
              placeholder="PT Contoh Sejahtera"
              value={form.name}
              onChange={(e) => update("name", e.target.value)}
            />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="gs-legal">Nama Legal *</Label>
            <Input
              id="gs-legal"
              required
              maxLength={200}
              placeholder="PT Contoh Sejahtera Tbk."
              value={form.legalName}
              onChange={(e) => update("legalName", e.target.value)}
            />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="gs-address">Alamat *</Label>
            <Input
              id="gs-address"
              required
              maxLength={500}
              placeholder="Jl. Contoh No. 1"
              value={form.address}
              onChange={(e) => update("address", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="gs-city">Kota *</Label>
            <Input
              id="gs-city"
              required
              maxLength={100}
              placeholder="Jakarta Selatan"
              value={form.city}
              onChange={(e) => update("city", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="gs-province">Provinsi *</Label>
            <Select value={form.province} onValueChange={(v) => update("province", v ?? "")}>
              <SelectTrigger id="gs-province">
                <SelectValue placeholder="Pilih provinsi" />
              </SelectTrigger>
              <SelectContent>
                {PROVINCES.map((p) => (
                  <SelectItem key={p} value={p}>{p}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="gs-umr">UMR (Rp) *</Label>
            <Input
              id="gs-umr"
              required
              inputMode="numeric"
              placeholder="5.000.000"
              value={form.umrAmount}
              onChange={(e) => update("umrAmount", formatIDR(e.target.value))}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="gs-umr-region">Regional UMR *</Label>
            <Input
              id="gs-umr-region"
              required
              maxLength={100}
              placeholder="DKI Jakarta"
              value={form.umrRegion}
              onChange={(e) => update("umrRegion", e.target.value)}
            />
          </div>
          <div className="sm:col-span-2 flex justify-end pt-2">
            <Button type="submit" disabled={saving || !form.province}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Simpan & Lanjutkan
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
