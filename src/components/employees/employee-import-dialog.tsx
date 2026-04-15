"use client";

import { useState } from "react";
import { Upload, Loader2, FileText } from "lucide-react";
import { toast } from "sonner";

import { apiClient } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

type RowResult = {
  row: number;
  employeeNumber?: string;
  name?: string;
  status: "created" | "skipped" | "error";
  message?: string;
};

type ImportResult = {
  total: number;
  created: number;
  skipped: number;
  errors: number;
  results: RowResult[];
};

async function downloadTemplate() {
  const res = await fetch("/api/employees/template");
  if (!res.ok) {
    toast.error(res.status === 403 ? "Tidak memiliki akses" : `Gagal download template (${res.status})`);
    return;
  }
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "template-employees.xlsx";
  a.click();
  URL.revokeObjectURL(url);
}

async function fileToBase64(file: File): Promise<string> {
  const buf = await file.arrayBuffer();
  let binary = "";
  const bytes = new Uint8Array(buf);
  const chunkSize = 0x8000;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
  }
  return btoa(binary);
}

export function EmployeeImportDialog({ onDone }: { onDone?: () => void }) {
  const [open, setOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);

  async function handleFile(file: File) {
    setUploading(true);
    setResult(null);
    try {
      const isXlsx = /\.xlsx$/i.test(file.name) || file.type.includes("spreadsheetml");
      const body = isXlsx
        ? { xlsxBase64: await fileToBase64(file) }
        : { csv: await file.text() };
      const res = await apiClient<ImportResult>("/api/employees/import", {
        method: "POST",
        body,
      });
      setResult(res);
      if (res.created > 0) {
        toast.success(`Berhasil import ${res.created} karyawan`);
      }
      if (res.errors > 0) {
        toast.error(`${res.errors} baris gagal — cek laporan`);
      }
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Gagal import");
    } finally {
      setUploading(false);
    }
  }

  function handleClose() {
    if (result && result.created > 0) {
      onDone?.();
    }
    setOpen(false);
    setResult(null);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button variant="outline" />}>
        <Upload data-icon="inline-start" />
        Import
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Import Karyawan</DialogTitle>
          <DialogDescription>
            Upload file Excel (.xlsx) atau CSV untuk menambahkan banyak karyawan sekaligus. Email & NIK duplikat akan dilewati.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="rounded-sm border border-dashed border-border p-4 bg-muted/40">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <FileText className="h-5 w-5 text-muted-foreground" />
                <div className="text-sm">
                  <p className="font-medium">Template Excel</p>
                  <p className="text-xs text-muted-foreground">
                    Download template .xlsx lalu isi sesuai format
                  </p>
                </div>
              </div>
              <Button variant="outline" size="sm" onClick={downloadTemplate}>
                Download Template
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <label
              htmlFor="csv-upload"
              className="flex flex-col items-center justify-center gap-2 rounded-sm border border-dashed border-border p-6 cursor-pointer hover:bg-muted/50 transition-colors"
            >
              {uploading ? (
                <>
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">Memproses...</p>
                </>
              ) : (
                <>
                  <Upload className="h-8 w-8 text-muted-foreground" />
                  <p className="text-sm font-medium">Klik untuk pilih file .xlsx atau .csv</p>
                  <p className="text-xs text-muted-foreground text-center">
                    Wajib: <span className="font-medium">namaLengkap</span>. Kolom lain opsional —
                    akan diisi default otomatis.
                  </p>
                </>
              )}
              <input
                id="csv-upload"
                type="file"
                accept=".csv,.xlsx,text/csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                disabled={uploading}
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFile(file);
                  e.target.value = "";
                }}
              />
            </label>
          </div>

          {result && (
            <div className="space-y-3">
              <div className="grid grid-cols-4 gap-2">
                <div className="rounded-sm border border-border bg-muted/60 p-3 text-center">
                  <p className="text-2xl font-semibold tabular-nums">{result.total}</p>
                  <p className="text-xs text-muted-foreground">Total</p>
                </div>
                <div className="rounded-sm border border-border bg-muted/60 p-3 text-center">
                  <div className="flex items-center justify-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-[var(--success)]" aria-hidden />
                    <p className="text-2xl font-semibold tabular-nums">{result.created}</p>
                  </div>
                  <p className="text-xs text-muted-foreground">Berhasil</p>
                </div>
                <div className="rounded-sm border border-border bg-muted/60 p-3 text-center">
                  <div className="flex items-center justify-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-[var(--warning)]" aria-hidden />
                    <p className="text-2xl font-semibold tabular-nums">{result.skipped}</p>
                  </div>
                  <p className="text-xs text-muted-foreground">Dilewati</p>
                </div>
                <div className="rounded-sm border border-border bg-muted/60 p-3 text-center">
                  <div className="flex items-center justify-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-destructive" aria-hidden />
                    <p className="text-2xl font-semibold tabular-nums">{result.errors}</p>
                  </div>
                  <p className="text-xs text-muted-foreground">Gagal</p>
                </div>
              </div>

              {result.results.some((r) => r.status !== "created") && (
                <div className="rounded-sm border border-border max-h-64 overflow-y-auto">
                  <table className="w-full text-xs">
                    <thead className="bg-muted/50 sticky top-0">
                      <tr>
                        <th className="px-2 py-1.5 text-left">Baris</th>
                        <th className="px-2 py-1.5 text-left">Status</th>
                        <th className="px-2 py-1.5 text-left">Keterangan</th>
                      </tr>
                    </thead>
                    <tbody>
                      {result.results
                        .filter((r) => r.status !== "created")
                        .map((r, i) => (
                          <tr key={i} className="border-t">
                            <td className="px-2 py-1.5 font-mono">{r.row}</td>
                            <td className="px-2 py-1.5">
                              <span className="inline-flex items-center gap-1.5 rounded-sm border border-border bg-muted/60 px-2 py-0.5 text-xs">
                                <span
                                  className={
                                    r.status === "skipped"
                                      ? "h-1.5 w-1.5 rounded-full bg-[var(--warning)]"
                                      : "h-1.5 w-1.5 rounded-full bg-destructive"
                                  }
                                  aria-hidden
                                />
                                {r.status === "skipped" ? "Dilewati" : "Gagal"}
                              </span>
                            </td>
                            <td className="px-2 py-1.5 text-muted-foreground">{r.message}</td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            {result ? "Tutup" : "Batal"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
