"use client";

import useSWR from "swr";
import useSWRMutation from "swr/mutation";
import { fetcher, apiClient } from "@/lib/api-client";
import type { Attendance, OvertimeRequest } from "@prisma/client";
import type { ApiResponse } from "@/types/api";
import type { CheckInInput, CheckOutInput, OvertimeRequestInput } from "@/lib/validators/attendance";

type AttendanceWithEmployee = Attendance & {
  employee: { id: string; firstName: string; lastName: string; employeeNumber: string };
};

type AttendanceListResponse = {
  records: AttendanceWithEmployee[];
  meta: ApiResponse["meta"];
};

function buildQuery(params: Record<string, string | number | undefined>): string {
  const qs = Object.entries(params)
    .filter(([, v]) => v !== undefined && v !== "")
    .map(([k, v]) => `${k}=${encodeURIComponent(String(v))}`)
    .join("&");
  return qs ? `?${qs}` : "";
}

export function useAttendanceRecords(params: {
  page?: number;
  limit?: number;
  employeeId?: string;
  startDate?: string;
  endDate?: string;
  status?: string;
} = {}) {
  const query = buildQuery(params);
  const { data, error, isLoading, mutate } = useSWR<AttendanceListResponse>(
    `/api/attendance${query}`,
    fetcher
  );

  return {
    records: data?.records ?? [],
    meta: data?.meta,
    error,
    isLoading,
    mutate,
  };
}

export function useTodayAttendance(employeeId: string | null) {
  const { data, error, isLoading, mutate } = useSWR<AttendanceWithEmployee | null>(
    employeeId ? `/api/attendance/today?employeeId=${employeeId}` : null,
    fetcher
  );

  return { attendance: data, error, isLoading, mutate };
}

async function checkIn(url: string, { arg }: { arg: CheckInInput }) {
  return apiClient<AttendanceWithEmployee>(url, { method: "POST", body: arg });
}

async function checkOut(url: string, { arg }: { arg: CheckOutInput }) {
  return apiClient<AttendanceWithEmployee>(url, { method: "PATCH", body: arg });
}

export function useCheckIn() {
  return useSWRMutation("/api/attendance/check-in", checkIn);
}

export function useCheckOut(attendanceId: string) {
  return useSWRMutation(`/api/attendance/${attendanceId}/check-out`, checkOut);
}

export function useOvertimeRequests(params: {
  page?: number;
  employeeId?: string;
  status?: string;
} = {}) {
  const query = buildQuery(params);
  const { data, error, isLoading, mutate } = useSWR<{ requests: OvertimeRequest[]; meta: ApiResponse["meta"] }>(
    `/api/attendance/overtime${query}`,
    fetcher
  );

  return {
    requests: data?.requests ?? [],
    meta: data?.meta,
    error,
    isLoading,
    mutate,
  };
}

async function createOvertime(
  url: string,
  { arg }: { arg: OvertimeRequestInput }
) {
  return apiClient<OvertimeRequest>(url, { method: "POST", body: arg });
}

export function useCreateOvertime() {
  return useSWRMutation("/api/attendance/overtime", createOvertime);
}
