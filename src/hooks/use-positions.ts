"use client";

import useSWR from "swr";
import useSWRMutation from "swr/mutation";
import { fetcher, apiClient } from "@/lib/api-client";
import type { Position } from "@prisma/client";
import type { CreatePositionInput, UpdatePositionInput } from "@/lib/validators/position";

type PositionWithRelations = Position & {
  department: { id: string; name: string; code: string };
  orgLevel: { id: string; rank: number; name: string; code: string };
  _count: { employees: number };
};

export function usePositions(departmentId?: string) {
  const url = departmentId
    ? `/api/positions?departmentId=${departmentId}`
    : "/api/positions";

  const { data, error, isLoading, mutate } = useSWR<PositionWithRelations[]>(
    url,
    fetcher
  );

  return { positions: data ?? [], error, isLoading, mutate };
}

export function usePosition(id: string | null) {
  const { data, error, isLoading, mutate } = useSWR<PositionWithRelations>(
    id ? `/api/positions/${id}` : null,
    fetcher
  );

  return { position: data, error, isLoading, mutate };
}

async function createPosition(
  url: string,
  { arg }: { arg: CreatePositionInput }
) {
  return apiClient<PositionWithRelations>(url, { method: "POST", body: arg });
}

async function updatePosition(
  url: string,
  { arg }: { arg: UpdatePositionInput }
) {
  return apiClient<PositionWithRelations>(url, { method: "PATCH", body: arg });
}

async function deletePosition(url: string) {
  return apiClient<{ id: string }>(url, { method: "DELETE" });
}

export function useCreatePosition() {
  return useSWRMutation("/api/positions", createPosition);
}

export function useUpdatePosition(id: string) {
  return useSWRMutation(`/api/positions/${id}`, updatePosition);
}

export function useDeletePosition(id: string) {
  return useSWRMutation(`/api/positions/${id}`, deletePosition);
}
