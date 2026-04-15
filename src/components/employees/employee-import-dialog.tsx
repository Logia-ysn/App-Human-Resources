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

const TEMPLATE_HEADERS = [
  "employeeNumber",
  "firstName",
  "lastName",
  "email",
  "phone",
  "gender",
  "dateOfBirth",
  "placeOfBirth",
  "religion",
  "maritalStatus",
  "dependents",
  "nik",
  "npwp",
  "bpjsKesNumber",
  "bpjsTkNumber",
  "bankName",
  "bankAccountNo",
  "bankAccountName",
  "address",
  "city",
  "province",
  "postalCode",
  "emergencyName",
  "emergencyPhone",
  "emergencyRelation",
  "departmentCode",
  "positionCode",
  "managerEmployeeNumber",
  "status",
  "type",
  "joinDate",
  "endDate",
  "ptkpStatus",
  "taxMethod",
];

const TEMPLATE_EXAMPLE = [
  "",
  "Budi",
  "Santoso",
  "budi@contoh.com",
  "081234567890",
  "MALE",
  "1990-05-15",
  "Jakarta",
  "ISLAM",
  "MARRIED",
  "2",
  "3171234567890001",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "Jakarta",
  "DKI Jakarta",
  "",
  "",
  "",
  "",
  "IT",
  "IT-STAFF",
  "",
  "ACTIVE",
  "PERMANENT",
  "2024-01-15",
  "",
  "K2",
  "GROSS",
];

function downloadTemplate() {
  const bom = "\uFEFF";
  const csv =
    TEMPLATE_HEADERS.join(",") + "\r\n" + TEMPLATE_EXAMPLE.map((v) => (v.includes(",") ? `"${v}"` : v)).join(",");
  const blob = new Blob([bom + csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "template-employees.csv";
  a.click();
  URL.revokeObjectURL(url);
}

export function EmployeeImportDialog({ onDone }: { onDone?: () => void }) {
  const [open, setOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);

  async function handleFile(file: File) {
    setUploading(true);
    setResult(null);
    try {
      const csv = await file.text();
      const res = await apiClient<ImportResult>("/api/employees/import", {
        method: "POST",
        body: { csv },
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
          <DialogTitle>Import Karyawan dari CSV</DialogTitle>
          <DialogDescription>
            Upload file CSV untuk menambahkan banyak karyawan sekaligus. Email & NIK duplikat akan dilewati.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="rounded-sm border border-dashed border-border p-4 bg-muted/40">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <FileText className="h-5 w-5 text-muted-foreground" />
                <div className="text-sm">
                  <p className="font-medium">Template CSV</p>
                  <p className="text-xs text-muted-foreground">
                    Download template dan isi sesuai format
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
                  <p className="text-sm font-medium">Klik untuk pilih file CSV</p>
                  <p className="text-xs text-muted-foreground">
                    Kolom wajib: firstName, lastName, email, nik, dateOfBirth, placeOfBirth, gender,
                    maritalStatus, departmentCode, positionCode, joinDate, type, ptkpStatus
                  </p>
                </>
              )}
              <input
                id="csv-upload"
                type="file"
                accept=".csv,text/csv"
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
