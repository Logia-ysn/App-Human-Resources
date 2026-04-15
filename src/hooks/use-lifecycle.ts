"use client";

import useSWR from "swr";
import { fetcher } from "@/lib/api-client";

export type LifecycleEventWithRelations = {
  id: string;
  employeeId: string;
  type: string;
  fromDepartment: string | null;
  toDepartment: string | null;
  fromPosition: string | null;
  toPosition: string | null;
  fromSalary: string | null;
  toSalary: string | null;
  effectiveDate: string;
  reason: string;
  employee: {
    id: string;
    firstName: string;
    lastName: string;
    employeeNumber: string;
    department: { name: string };
  };
  approvedBy: { id: string; firstName: string; lastName: string } | null;
};

export function useLifecycleEvents(params: { employeeId?: string; type?: string } = {}) {
  const qs = new URLSearchParams();
  if (params.employeeId) qs.set("employeeId", params.employeeId);
  if (params.type) qs.set("type", params.type);
  const query = qs.toString();
  const { data, error, isLoading, mutate } = useSWR<LifecycleEventWithRelations[]>(
    `/api/lifecycle/events${query ? `?${query}` : ""}`,
    fetcher,
  );
  return { events: data ?? [], error, isLoading, mutate };
}
