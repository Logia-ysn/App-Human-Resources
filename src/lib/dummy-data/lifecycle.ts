export type LifecycleEvent = {
  id: string;
  employeeId: string;
  employeeName: string;
  type: "PROMOTION" | "TRANSFER" | "DEMOTION" | "CONFIRMATION";
  fromDepartment: string | null;
  toDepartment: string | null;
  fromPosition: string | null;
  toPosition: string | null;
  fromSalary: number | null;
  toSalary: number | null;
  effectiveDate: string;
  reason: string;
  approvedBy: string;
  createdAt: string;
};

export const lifecycleEvents: LifecycleEvent[] = [
  { id: "lc-1", employeeId: "emp-002", employeeName: "Sari Dewi", type: "PROMOTION", fromDepartment: "Human Resources", toDepartment: "Human Resources", fromPosition: "HR Staff", toPosition: "HR Manager", fromSalary: 10000000, toSalary: 18000000, effectiveDate: "2024-01-01", reason: "Kinerja excellent selama 3 tahun, memenuhi syarat promosi", approvedBy: "Budi Santoso", createdAt: "2023-12-15" },
  { id: "lc-2", employeeId: "emp-005", employeeName: "Andi Prasetyo", type: "TRANSFER", fromDepartment: "Information Technology", toDepartment: "Operations", fromPosition: "Software Developer", toPosition: "IT Operations Specialist", fromSalary: 12000000, toSalary: 13000000, effectiveDate: "2025-07-01", reason: "Kebutuhan operasional dan minat karyawan", approvedBy: "Budi Santoso", createdAt: "2025-06-15" },
  { id: "lc-3", employeeId: "emp-007", employeeName: "Rina Wulandari", type: "CONFIRMATION", fromDepartment: null, toDepartment: "Marketing", fromPosition: null, toPosition: "Marketing Staff", fromSalary: 7000000, toSalary: 8000000, effectiveDate: "2025-04-01", reason: "Lulus masa probation 3 bulan", approvedBy: "Sari Dewi", createdAt: "2025-03-20" },
  { id: "lc-4", employeeId: "emp-009", employeeName: "Agus Setiawan", type: "PROMOTION", fromDepartment: "Sales", toDepartment: "Sales", fromPosition: "Sales Staff", toPosition: "Senior Sales Staff", fromSalary: 8000000, toSalary: 10500000, effectiveDate: "2025-10-01", reason: "Pencapaian target penjualan 3 kuartal berturut-turut", approvedBy: "Budi Santoso", createdAt: "2025-09-20" },
  { id: "lc-5", employeeId: "emp-010", employeeName: "Dian Permata", type: "TRANSFER", fromDepartment: "Finance & Accounting", toDepartment: "Human Resources", fromPosition: "Accounting Staff", toPosition: "Payroll Specialist", fromSalary: 8500000, toSalary: 9000000, effectiveDate: "2026-01-01", reason: "Reorganisasi departemen dan keahlian payroll", approvedBy: "Sari Dewi", createdAt: "2025-12-10" },
];
