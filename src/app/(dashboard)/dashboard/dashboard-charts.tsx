"use client";

import {
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Area,
  AreaChart,
} from "recharts";

type AttendanceTrendPoint = {
  date: string;
  hadir: number;
  terlambat: number;
  tidakHadir: number;
  cuti: number;
};

type LeaveDistribution = {
  name: string;
  value: number;
  color: string;
};

const SERIES = {
  hadir: "var(--primary)",
  terlambat: "var(--warning)",
  tidakHadir: "var(--destructive)",
  cuti: "var(--info)",
} as const;

const TOOLTIP_STYLE = {
  backgroundColor: "var(--popover)",
  color: "var(--popover-foreground)",
  border: "1px solid var(--border)",
  borderRadius: "4px",
  fontSize: "12px",
  boxShadow: "0 1px 2px rgba(0,0,0,0.06)",
  padding: "6px 8px",
} as const;

type AttendanceChartProps = {
  readonly data: readonly AttendanceTrendPoint[];
};

export function AttendanceChart({ data }: AttendanceChartProps) {
  return (
    <div className="h-[220px] sm:h-[280px]">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={[...data]}
          margin={{ top: 5, right: 10, left: -10, bottom: 5 }}
        >
          <defs>
            <linearGradient id="gradHadir" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={SERIES.hadir} stopOpacity={0.18} />
              <stop offset="95%" stopColor={SERIES.hadir} stopOpacity={0} />
            </linearGradient>
            <linearGradient id="gradTerlambat" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={SERIES.terlambat} stopOpacity={0.15} />
              <stop offset="95%" stopColor={SERIES.terlambat} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="var(--border)"
            vertical={false}
          />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
            axisLine={{ stroke: "var(--border)" }}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
            axisLine={false}
            tickLine={false}
            allowDecimals={false}
          />
          <Tooltip contentStyle={TOOLTIP_STYLE} cursor={{ stroke: "var(--border)" }} />
          <Area
            type="monotone"
            dataKey="hadir"
            name="Hadir"
            stroke={SERIES.hadir}
            strokeWidth={1.75}
            fill="url(#gradHadir)"
            dot={{ r: 2.5, fill: SERIES.hadir, strokeWidth: 0 }}
            activeDot={{ r: 4, strokeWidth: 0 }}
          />
          <Area
            type="monotone"
            dataKey="terlambat"
            name="Terlambat"
            stroke={SERIES.terlambat}
            strokeWidth={1.75}
            fill="url(#gradTerlambat)"
            dot={{ r: 2.5, fill: SERIES.terlambat, strokeWidth: 0 }}
            activeDot={{ r: 4, strokeWidth: 0 }}
          />
          <Line
            type="monotone"
            dataKey="tidakHadir"
            name="Tidak Hadir"
            stroke={SERIES.tidakHadir}
            strokeWidth={1.75}
            dot={{ r: 2.5, fill: SERIES.tidakHadir, strokeWidth: 0 }}
            activeDot={{ r: 4, strokeWidth: 0 }}
          />
          <Line
            type="monotone"
            dataKey="cuti"
            name="Cuti"
            stroke={SERIES.cuti}
            strokeWidth={1.75}
            strokeDasharray="4 4"
            dot={{ r: 2.5, fill: SERIES.cuti, strokeWidth: 0 }}
            activeDot={{ r: 4, strokeWidth: 0 }}
          />
          <Legend
            iconType="circle"
            iconSize={8}
            wrapperStyle={{ fontSize: "11px", paddingTop: "8px", color: "var(--muted-foreground)" }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export type { AttendanceTrendPoint, LeaveDistribution };

type LeaveChartProps = {
  readonly data: readonly LeaveDistribution[];
};

export function LeaveChart({ data }: LeaveChartProps) {
  const total = data.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="flex flex-col items-center">
      <div className="h-[180px] w-full sm:h-[220px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={[...data]}
              cx="50%"
              cy="50%"
              innerRadius="48%"
              outerRadius="72%"
              paddingAngle={2}
              dataKey="value"
              stroke="var(--card)"
              strokeWidth={1}
            >
              {data.map((entry) => (
                <Cell key={entry.name} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={TOOLTIP_STYLE}
              formatter={(value) => [`${value} hari`, ""]}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-1 grid w-full grid-cols-2 gap-x-4 gap-y-1.5 px-2">
        {data.map((entry) => (
          <div key={entry.name} className="flex items-center gap-2 text-xs">
            <span
              className="inline-block h-2 w-2 shrink-0 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-muted-foreground">{entry.name}</span>
            <span className="ml-auto font-medium tabular-nums">
              {Math.round((entry.value / total) * 100)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
