"use client";

import useSWR from "swr";
import useSWRMutation from "swr/mutation";
import { fetcher, apiClient } from "@/lib/api-client";
import type { Company } from "@prisma/client";
import type { UpdateCompanyInput } from "@/lib/validators/settings";

// ---------- Company ----------

export function useCompany() {
  const { data, error, isLoading, mutate } = useSWR<Company>(
    "/api/company",
    fetcher
  );

  return { company: data ?? null, error, isLoading, mutate };
}

async function updateCompany(
  url: string,
  { arg }: { arg: UpdateCompanyInput }
) {
  return apiClient<Company>(url, { method: "PATCH", body: arg });
}

export function useUpdateCompany() {
  return useSWRMutation("/api/company", updateCompany);
}

async function createCompany(
  url: string,
  { arg }: { arg: Record<string, unknown> }
) {
  return apiClient<Company>(url, { method: "POST", body: arg });
}

export function useCreateCompany() {
  return useSWRMutation("/api/company", createCompany);
}

// ---------- App Config ----------

export type AppConfigData = {
  // Jam Kerja
  defaultStartTime: string;
  defaultEndTime: string;
  lateToleranceMinutes: number;
  breakDurationMinutes: number;
  workDays: number[];

  // Overtime
  overtimeMultiplier: number;
  minOvertimeMinutes: number;
  maxOvertimeHoursPerDay: number;

  // Cuti
  annualLeaveEntitlement: number;
  leaveWaitingPeriodMonths: number;
  maxCarryOverDays: number;
  collectiveLeaveDays: number;
  weddingLeaveDays: number;
  maternityLeaveDays: number;
  paternityLeaveDays: number;
  bereavementLeaveDays: number;
  sickWithoutNoteDays: number;

  // Absensi
  attendanceMethod: "MANUAL" | "GPS" | "FINGERPRINT";
  gpsRadiusMeters: number;
  autoCheckoutTime: string;
  allowOutOfSchedule: boolean;

  // Payroll Config (BPJS & PPh21)
  bpjsKesCompanyRate: number;
  bpjsKesEmployeeRate: number;
  bpjsKesCap: number;
  bpjsTkJhtRate: number;
  bpjsTkJkkRate: number;
  bpjsTkJkmRate: number;
  bpjsTkJpRate: number;
  bpjsTkJpCap: number;
  pph21NonTaxableIncome: number;
};

export const DEFAULT_APP_CONFIG: AppConfigData = {
  defaultStartTime: "08:00",
  defaultEndTime: "17:00",
  lateToleranceMinutes: 15,
  breakDurationMinutes: 60,
  workDays: [1, 2, 3, 4, 5],

  overtimeMultiplier: 1.5,
  minOvertimeMinutes: 60,
  maxOvertimeHoursPerDay: 4,

  annualLeaveEntitlement: 12,
  leaveWaitingPeriodMonths: 3,
  maxCarryOverDays: 5,
  collectiveLeaveDays: 2,
  weddingLeaveDays: 3,
  maternityLeaveDays: 90,
  paternityLeaveDays: 2,
  bereavementLeaveDays: 2,
  sickWithoutNoteDays: 1,

  attendanceMethod: "MANUAL",
  gpsRadiusMeters: 100,
  autoCheckoutTime: "23:59",
  allowOutOfSchedule: false,

  bpjsKesCompanyRate: 0.04,
  bpjsKesEmployeeRate: 0.01,
  bpjsKesCap: 12000000,
  bpjsTkJhtRate: 0.02,
  bpjsTkJkkRate: 0.0024,
  bpjsTkJkmRate: 0.003,
  bpjsTkJpRate: 0.01,
  bpjsTkJpCap: 10042300,
  pph21NonTaxableIncome: 54000000,
};

export function useAppConfig() {
  const { data, error, isLoading, mutate } = useSWR<Partial<AppConfigData> | null>(
    "/api/settings/app-config",
    fetcher
  );

  return {
    config: { ...DEFAULT_APP_CONFIG, ...(data ?? {}) } as AppConfigData,
    error,
    isLoading,
    mutate,
  };
}

async function updateAppConfig(
  url: string,
  { arg }: { arg: Partial<AppConfigData> }
) {
  return apiClient<AppConfigData>(url, { method: "PATCH", body: arg });
}

export function useUpdateAppConfig() {
  return useSWRMutation("/api/settings/app-config", updateAppConfig);
}
