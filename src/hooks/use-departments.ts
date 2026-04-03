"use client";

import useSWR from "swr";
import useSWRMutation from "swr/mutation";
import { fetcher, apiClient } from "@/lib/api-client";
import type { Department } from "@prisma/client";
import type { CreateDepartmentInput, UpdateDepartmentInput } from "@/lib/validators/department";

type DepartmentWithRelations = Department & {
  head: { id: string; firstName: string; lastName: string } | null;
  _count: { employees: number; positions: number };
};

export function useDepartments() {
  const { data, error, isLoading, mutate } = useSWR<DepartmentWithRelations[]>(
    "/api/departments",
    fetcher
  );

  return { departments: data ?? [], error, isLoading, mutate };
}

export function useDepartment(id: string | null) {
  const { data, error, isLoading, mutate } = useSWR<DepartmentWithRelations>(
    id ? `/api/departments/${id}` : null,
    fetcher
  );

  return { department: data, error, isLoading, mutate };
}

async function createDepartment(
  url: string,
  { arg }: { arg: CreateDepartmentInput }
) {
  return apiClient<DepartmentWithRelations>(url, { method: "POST", body: arg });
}

async function updateDepartment(
  url: string,
  { arg }: { arg: UpdateDepartmentInput }
) {
  return apiClient<DepartmentWithRelations>(url, { method: "PATCH", body: arg });
}

async function deleteDepartment(url: string) {
  return apiClient<{ id: string }>(url, { method: "DELETE" });
}

export function useCreateDepartment() {
  return useSWRMutation("/api/departments", createDepartment);
}

export function useUpdateDepartment(id: string) {
  return useSWRMutation(`/api/departments/${id}`, updateDepartment);
}

export function useDeleteDepartment(id: string) {
  return useSWRMutation(`/api/departments/${id}`, deleteDepartment);
}
