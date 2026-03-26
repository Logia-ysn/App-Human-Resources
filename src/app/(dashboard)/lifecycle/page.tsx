"use client";

import { useState, useMemo } from "react";
import {
  TrendingUp,
  ArrowUpCircle,
  ArrowRightCircle,
  ArrowDownCircle,
  ShieldCheck,
  Search,
  ArrowRight,
} from "lucide-react";

import { useAppStore } from "@/lib/store/app-store";
import { type LifecycleEvent } from "@/lib/dummy-data";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const TYPE_CONFIG: Record<
  LifecycleEvent["type"],
  {
    label: string;
    color: string;
    badgeClass: string;
    dotClass: string;
    lineClass: string;
    icon: typeof ArrowUpCircle;
  }
> = {
  PROMOTION: {
    label: "Promosi",
    color: "green",
    badgeClass: "border-emerald-200 bg-emerald-50 text-emerald-700",
    dotClass: "bg-emerald-500 ring-emerald-100",
    lineClass: "bg-emerald-200",
    icon: ArrowUpCircle,
  },
  TRANSFER: {
    label: "Transfer",
    color: "blue",
    badgeClass: "border-blue-200 bg-blue-50 text-blue-700",
    dotClass: "bg-blue-500 ring-blue-100",
    lineClass: "bg-blue-200",
    icon: ArrowRightCircle,
  },
  DEMOTION: {
    label: "Demosi",
    color: "red",
    badgeClass: "border-red-200 bg-red-50 text-red-700",
    dotClass: "bg-red-500 ring-red-100",
    lineClass: "bg-red-200",
    icon: ArrowDownCircle,
  },
  CONFIRMATION: {
    label: "Konfirmasi",
    color: "amber",
    badgeClass: "border-amber-200 bg-amber-50 text-amber-700",
    dotClass: "bg-amber-500 ring-amber-100",
    lineClass: "bg-amber-200",
    icon: ShieldCheck,
  },
};

const ALL_TYPES: LifecycleEvent["type"][] = [
  "PROMOTION",
  "TRANSFER",
  "DEMOTION",
  "CONFIRMATION",
];

const formatCurrency = (n: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(n);

const formatDate = (dateStr: string) => {
  const date = new Date(dateStr);
  return date.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};

export default function LifecyclePage() {
  const lifecycleEvents = useAppStore((s) => s.lifecycleEvents);

  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("ALL");

  const filteredEvents = useMemo(() => {
    const sorted = [...lifecycleEvents].sort(
      (a, b) =>
        new Date(b.effectiveDate).getTime() -
        new Date(a.effectiveDate).getTime()
    );

    return sorted.filter((event) => {
      const matchesSearch =
        searchQuery === "" ||
        event.employeeName.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesType =
        typeFilter === "ALL" || event.type === typeFilter;
      return matchesSearch && matchesType;
    });
  }, [searchQuery, typeFilter]);

  const summary = useMemo(() => {
    const total = lifecycleEvents.length;
    const promotions = lifecycleEvents.filter(
      (e) => e.type === "PROMOTION"
    ).length;
    const transfers = lifecycleEvents.filter(
      (e) => e.type === "TRANSFER"
    ).length;
    const confirmations = lifecycleEvents.filter(
      (e) => e.type === "CONFIRMATION"
    ).length;
    return { total, promotions, transfers, confirmations };
  }, [lifecycleEvents]);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center gap-3">
        <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10">
          <TrendingUp className="size-5 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Riwayat Karir Karyawan
          </h1>
          <p className="text-sm text-muted-foreground">
            Lacak promosi, transfer, demosi, dan konfirmasi karyawan
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-t-2 border-t-blue-500 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
          <CardContent className="pt-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Total Riwayat
                </p>
                <p className="mt-1 text-2xl font-bold">{summary.total}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  peristiwa
                </p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50">
                <TrendingUp className="h-5 w-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-t-2 border-t-emerald-500 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
          <CardContent className="pt-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Promosi
                </p>
                <p className="mt-1 text-2xl font-bold">{summary.promotions}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  karyawan
                </p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50">
                <ArrowUpCircle className="h-5 w-5 text-emerald-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-t-2 border-t-blue-500 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
          <CardContent className="pt-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Transfer
                </p>
                <p className="mt-1 text-2xl font-bold">{summary.transfers}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  karyawan
                </p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50">
                <ArrowRightCircle className="h-5 w-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-t-2 border-t-amber-500 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
          <CardContent className="pt-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Konfirmasi
                </p>
                <p className="mt-1 text-2xl font-bold">
                  {summary.confirmations}
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  karyawan
                </p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-50">
                <ShieldCheck className="h-5 w-5 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="shadow-sm">
        <CardContent>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Cari nama karyawan..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select
              value={typeFilter}
              onValueChange={(val: string | null) =>
                setTypeFilter(val ?? "ALL")
              }
            >
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue placeholder="Semua Tipe" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Semua Tipe</SelectItem>
                {ALL_TYPES.map((type) => (
                  <SelectItem key={type} value={type}>
                    {TYPE_CONFIG[type].label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Timeline */}
      <Card className="shadow-sm">
        <CardContent>
          {filteredEvents.length === 0 ? (
            <div className="flex h-32 items-center justify-center text-muted-foreground">
              Tidak ada data riwayat karir yang sesuai filter.
            </div>
          ) : (
            <div className="relative">
              {filteredEvents.map((event, index) => {
                const config = TYPE_CONFIG[event.type];
                const IconComp = config.icon;
                const isLast = index === filteredEvents.length - 1;

                return (
                  <div key={event.id} className="relative flex gap-4 pb-8 last:pb-0">
                    {/* Timeline connector */}
                    <div className="flex flex-col items-center">
                      <div
                        className={`flex size-8 shrink-0 items-center justify-center rounded-full ring-4 ${config.dotClass}`}
                      >
                        <IconComp className="size-4 text-white" />
                      </div>
                      {!isLast && (
                        <div
                          className={`mt-1 w-0.5 flex-1 ${config.lineClass}`}
                        />
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 -mt-1">
                      <div className="rounded-lg border bg-background p-4 shadow-[0_1px_3px_rgba(0,0,0,0.04)] transition-colors hover:bg-muted/30">
                        {/* Header */}
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-sm font-semibold">
                            {event.employeeName}
                          </span>
                          <Badge
                            variant="outline"
                            className={config.badgeClass}
                          >
                            {config.label}
                          </Badge>
                          <span className="ml-auto text-xs text-muted-foreground">
                            {formatDate(event.effectiveDate)}
                          </span>
                        </div>

                        {/* Position / Department change */}
                        <div className="mt-3 space-y-1.5">
                          {(event.fromPosition || event.toPosition) && (
                            <div className="flex flex-wrap items-center gap-1.5 text-sm">
                              <span className="text-muted-foreground">
                                Jabatan:
                              </span>
                              {event.fromPosition && (
                                <span className="rounded bg-muted px-1.5 py-0.5 text-xs">
                                  {event.fromPosition}
                                </span>
                              )}
                              {event.fromPosition && event.toPosition && (
                                <ArrowRight className="size-3 text-muted-foreground" />
                              )}
                              {event.toPosition && (
                                <span className="rounded bg-primary/10 px-1.5 py-0.5 text-xs font-medium text-primary">
                                  {event.toPosition}
                                </span>
                              )}
                            </div>
                          )}
                          {(event.fromDepartment || event.toDepartment) && (
                            <div className="flex flex-wrap items-center gap-1.5 text-sm">
                              <span className="text-muted-foreground">
                                Departemen:
                              </span>
                              {event.fromDepartment && (
                                <span className="rounded bg-muted px-1.5 py-0.5 text-xs">
                                  {event.fromDepartment}
                                </span>
                              )}
                              {event.fromDepartment && event.toDepartment && (
                                <ArrowRight className="size-3 text-muted-foreground" />
                              )}
                              {event.toDepartment && (
                                <span className="rounded bg-primary/10 px-1.5 py-0.5 text-xs font-medium text-primary">
                                  {event.toDepartment}
                                </span>
                              )}
                            </div>
                          )}
                          {event.fromSalary != null &&
                            event.toSalary != null && (
                              <div className="flex flex-wrap items-center gap-1.5 text-sm">
                                <span className="text-muted-foreground">
                                  Gaji:
                                </span>
                                <span className="rounded bg-muted px-1.5 py-0.5 text-xs">
                                  {formatCurrency(event.fromSalary)}
                                </span>
                                <ArrowRight className="size-3 text-muted-foreground" />
                                <span className="rounded bg-primary/10 px-1.5 py-0.5 text-xs font-medium text-primary">
                                  {formatCurrency(event.toSalary)}
                                </span>
                              </div>
                            )}
                        </div>

                        {/* Reason + Approver */}
                        <div className="mt-3 border-t pt-3">
                          <p className="text-sm text-muted-foreground">
                            <span className="font-medium text-foreground">
                              Alasan:
                            </span>{" "}
                            {event.reason}
                          </p>
                          <p className="mt-1 text-xs text-muted-foreground">
                            Disetujui oleh{" "}
                            <span className="font-medium text-foreground">
                              {event.approvedBy}
                            </span>
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
