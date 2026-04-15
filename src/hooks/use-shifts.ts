"use client";

import useSWR from "swr";
import { fetcher } from "@/lib/api-client";

export type ShiftType = {
  id: string;
  name: string;
  startTime: string;
  endTime: string;
  breakDuration: number;
  color: string;
  isActive: boolean;
};

export type ShiftAssignmentWithRelations = {
  id: string;
  employeeId: string;
  shiftId: string;
  startDate: string;
  endDate: string | null;
  isActive: boolean;
  employee: {
    id: string;
    firstName: string;
    lastName: string;
    employeeNumber: string;
    department: { name: string };
  };
  shift: {
    id: string;
    name: string;
    startTime: string;
    endTime: string;
    color: string;
  };
};

export function useShiftTypes() {
  const { data, error, isLoading, mutate } = useSWR<ShiftType[]>(
    "/api/shifts/types",
    fetcher,
  );
  return { shiftTypes: data ?? [], error, isLoading, mutate };
}

export function useShiftAssignments(params: { employeeId?: string; activeOnly?: boolean } = {}) {
  const qs = new URLSearchParams();
  if (params.employeeId) qs.set("employeeId", params.employeeId);
  if (params.activeOnly) qs.set("activeOnly", "true");
  const query = qs.toString();
  const { data, error, isLoading, mutate } = useSWR<ShiftAssignmentWithRelations[]>(
    `/api/shifts/assignments${query ? `?${query}` : ""}`,
    fetcher,
  );
  return { assignments: data ?? [], error, isLoading, mutate };
}
