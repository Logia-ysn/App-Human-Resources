"use client";

import useSWR from "swr";
import { fetcher } from "@/lib/api-client";

export type DashboardStats = {
  totalEmployees: number;
  activeEmployees: number;
  attendance: {
    total: number;
    present: number;
    late: number;
    absent: number;
    sick: number;
    leave: number;
  };
  pendingLeave: number;
  newEmployees: {
    thisMonth: number;
    lastMonth: number;
    trend: number;
  };
};

export function useDashboardStats() {
  const { data, error, isLoading } = useSWR<DashboardStats>(
    "/api/dashboard/stats",
    fetcher,
    { refreshInterval: 60000 }
  );

  return { stats: data ?? null, error, isLoading };
}
