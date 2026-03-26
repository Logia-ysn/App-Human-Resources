import { employees } from "./employees";

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
 * Calculate PPh 21 using simplified progressive rate on monthly taxable income.
 * Taxable income = totalEarnings - (54_000_000 / 12)
 * Brackets: 0-5jt -> 5%, 5-20jt -> 15%, >20jt -> 25%
 */
export function calculatePph21(totalEarnings: number): number {
  const monthlyNonTaxable = 54_000_000 / 12; // 4_500_000
  const taxableIncome = totalEarnings - monthlyNonTaxable;

  if (taxableIncome <= 0) return 0;

  let tax = 0;

  if (taxableIncome <= 5_000_000) {
    tax = taxableIncome * 0.05;
  } else if (taxableIncome <= 20_000_000) {
    tax = 5_000_000 * 0.05 + (taxableIncome - 5_000_000) * 0.15;
  } else {
    tax = 5_000_000 * 0.05 + 15_000_000 * 0.15 + (taxableIncome - 20_000_000) * 0.25;
  }

  return Math.round(tax);
}

/**
 * Calculate salary components for an employee.
 */
export function calculateSalaryComponents(basicSalary: number, overtimeHours: number) {
  const tunjangan = Math.round(basicSalary * 0.1);
  const hourlyRate = Math.round(basicSalary / 173); // standard monthly hours
  const overtimePay = Math.round(overtimeHours * hourlyRate * 1.5);
  const totalEarnings = basicSalary + tunjangan + overtimePay;

  const bpjsKes = Math.min(Math.round(basicSalary * 0.04), 480_000);
  const bpjsTk = Math.round(basicSalary * 0.02);
  const pph21 = calculatePph21(totalEarnings);
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

      const calc = calculateSalaryComponents(emp.basicSalary, overtimeHours);

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
