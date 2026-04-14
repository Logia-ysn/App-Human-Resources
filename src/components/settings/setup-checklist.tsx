"use client";

import Link from "next/link";
import { Check, Circle, ArrowRight, ListChecks } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useSetupStatus } from "@/hooks/use-settings";

type Step = {
  label: string;
  description: string;
  href: string;
  cta: string;
  done: boolean;
};

export function SetupChecklist() {
  const { status, isLoading } = useSetupStatus();

  if (isLoading || !status || status.complete) return null;
  if (!status.company) return null;

  const steps: Step[] = [
    {
      label: "Buat Departemen",
      description: "Kelompokkan karyawan berdasarkan divisi/fungsi kerja.",
      href: "/departments",
      cta: "Tambah Departemen",
      done: status.departments > 0,
    },
    {
      label: "Buat Jabatan",
      description: "Definisikan posisi/jabatan untuk setiap departemen.",
      href: "/positions",
      cta: "Tambah Jabatan",
      done: status.positions > 0,
    },
    {
      label: "Tambah Karyawan",
      description: "Daftarkan karyawan pertama Anda untuk memulai operasional.",
      href: "/employees",
      cta: "Tambah Karyawan",
      done: status.employees > 0,
    },
  ];

  const completed = steps.filter((s) => s.done).length;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <ListChecks className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <CardTitle>Langkah Berikutnya</CardTitle>
            <CardDescription>
              {completed} dari {steps.length} langkah selesai. Lengkapi untuk mulai memakai HRIS.
            </CardDescription>
          </div>
          <span className="text-sm font-medium text-muted-foreground">
            {completed}/{steps.length}
          </span>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {steps.map((step) => (
          <div
            key={step.href}
            className="flex flex-col gap-3 rounded-lg border p-3 sm:flex-row sm:items-center"
          >
            <div
              className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${
                step.done
                  ? "bg-primary text-primary-foreground"
                  : "border-2 border-muted-foreground/30 text-muted-foreground"
              }`}
              aria-hidden
            >
              {step.done ? <Check className="h-4 w-4" /> : <Circle className="h-3 w-3" />}
            </div>
            <div className="flex-1">
              <p className={`text-sm font-medium ${step.done ? "line-through text-muted-foreground" : ""}`}>
                {step.label}
              </p>
              <p className="text-xs text-muted-foreground">{step.description}</p>
            </div>
            {!step.done && (
              <Link
                href={step.href}
                className="inline-flex h-7 items-center rounded-[min(var(--radius-md),12px)] border border-border bg-background px-2.5 text-[0.8rem] font-medium hover:bg-muted focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                {step.cta}
                <ArrowRight className="ml-1 h-3.5 w-3.5" />
              </Link>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
