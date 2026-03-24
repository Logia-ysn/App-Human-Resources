import { Card, CardContent } from "@/components/ui/card";
import type { LucideIcon } from "lucide-react";

type StatCardProps = {
  label: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  color?: "blue" | "emerald" | "amber" | "red" | "purple" | "indigo";
  href?: string;
};

const COLOR_MAP = {
  blue: {
    border: "border-t-blue-500",
    iconBg: "bg-blue-50",
    iconText: "text-blue-600",
  },
  emerald: {
    border: "border-t-emerald-500",
    iconBg: "bg-emerald-50",
    iconText: "text-emerald-600",
  },
  amber: {
    border: "border-t-amber-500",
    iconBg: "bg-amber-50",
    iconText: "text-amber-600",
  },
  red: {
    border: "border-t-red-500",
    iconBg: "bg-red-50",
    iconText: "text-red-600",
  },
  purple: {
    border: "border-t-purple-500",
    iconBg: "bg-purple-50",
    iconText: "text-purple-600",
  },
  indigo: {
    border: "border-t-indigo-500",
    iconBg: "bg-indigo-50",
    iconText: "text-indigo-600",
  },
} as const;

export function StatCard({
  label,
  value,
  subtitle,
  icon: Icon,
  color = "blue",
}: StatCardProps) {
  const colors = COLOR_MAP[color];

  return (
    <Card
      className={`border-t-2 ${colors.border} shadow-[0_1px_3px_rgba(0,0,0,0.06)]`}
    >
      <CardContent className="pt-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              {label}
            </p>
            <p className="mt-1 text-2xl font-bold">{value}</p>
            {subtitle && (
              <p className="mt-0.5 text-xs text-muted-foreground">
                {subtitle}
              </p>
            )}
          </div>
          <div
            className={`flex h-10 w-10 items-center justify-center rounded-lg ${colors.iconBg}`}
          >
            <Icon className={`h-5 w-5 ${colors.iconText}`} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
