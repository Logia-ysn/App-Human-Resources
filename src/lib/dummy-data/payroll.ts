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

export const payrollPeriods: PayrollPeriodRecord[] = [
  { id: "pp-1", month: 1, year: 2026, status: "PAID", totalEmployees: 15, totalGross: 195000000, totalDeductions: 28500000, totalNet: 166500000, processedAt: "2026-01-28" },
  { id: "pp-2", month: 2, year: 2026, status: "PAID", totalEmployees: 15, totalGross: 197000000, totalDeductions: 29100000, totalNet: 167900000, processedAt: "2026-02-28" },
  { id: "pp-3", month: 3, year: 2026, status: "CALCULATED", totalEmployees: 15, totalGross: 198500000, totalDeductions: 29400000, totalNet: 169100000, processedAt: "2026-03-25" },
];

export const payslips: PayslipRecord[] = [
  { id: "ps-1", periodId: "pp-3", periodLabel: "Maret 2026", employeeId: "emp-1", employeeName: "Budi Santoso", employeeNumber: "EMP-0001", departmentName: "Board of Directors", positionName: "Direktur Utama", basicSalary: 75000000, totalEarnings: 76500000, totalDeductions: 15200000, bpjsKes: 480000, bpjsTk: 1500000, pph21: 13220000, netSalary: 61300000, workDays: 22, presentDays: 22, overtimeHours: 0, overtimePay: 0 },
  { id: "ps-2", periodId: "pp-3", periodLabel: "Maret 2026", employeeId: "emp-2", employeeName: "Sari Dewi", employeeNumber: "EMP-0002", departmentName: "Human Resources", positionName: "HR Manager", basicSalary: 18000000, totalEarnings: 19500000, totalDeductions: 3850000, bpjsKes: 480000, bpjsTk: 360000, pph21: 3010000, netSalary: 15650000, workDays: 22, presentDays: 21, overtimeHours: 0, overtimePay: 0 },
  { id: "ps-3", periodId: "pp-3", periodLabel: "Maret 2026", employeeId: "emp-3", employeeName: "Andi Wijaya", employeeNumber: "EMP-0003", departmentName: "Information Technology", positionName: "IT Manager", basicSalary: 22000000, totalEarnings: 24200000, totalDeductions: 4900000, bpjsKes: 480000, bpjsTk: 440000, pph21: 3980000, netSalary: 19300000, workDays: 22, presentDays: 22, overtimeHours: 3, overtimePay: 700000 },
  { id: "ps-4", periodId: "pp-3", periodLabel: "Maret 2026", employeeId: "emp-4", employeeName: "Dewi Lestari", employeeNumber: "EMP-0004", departmentName: "Information Technology", positionName: "Software Developer", basicSalary: 12000000, totalEarnings: 13500000, totalDeductions: 2150000, bpjsKes: 480000, bpjsTk: 240000, pph21: 1430000, netSalary: 11350000, workDays: 22, presentDays: 22, overtimeHours: 0, overtimePay: 0 },
  { id: "ps-5", periodId: "pp-3", periodLabel: "Maret 2026", employeeId: "emp-5", employeeName: "Rizky Ramadhan", employeeNumber: "EMP-0005", departmentName: "Information Technology", positionName: "Software Developer", basicSalary: 10000000, totalEarnings: 11500000, totalDeductions: 1750000, bpjsKes: 400000, bpjsTk: 200000, pph21: 1150000, netSalary: 9750000, workDays: 22, presentDays: 20, overtimeHours: 0, overtimePay: 0 },
  { id: "ps-6", periodId: "pp-3", periodLabel: "Maret 2026", employeeId: "emp-8", employeeName: "Rini Susanti", employeeNumber: "EMP-0008", departmentName: "Finance & Accounting", positionName: "Finance Manager", basicSalary: 20000000, totalEarnings: 21500000, totalDeductions: 4200000, bpjsKes: 480000, bpjsTk: 400000, pph21: 3320000, netSalary: 17300000, workDays: 22, presentDays: 22, overtimeHours: 0, overtimePay: 0 },
];
