"use client";

import useSWR from "swr";
import useSWRMutation from "swr/mutation";
import { fetcher, apiClient } from "@/lib/api-client";
import type {
  CreateProfileChangeRequestInput,
  ResolveProfileChangeRequestInput,
} from "@/lib/validators/profile-change-request";

export type ProfileChangeRequestRecord = {
  id: string;
  employeeId: string;
  message: string;
  status: "PENDING" | "RESOLVED" | "REJECTED";
  handledById: string | null;
  handledNote: string | null;
  handledAt: string | null;
  createdAt: string;
  updatedAt: string;
  employee: {
    id: string;
    firstName: string;
    lastName: string;
    employeeNumber: string;
    department: { id: string; name: string };
  };
  handler: {
    id: string;
    firstName: string;
    lastName: string;
  } | null;
};

type ListResponse = { requests: ProfileChangeRequestRecord[] };

export function useProfileChangeRequests(params: { status?: string } = {}) {
  const qs = params.status ? `?status=${encodeURIComponent(params.status)}` : "";
  const { data, error, isLoading, mutate } = useSWR<ListResponse>(
    `/api/profile-change-requests${qs}`,
    fetcher
  );
  return { requests: data?.requests ?? [], error, isLoading, mutate };
}

async function createReq(url: string, { arg }: { arg: CreateProfileChangeRequestInput }) {
  return apiClient<ProfileChangeRequestRecord>(url, { method: "POST", body: arg });
}

export function useCreateProfileChangeRequest() {
  return useSWRMutation("/api/profile-change-requests", createReq);
}

async function resolveReq(
  url: string,
  { arg }: { arg: ResolveProfileChangeRequestInput }
) {
  return apiClient<ProfileChangeRequestRecord>(url, { method: "PATCH", body: arg });
}

export function useResolveProfileChangeRequest(id: string) {
  return useSWRMutation(`/api/profile-change-requests/${id}`, resolveReq);
}
