import { cn } from "@/lib/utils";

type StatusVariant = "default" | "success" | "warning" | "destructive" | "secondary";

const STATUS_MAP: Record<string, { label: string; variant: StatusVariant }> = {
  ACTIVE: { label: "Aktif", variant: "success" },
  PROBATION: { label: "Probation", variant: "warning" },
  RESIGNED: { label: "Resign", variant: "secondary" },
  TERMINATED: { label: "Diberhentikan", variant: "destructive" },
  RETIRED: { label: "Pensiun", variant: "secondary" },
  PENDING: { label: "Menunggu", variant: "warning" },
  APPROVED: { label: "Disetujui", variant: "success" },
  REJECTED: { label: "Ditolak", variant: "destructive" },
  CANCELLED: { label: "Dibatalkan", variant: "secondary" },
  DRAFT: { label: "Draft", variant: "secondary" },
  PROCESSING: { label: "Proses", variant: "warning" },
  CALCULATED: { label: "Dihitung", variant: "default" },
  PAID: { label: "Dibayar", variant: "success" },
  PRESENT: { label: "Hadir", variant: "success" },
  ABSENT: { label: "Tidak Hadir", variant: "destructive" },
  LATE: { label: "Terlambat", variant: "warning" },
  LEAVE: { label: "Cuti", variant: "default" },
  HOLIDAY: { label: "Libur", variant: "secondary" },
  SICK: { label: "Sakit", variant: "warning" },
  BUSINESS_TRIP: { label: "Dinas", variant: "default" },
  PUBLISHED: { label: "Dipublikasi", variant: "success" },
  CLOSED: { label: "Ditutup", variant: "secondary" },
  ON_HOLD: { label: "Ditunda", variant: "warning" },
  NEW: { label: "Baru", variant: "default" },
  SCREENING: { label: "Screening", variant: "warning" },
  SHORTLISTED: { label: "Shortlist", variant: "success" },
  INTERVIEW: { label: "Interview", variant: "default" },
  OFFERED: { label: "Ditawarkan", variant: "success" },
  ACCEPTED: { label: "Diterima", variant: "success" },
  WITHDRAWN: { label: "Mengundurkan", variant: "secondary" },
};

const DOT_STYLES: Record<StatusVariant, string> = {
  default: "bg-[var(--info)]",
  success: "bg-[var(--success)]",
  warning: "bg-[var(--warning)]",
  destructive: "bg-destructive",
  secondary: "bg-muted-foreground/60",
};

export function StatusBadge({ status }: { status: string }) {
  const config = STATUS_MAP[status] || { label: status, variant: "secondary" as StatusVariant };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-sm border border-border bg-muted/60 px-2 py-0.5",
        "text-[11px] font-medium text-foreground tracking-tight whitespace-nowrap"
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full shrink-0", DOT_STYLES[config.variant])} />
      {config.label}
    </span>
  );
}
