"use client";

import useSWR from "swr";
import useSWRMutation from "swr/mutation";
import { fetcher, apiClient } from "@/lib/api-client";
import type { CreateExpenseClaimInput } from "@/lib/validators/expense";

export type EmployeeAdvanceWithRelations = {
  id: string;
  employeeId: string;
  amount: string;
  purpose: string;
  requestDate: string;
  status: string;
  approvedDate: string | null;
  returnedAmount: string;
  notes: string | null;
  employee: {
    id: string;
    firstName: string;
    lastName: string;
    employeeNumber: string;
    department: { name: string };
  };
  approvedBy: { id: string; firstName: string; lastName: string } | null;
};

export type ExpenseClaimWithRelations = {
  id: string;
  employeeId: string;
  title: string;
  totalAmount: string;
  status: string;
  submittedDate: string;
  approvedDate: string | null;
  employee: {
    id: string;
    firstName: string;
    lastName: string;
    employeeNumber: string;
    department: { name: string };
  };
  approvedBy: { id: string; firstName: string; lastName: string } | null;
  items: Array<{
    id: string;
    description: string;
    amount: string;
    category: string;
    date: string;
  }>;
};

export function useAdvances(params: { status?: string; employeeId?: string } = {}) {
  const qs = new URLSearchParams();
  if (params.status) qs.set("status", params.status);
  if (params.employeeId) qs.set("employeeId", params.employeeId);
  const query = qs.toString();
  const { data, error, isLoading, mutate } = useSWR<EmployeeAdvanceWithRelations[]>(
    `/api/expenses/advances${query ? `?${query}` : ""}`,
    fetcher,
  );
  return { advances: data ?? [], error, isLoading, mutate };
}

export function useClaims(params: { status?: string; employeeId?: string } = {}) {
  const qs = new URLSearchParams();
  if (params.status) qs.set("status", params.status);
  if (params.employeeId) qs.set("employeeId", params.employeeId);
  const query = qs.toString();
  const { data, error, isLoading, mutate } = useSWR<ExpenseClaimWithRelations[]>(
    `/api/expenses/claims${query ? `?${query}` : ""}`,
    fetcher,
  );
  return { claims: data ?? [], error, isLoading, mutate };
}

async function createClaim(
  url: string,
  { arg }: { arg: CreateExpenseClaimInput },
) {
  return apiClient<ExpenseClaimWithRelations>(url, { method: "POST", body: arg });
}

export function useCreateClaim() {
  return useSWRMutation("/api/expenses/claims", createClaim);
}
