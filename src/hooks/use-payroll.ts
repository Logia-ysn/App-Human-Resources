"use client";

import useSWR from "swr";
import { fetcher } from "@/lib/api-client";

type PayrollPeriodWithRelations = {
  id: string;
  month: number;
  year: number;
  startDate: string;
  endDate: string;
  status: string;
  totalEmployees: number;
  totalGross: string;
  totalDeductions: string;
  totalNet: string;
  processedBy?: { id: string; firstName: string; lastName: string } | null;
  approvedBy?: { id: string; firstName: string; lastName: string } | null;
};

type PayslipWithRelations = {
  id: string;
  payrollPeriodId: string;
  employeeId: string;
  basicSalary: string;
  totalEarnings: string;
  totalDeductions: string;
  grossSalary: string;
  netSalary: string;
  workDays: number;
  presentDays: number;
  absentDays: number;
  overtimeHours: number;
  overtimePay: string;
  pph21: string;
  paidAt: string | null;
  payrollPeriod: { month: number; year: number; status: string };
  employee: {
    id: string;
    firstName: string;
    lastName: string;
    employeeNumber: string;
    department: { name: string };
  };
};

export function usePayrollPeriods(year?: number) {
  const y = year ?? new Date().getFullYear();
  const { data, error, isLoading, mutate } = useSWR<PayrollPeriodWithRelations[]>(
    `/api/payroll/periods?year=${y}`,
    fetcher,
  );
  return { periods: data ?? [], error, isLoading, mutate };
}

export function usePayslips(params: { periodId?: string; employeeId?: string; year?: number } = {}) {
  const qs = new URLSearchParams();
  if (params.periodId) qs.set("periodId", params.periodId);
  if (params.employeeId) qs.set("employeeId", params.employeeId);
  if (params.year) qs.set("year", String(params.year));
  const query = qs.toString();
  const { data, error, isLoading, mutate } = useSWR<PayslipWithRelations[]>(
    `/api/payroll/payslips${query ? `?${query}` : ""}`,
    fetcher,
  );
  return { payslips: data ?? [], error, isLoading, mutate };
}
