import { employees } from "./employees";
import { defaultPayrollConfig, type PayrollConfig } from "./payroll-config";

export type PayrollPeriodRecord = {
  id: string;
  month: number;
  year: number;
  status: "DRAFT" | "PROCESSING" | "CALCULATED" | "APPROVED" | "PAID";
  totalEmployees: number;
  totalGross: number;
  totalDeductions: number;
  totalNet: number;
  processedAt: string | null;
};

export type PayslipRecord = {
  id: string;
  periodId: string;
  periodLabel: string;
  employeeId: string;
  employeeName: string;
  employeeNumber: string;
  departmentName: string;
  positionName: string;
  basicSalary: number;
  totalEarnings: number;
  totalDeductions: number;
  bpjsKes: number;
  bpjsTk: number;
  pph21: number;
  netSalary: number;
  workDays: number;
  presentDays: number;
  overtimeHours: number;
  overtimePay: number;
};

const MONTH_NAMES: Record<number, string> = {
  1: "Januari",
  2: "Februari",
  3: "Maret",
  4: "April",
  5: "Mei",
  6: "Juni",
  7: "Juli",
  8: "Agustus",
  9: "September",
  10: "Oktober",
  11: "November",
  12: "Desember",
};

/**
 * Calculate PPh 21 using progressive rate on monthly taxable income.
 * Uses annual brackets from config, applied on a monthly basis.
 */
export function calculatePph21(
  totalEarnings: number,
  config: PayrollConfig = defaultPayrollConfig,
): number {
  const monthlyNonTaxable = config.pph21NonTaxableIncome / 12;
  const taxableIncome = totalEarnings - monthlyNonTaxable;

  if (taxableIncome <= 0) return 0;

  // Convert annual brackets to monthly
  const annualTaxable = taxableIncome * 12;
  let annualTax = 0;
  let remaining = annualTaxable;
  let prevLimit = 0;

  for (const bracket of config.pph21Brackets) {
    const bracketSize = bracket.limit === Infinity ? remaining : bracket.limit - prevLimit;
    const taxableInBracket = Math.min(remaining, bracketSize);
    annualTax += taxableInBracket * bracket.rate;
    remaining -= taxableInBracket;
    prevLimit = bracket.limit;
    if (remaining <= 0) break;
  }

  return Math.round(annualTax / 12);
}

type EmployeeAllowances = {
  allowanceTransport: number;
  allowanceMeal: number;
  allowancePosition: number;
  allowanceOther: number;
};

/**
 * Calculate salary components for an employee.
 * Uses payroll config for BPJS/PPh rates and employee allowances for tunjangan.
 */
export function calculateSalaryComponents(
  basicSalary: number,
  overtimeHours: number,
  allowances?: EmployeeAllowances,
  config: PayrollConfig = defaultPayrollConfig,
) {
  // Use per-employee allowances if provided, otherwise fallback to 10% of basic
  const tunjangan = allowances
    ? allowances.allowanceTransport + allowances.allowanceMeal + allowances.allowancePosition + allowances.allowanceOther
    : Math.round(basicSalary * 0.1);

  const hourlyRate = Math.round(basicSalary / 173); // standard monthly hours
  const overtimePay = Math.round(overtimeHours * hourlyRate * 1.5);
  const totalEarnings = basicSalary + tunjangan + overtimePay;

  // BPJS Kesehatan: employee portion, capped at config.bpjsKesCap
  const bpjsKesSalary = Math.min(basicSalary, config.bpjsKesCap);
  const bpjsKes = Math.round(bpjsKesSalary * config.bpjsKesEmployeeRate);

  // BPJS Ketenagakerjaan: JHT (employee) + JP (employee, capped)
  const bpjsTkJht = Math.round(basicSalary * config.bpjsTkJhtRate);
  const bpjsTkJpSalary = Math.min(basicSalary, config.bpjsTkJpCap);
  const bpjsTkJp = Math.round(bpjsTkJpSalary * config.bpjsTkJpRate);
  const bpjsTk = bpjsTkJht + bpjsTkJp;

  const pph21 = calculatePph21(totalEarnings, config);
  const totalDeductions = bpjsKes + bpjsTk + pph21;
  const netSalary = totalEarnings - totalDeductions;

  return {
    tunjangan,
    overtimePay,
    totalEarnings,
    bpjsKes,
    bpjsTk,
    pph21,
    totalDeductions,
    netSalary,
  };
}

// Seeded RNG for deterministic "random" attendance data
function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) & 0x7fffffff;
    return s / 0x7fffffff;
  };
}

type PeriodSpec = {
  id: string;
  month: number;
  year: number;
  status: "DRAFT" | "PROCESSING" | "CALCULATED" | "APPROVED" | "PAID";
  processedAt: string | null;
};

const periodSpecs: PeriodSpec[] = [
  { id: "pp-1", month: 1, year: 2026, status: "PAID", processedAt: "2026-01-28" },
  { id: "pp-2", month: 2, year: 2026, status: "PAID", processedAt: "2026-02-28" },
  { id: "pp-3", month: 3, year: 2026, status: "CALCULATED", processedAt: "2026-03-25" },
];

const activeEmployees = employees.filter(
  (e) => !e.isDeleted && (e.status === "ACTIVE" || e.status === "PROBATION")
);

// Generate all payslips
function generateAllPayslips(): { periods: PayrollPeriodRecord[]; slips: PayslipRecord[] } {
  const allSlips: PayslipRecord[] = [];
  const allPeriods: PayrollPeriodRecord[] = [];

  const rng = seededRandom(42);

  for (const spec of periodSpecs) {
    const periodLabel = `${MONTH_NAMES[spec.month]} ${spec.year}`;
    let periodTotalGross = 0;
    let periodTotalDeductions = 0;
    let periodTotalNet = 0;

    for (let i = 0; i < activeEmployees.length; i++) {
      const emp = activeEmployees[i];

      // Deterministic attendance: presentDays 20-22, overtimeHours 0-5
      const presentDays = 20 + Math.floor(rng() * 3); // 20, 21, or 22
      const overtimeHours = Math.floor(rng() * 6); // 0-5

      const calc = calculateSalaryComponents(emp.basicSalary, overtimeHours, {
        allowanceTransport: emp.allowanceTransport ?? 0,
        allowanceMeal: emp.allowanceMeal ?? 0,
        allowancePosition: emp.allowancePosition ?? 0,
        allowanceOther: emp.allowanceOther ?? 0,
      });

      const slipId = `ps-${spec.id.replace("pp-", "")}-${emp.id.replace("emp-", "")}`;

      allSlips.push({
        id: slipId,
        periodId: spec.id,
        periodLabel,
        employeeId: emp.id,
        employeeName: `${emp.firstName} ${emp.lastName}`,
        employeeNumber: emp.employeeNumber,
        departmentName: emp.departmentName,
        positionName: emp.positionName,
        basicSalary: emp.basicSalary,
        totalEarnings: calc.totalEarnings,
        totalDeductions: calc.totalDeductions,
        bpjsKes: calc.bpjsKes,
        bpjsTk: calc.bpjsTk,
        pph21: calc.pph21,
        netSalary: calc.netSalary,
        workDays: 22,
        presentDays,
        overtimeHours,
        overtimePay: calc.overtimePay,
      });

      periodTotalGross += calc.totalEarnings;
      periodTotalDeductions += calc.totalDeductions;
      periodTotalNet += calc.netSalary;
    }

    allPeriods.push({
      id: spec.id,
      month: spec.month,
      year: spec.year,
      status: spec.status,
      totalEmployees: activeEmployees.length,
      totalGross: periodTotalGross,
      totalDeductions: periodTotalDeductions,
      totalNet: periodTotalNet,
      processedAt: spec.processedAt,
    });
  }

  return { periods: allPeriods, slips: allSlips };
}

const generated = generateAllPayslips();

export const payrollPeriods: PayrollPeriodRecord[] = generated.periods;
export const payslips: PayslipRecord[] = generated.slips;
