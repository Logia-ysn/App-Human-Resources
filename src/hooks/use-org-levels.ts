"use client";

import useSWR from "swr";
import useSWRMutation from "swr/mutation";
import { fetcher, apiClient } from "@/lib/api-client";
import type { OrgLevel } from "@prisma/client";
import type { CreateOrgLevelInput, UpdateOrgLevelInput } from "@/lib/validators/org-level";

type OrgLevelWithCount = OrgLevel & { _count: { positions: number } };

export function useOrgLevels() {
  const { data, error, isLoading, mutate } = useSWR<OrgLevelWithCount[]>(
    "/api/org-levels",
    fetcher,
  );

  return { levels: data ?? [], error, isLoading, mutate };
}

async function createOrgLevel(url: string, { arg }: { arg: CreateOrgLevelInput }) {
  return apiClient<OrgLevelWithCount>(url, { method: "POST", body: arg });
}

async function updateOrgLevel(url: string, { arg }: { arg: UpdateOrgLevelInput }) {
  return apiClient<OrgLevelWithCount>(url, { method: "PATCH", body: arg });
}

async function deleteOrgLevel(url: string) {
  return apiClient<{ id: string }>(url, { method: "DELETE" });
}

export function useCreateOrgLevel() {
  return useSWRMutation("/api/org-levels", createOrgLevel);
}

export function useUpdateOrgLevel(id: string) {
  return useSWRMutation(`/api/org-levels/${id}`, updateOrgLevel);
}

export function useDeleteOrgLevel(id: string) {
  return useSWRMutation(`/api/org-levels/${id}`, deleteOrgLevel);
}
