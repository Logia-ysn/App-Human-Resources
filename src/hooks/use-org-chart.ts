"use client";

import useSWR from "swr";
import { fetcher } from "@/lib/api-client";

export type OrgNode = {
  id: string;
  employeeNumber: string;
  firstName: string;
  lastName: string;
  email: string;
  department: { id: string; name: string };
  position: { id: string; name: string; orgLevel: { rank: number; name: string } };
  managerId: string | null;
  children: OrgNode[];
};

export function useOrgChart() {
  const { data, error, isLoading, mutate } = useSWR<OrgNode[]>("/api/org-chart", fetcher);
  return { tree: data ?? [], error, isLoading, mutate };
}
