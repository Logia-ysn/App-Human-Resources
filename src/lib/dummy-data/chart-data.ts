// Attendance trend data for last 7 days
export type AttendanceTrendPoint = {
  date: string;
  hadir: number;
  terlambat: number;
  tidakHadir: number;
  cuti: number;
};

export const attendanceTrend: AttendanceTrendPoint[] = [
  { date: "17 Mar", hadir: 12, terlambat: 2, tidakHadir: 1, cuti: 0 },
  { date: "18 Mar", hadir: 11, terlambat: 1, tidakHadir: 2, cuti: 1 },
  { date: "19 Mar", hadir: 13, terlambat: 0, tidakHadir: 1, cuti: 1 },
  { date: "20 Mar", hadir: 10, terlambat: 3, tidakHadir: 1, cuti: 1 },
  { date: "21 Mar", hadir: 12, terlambat: 1, tidakHadir: 0, cuti: 2 },
  { date: "22 Mar", hadir: 11, terlambat: 2, tidakHadir: 1, cuti: 1 },
  { date: "23 Mar", hadir: 12, terlambat: 1, tidakHadir: 1, cuti: 1 },
];

// Leave distribution by type
export type LeaveDistribution = {
  name: string;
  value: number;
  color: string;
};

export const leaveDistribution: LeaveDistribution[] = [
  { name: "Cuti Tahunan", value: 18, color: "#3B82F6" },
  { name: "Cuti Sakit", value: 8, color: "#F59E0B" },
  { name: "Cuti Melahirkan", value: 2, color: "#EC4899" },
  { name: "Cuti Menikah", value: 3, color: "#8B5CF6" },
  { name: "Cuti Duka", value: 1, color: "#6B7280" },
  { name: "Tanpa Gaji", value: 2, color: "#EF4444" },
];
