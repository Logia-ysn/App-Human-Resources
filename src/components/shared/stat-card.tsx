import { Card, CardContent } from "@/components/ui/card";
import type { LucideIcon } from "lucide-react";

type StatCardProps = {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  color?: "blue" | "emerald" | "amber" | "rose" | "violet" | "indigo";
  trend?: { value: string; positive: boolean };
  href?: string;
};

const COLOR_MAP = {
  blue: {
    iconBg: "bg-blue-100",
    iconText: "text-blue-600",
  },
  emerald: {
    iconBg: "bg-emerald-100",
    iconText: "text-emerald-600",
  },
  amber: {
    iconBg: "bg-amber-100",
    iconText: "text-amber-600",
  },
  rose: {
    iconBg: "bg-rose-100",
    iconText: "text-rose-600",
  },
  violet: {
    iconBg: "bg-violet-100",
    iconText: "text-violet-600",
  },
  indigo: {
    iconBg: "bg-indigo-100",
    iconText: "text-indigo-600",
  },
} as const;

export function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  color = "blue",
  trend,
}: StatCardProps) {
  const colors = COLOR_MAP[color];

  return (
    <Card className="shadow-card hover:shadow-soft transition-shadow duration-200">
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${colors.iconBg}`}
          >
            <Icon className={`h-5 w-5 ${colors.iconText}`} />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-medium text-muted-foreground truncate">
              {title}
            </p>
            <div className="flex items-baseline gap-2">
              <p className="text-2xl font-bold leading-tight">{value}</p>
              {trend && (
                <span
                  className={`text-xs font-semibold ${
                    trend.positive ? "text-emerald-600" : "text-rose-600"
                  }`}
                >
                  {trend.value}
                </span>
              )}
            </div>
            {subtitle && (
              <p className="mt-0.5 text-[11px] text-muted-foreground truncate">
                {subtitle}
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
