"use client";

import useSWR from "swr";
import useSWRMutation from "swr/mutation";
import { fetcher, apiClient } from "@/lib/api-client";
import type { Employee } from "@prisma/client";
import type { CreateEmployeeInput, UpdateEmployeeInput } from "@/lib/validators/employee";

type EmployeeWithRelations = Employee & {
  department: { id: string; name: string; code: string };
  position: { id: string; name: string; code: string };
  manager: { id: string; firstName: string; lastName: string } | null;
};

type PaginationMeta = {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

type EmployeeListResponse = {
  employees: EmployeeWithRelations[];
  meta: PaginationMeta;
};

function buildQuery(params: Record<string, string | number | undefined>): string {
  const qs = Object.entries(params)
    .filter(([, v]) => v !== undefined && v !== "")
    .map(([k, v]) => `${k}=${encodeURIComponent(String(v))}`)
    .join("&");
  return qs ? `?${qs}` : "";
}

export function useEmployees(params: {
  page?: number;
  limit?: number;
  search?: string;
  departmentId?: string;
  status?: string;
  type?: string;
} = {}) {
  const query = buildQuery(params);
  const { data, error, isLoading, mutate } = useSWR<EmployeeListResponse>(
    `/api/employees${query}`,
    fetcher
  );

  return {
    employees: data?.employees ?? [],
    meta: data?.meta,
    error,
    isLoading,
    mutate,
  };
}

export function useEmployee(id: string | null) {
  const { data, error, isLoading, mutate } = useSWR<EmployeeWithRelations>(
    id ? `/api/employees/${id}` : null,
    fetcher
  );

  return { employee: data, error, isLoading, mutate };
}

async function createEmployee(
  url: string,
  { arg }: { arg: CreateEmployeeInput }
) {
  return apiClient<EmployeeWithRelations>(url, { method: "POST", body: arg });
}

async function updateEmployee(
  url: string,
  { arg }: { arg: UpdateEmployeeInput }
) {
  return apiClient<EmployeeWithRelations>(url, { method: "PATCH", body: arg });
}

async function deleteEmployee(url: string) {
  return apiClient<{ id: string }>(url, { method: "DELETE" });
}

export function useCreateEmployee() {
  return useSWRMutation("/api/employees", createEmployee);
}

export function useUpdateEmployee(id: string) {
  return useSWRMutation(`/api/employees/${id}`, updateEmployee);
}

export function useDeleteEmployee(id: string) {
  return useSWRMutation(`/api/employees/${id}`, deleteEmployee);
}
