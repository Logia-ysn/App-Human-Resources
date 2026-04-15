"use client";

import useSWR from "swr";
import { fetcher } from "@/lib/api-client";

export type TrainingProgramWithCount = {
  id: string;
  title: string;
  description: string | null;
  category: string;
  provider: string | null;
  trainer: string | null;
  method: string;
  location: string | null;
  startDate: string;
  endDate: string;
  maxParticipants: number | null;
  costPerPerson: string;
  totalBudget: string;
  status: string;
  createdBy: { id: string; firstName: string; lastName: string };
  _count: { participants: number };
};

export type TrainingParticipantWithRelations = {
  id: string;
  trainingId: string;
  employeeId: string;
  status: string;
  enrolledAt: string;
  completedAt: string | null;
  score: string | null;
  isPassed: boolean | null;
  rating: number | null;
  training: {
    id: string;
    title: string;
    category: string;
    method: string;
    startDate: string;
    endDate: string;
    status: string;
  };
  employee: {
    id: string;
    firstName: string;
    lastName: string;
    employeeNumber: string;
    department: { name: string };
  };
};

export function useTrainingPrograms(params: { status?: string } = {}) {
  const qs = new URLSearchParams();
  if (params.status) qs.set("status", params.status);
  const query = qs.toString();
  const { data, error, isLoading, mutate } = useSWR<TrainingProgramWithCount[]>(
    `/api/training/programs${query ? `?${query}` : ""}`,
    fetcher,
  );
  return { programs: data ?? [], error, isLoading, mutate };
}

export function useTrainingParticipants(params: { employeeId?: string; trainingId?: string } = {}) {
  const qs = new URLSearchParams();
  if (params.employeeId) qs.set("employeeId", params.employeeId);
  if (params.trainingId) qs.set("trainingId", params.trainingId);
  const query = qs.toString();
  const { data, error, isLoading, mutate } = useSWR<TrainingParticipantWithRelations[]>(
    `/api/training/participants${query ? `?${query}` : ""}`,
    fetcher,
  );
  return { participants: data ?? [], error, isLoading, mutate };
}
