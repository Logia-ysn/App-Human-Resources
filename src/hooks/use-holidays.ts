"use client";

import useSWR from "swr";
import useSWRMutation from "swr/mutation";
import { fetcher, apiClient } from "@/lib/api-client";
import type { Holiday } from "@prisma/client";
import type { CreateHolidayInput } from "@/lib/validators/holiday";

export function useHolidays(year?: number) {
  const currentYear = year ?? new Date().getFullYear();
  const { data, error, isLoading, mutate } = useSWR<Holiday[]>(
    `/api/holidays?year=${currentYear}`,
    fetcher
  );

  return { holidays: data ?? [], error, isLoading, mutate };
}

async function createHoliday(url: string, { arg }: { arg: CreateHolidayInput }) {
  return apiClient<Holiday>(url, { method: "POST", body: arg });
}

export function useCreateHoliday() {
  return useSWRMutation("/api/holidays", createHoliday);
}
