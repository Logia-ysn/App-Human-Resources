"use client";

import useSWR from "swr";
import { fetcher } from "@/lib/api-client";

export type OnboardingTemplateWithTasks = {
  id: string;
  name: string;
  description: string | null;
  isActive: boolean;
  tasks: Array<{
    id: string;
    title: string;
    category: string;
    assignee: string;
    dueDay: number;
    sortOrder: number;
  }>;
  _count: { onboardings: number; tasks: number };
};

export type EmployeeOnboardingWithRelations = {
  id: string;
  employeeId: string;
  templateId: string;
  startDate: string;
  status: string;
  progress: number;
  totalTasks: number;
  completedTasks: number;
  employee: {
    id: string;
    firstName: string;
    lastName: string;
    employeeNumber: string;
    department: { name: string };
    position: { name: string };
  };
  template: { id: string; name: string };
  tasks: Array<{
    id: string;
    isCompleted: boolean;
    completedAt: string | null;
    task: { id: string; title: string; category: string; dueDay: number };
  }>;
};

export function useOnboardingTemplates() {
  const { data, error, isLoading, mutate } = useSWR<OnboardingTemplateWithTasks[]>(
    "/api/onboarding/templates",
    fetcher,
  );
  return { templates: data ?? [], error, isLoading, mutate };
}

export function useEmployeeOnboardings(params: { employeeId?: string; status?: string } = {}) {
  const qs = new URLSearchParams();
  if (params.employeeId) qs.set("employeeId", params.employeeId);
  if (params.status) qs.set("status", params.status);
  const query = qs.toString();
  const { data, error, isLoading, mutate } = useSWR<EmployeeOnboardingWithRelations[]>(
    `/api/onboarding/employees${query ? `?${query}` : ""}`,
    fetcher,
  );
  return { onboardings: data ?? [], error, isLoading, mutate };
}
