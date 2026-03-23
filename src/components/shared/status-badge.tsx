import { Badge } from "@/components/ui/badge";
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

const VARIANT_STYLES: Record<StatusVariant, string> = {
  default: "bg-blue-50 text-blue-700 border-blue-200",
  success: "bg-emerald-50 text-emerald-700 border-emerald-200",
  warning: "bg-amber-50 text-amber-700 border-amber-200",
  destructive: "bg-red-50 text-red-700 border-red-200",
  secondary: "bg-slate-50 text-slate-600 border-slate-200",
};

const DOT_STYLES: Record<StatusVariant, string> = {
  default: "bg-blue-500",
  success: "bg-emerald-500",
  warning: "bg-amber-500",
  destructive: "bg-red-500",
  secondary: "bg-slate-400",
};

export function StatusBadge({ status }: { status: string }) {
  const config = STATUS_MAP[status] || { label: status, variant: "secondary" as StatusVariant };

  return (
    <Badge
      variant="outline"
      className={cn(
        "gap-1.5 font-medium text-xs px-2.5 py-0.5",
        VARIANT_STYLES[config.variant]
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", DOT_STYLES[config.variant])} />
      {config.label}
    </Badge>
  );
}
