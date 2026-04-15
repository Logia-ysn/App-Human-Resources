"use client";

import useSWR from "swr";
import { fetcher } from "@/lib/api-client";

export type ReviewCycleWithCount = {
  id: string;
  name: string;
  type: string;
  startDate: string;
  endDate: string;
  selfReviewDeadline: string;
  managerReviewDeadline: string;
  status: string;
  _count: { reviews: number };
};

export type PerformanceReviewWithRelations = {
  id: string;
  reviewCycleId: string;
  employeeId: string;
  reviewerId: string;
  status: string;
  selfScore: string | null;
  managerScore: string | null;
  finalScore: string | null;
  rating: string | null;
  reviewCycle: { id: string; name: string; type: string };
  employee: {
    id: string;
    firstName: string;
    lastName: string;
    employeeNumber: string;
    department: { name: string };
  };
  reviewer: { id: string; firstName: string; lastName: string };
  kpis: Array<{ id: string; kpiName: string; weight: string; score: string | null }>;
};

export function useReviewCycles() {
  const { data, error, isLoading, mutate } = useSWR<ReviewCycleWithCount[]>(
    "/api/performance/cycles",
    fetcher,
  );
  return { cycles: data ?? [], error, isLoading, mutate };
}

export function usePerformanceReviews(params: { cycleId?: string; employeeId?: string } = {}) {
  const qs = new URLSearchParams();
  if (params.cycleId) qs.set("cycleId", params.cycleId);
  if (params.employeeId) qs.set("employeeId", params.employeeId);
  const query = qs.toString();
  const { data, error, isLoading, mutate } = useSWR<PerformanceReviewWithRelations[]>(
    `/api/performance/reviews${query ? `?${query}` : ""}`,
    fetcher,
  );
  return { reviews: data ?? [], error, isLoading, mutate };
}
