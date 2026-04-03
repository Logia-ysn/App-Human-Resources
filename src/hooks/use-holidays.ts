"use client";

import useSWR from "swr";
import { fetcher } from "@/lib/api-client";
import type { Holiday } from "@prisma/client";

export function useHolidays(year?: number) {
  const currentYear = year ?? new Date().getFullYear();
  const { data, error, isLoading, mutate } = useSWR<Holiday[]>(
    `/api/holidays?year=${currentYear}`,
    fetcher
  );

  return { holidays: data ?? [], error, isLoading, mutate };
}
