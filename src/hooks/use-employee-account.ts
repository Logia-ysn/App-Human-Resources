"use client";

import useSWR from "swr";
import useSWRMutation from "swr/mutation";
import { fetcher, apiClient } from "@/lib/api-client";
import type { Role } from "@prisma/client";

export type EmployeeAccount = {
  id: string;
  email: string;
  role: Role;
  isActive: boolean;
  mustChangePassword: boolean;
  lastLoginAt: string | null;
  createdAt: string;
};

export function useEmployeeAccount(employeeId: string | null | undefined) {
  const key = employeeId ? `/api/employees/${employeeId}/account` : null;
  const { data, error, isLoading, mutate } = useSWR<EmployeeAccount | null>(
    key,
    fetcher,
  );
  return { account: data ?? null, error, isLoading, mutate };
}

type CreateArg = {
  email?: string;
  password: string;
  role: Role;
  mustChangePassword?: boolean;
};

async function createAccount(url: string, { arg }: { arg: CreateArg }) {
  return apiClient<EmployeeAccount>(url, { method: "POST", body: arg });
}

export function useCreateAccount(employeeId: string) {
  return useSWRMutation(`/api/employees/${employeeId}/account`, createAccount);
}

type UpdateArg = { role?: Role; isActive?: boolean };

async function updateAccount(url: string, { arg }: { arg: UpdateArg }) {
  return apiClient<EmployeeAccount>(url, { method: "PATCH", body: arg });
}

export function useUpdateAccount(employeeId: string) {
  return useSWRMutation(`/api/employees/${employeeId}/account`, updateAccount);
}

async function deleteAccount(url: string) {
  return apiClient<{ deleted: boolean }>(url, { method: "DELETE" });
}

export function useDeleteAccount(employeeId: string) {
  return useSWRMutation(`/api/employees/${employeeId}/account`, deleteAccount);
}

type ResetArg = { password: string; mustChangePassword?: boolean };

async function resetPassword(url: string, { arg }: { arg: ResetArg }) {
  return apiClient<{ success: boolean }>(url, { method: "POST", body: arg });
}

export function useResetPassword(employeeId: string) {
  return useSWRMutation(
    `/api/employees/${employeeId}/account/reset-password`,
    resetPassword,
  );
}
