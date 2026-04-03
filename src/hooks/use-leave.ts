"use client";

import useSWR from "swr";
import useSWRMutation from "swr/mutation";
import { fetcher, apiClient } from "@/lib/api-client";
import type { LeaveRequest, LeaveBalance, LeaveType } from "@prisma/client";
import type { CreateLeaveRequestInput, ApproveLeaveInput } from "@/lib/validators/leave";

type LeaveRequestWithRelations = LeaveRequest & {
  employee: {
    id: string; firstName: string; lastName: string; employeeNumber: string;
    department: { id: string; name: string };
  };
  leaveType: { id: string; name: string; code: string };
};

type PaginationMeta = {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

type LeaveListResponse = {
  requests: LeaveRequestWithRelations[];
  meta: PaginationMeta;
};

type LeaveBalanceWithRelations = LeaveBalance & {
  employee: { id: string; firstName: string; lastName: string; employeeNumber: string };
  leaveType: { id: string; name: string; code: string; defaultQuota: number };
};

function buildQuery(params: Record<string, string | number | undefined>): string {
  const qs = Object.entries(params)
    .filter(([, v]) => v !== undefined && v !== "")
    .map(([k, v]) => `${k}=${encodeURIComponent(String(v))}`)
    .join("&");
  return qs ? `?${qs}` : "";
}

export function useLeaveRequests(params: {
  page?: number;
  limit?: number;
  status?: string;
  employeeId?: string;
} = {}) {
  const query = buildQuery(params);
  const { data, error, isLoading, mutate } = useSWR<LeaveListResponse>(
    `/api/leave/requests${query}`,
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

export function useLeaveTypes() {
  const { data, error, isLoading } = useSWR<LeaveType[]>(
    "/api/leave/types",
    fetcher
  );

  return { leaveTypes: data ?? [], error, isLoading };
}

export function useLeaveBalances(params: {
  employeeId?: string | null;
  year?: number;
} = {}) {
  const query = buildQuery({
    ...(params.employeeId && { employeeId: params.employeeId }),
    ...(params.year && { year: params.year }),
  });

  const { data, error, isLoading, mutate } = useSWR<LeaveBalanceWithRelations[]>(
    `/api/leave/balances${query}`,
    fetcher
  );

  return { balances: data ?? [], error, isLoading, mutate };
}

async function createLeaveRequest(
  url: string,
  { arg }: { arg: CreateLeaveRequestInput }
) {
  return apiClient<LeaveRequestWithRelations>(url, { method: "POST", body: arg });
}

async function approveLeave(
  url: string,
  { arg }: { arg: ApproveLeaveInput }
) {
  return apiClient<LeaveRequestWithRelations>(url, { method: "PATCH", body: arg });
}

export function useCreateLeaveRequest() {
  return useSWRMutation("/api/leave/requests", createLeaveRequest);
}

export function useApproveLeave(id: string) {
  return useSWRMutation(`/api/leave/requests/${id}/approve`, approveLeave);
}
