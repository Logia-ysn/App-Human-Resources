export type Position = {
  id: string;
  name: string;
  code: string;
  departmentId: string;
  departmentName: string;
  level: "STAFF" | "SUPERVISOR" | "MANAGER" | "DIRECTOR";
  minSalary: number | null;
  maxSalary: number | null;
  description: string;
  isActive: boolean;
  employeeCount: number;
  createdAt: string;
};

export const positions: Position[] = [
  { id: "pos-1", name: "Direktur Utama", code: "BOD-DIR", departmentId: "dept-1", departmentName: "Board of Directors", level: "DIRECTOR", minSalary: 50000000, maxSalary: 100000000, description: "Pimpinan tertinggi perusahaan", isActive: true, employeeCount: 1, createdAt: "2024-01-01" },
  { id: "pos-2", name: "HR Manager", code: "HR-MGR", departmentId: "dept-2", departmentName: "Human Resources", level: "MANAGER", minSalary: 15000000, maxSalary: 25000000, description: "Manajer SDM", isActive: true, employeeCount: 1, createdAt: "2024-01-01" },
  { id: "pos-3", name: "HR Staff", code: "HR-STF", departmentId: "dept-2", departmentName: "Human Resources", level: "STAFF", minSalary: 6000000, maxSalary: 10000000, description: "Staf SDM", isActive: true, employeeCount: 3, createdAt: "2024-01-01" },
  { id: "pos-4", name: "IT Manager", code: "IT-MGR", departmentId: "dept-4", departmentName: "Information Technology", level: "MANAGER", minSalary: 18000000, maxSalary: 30000000, description: "Manajer TI", isActive: true, employeeCount: 1, createdAt: "2024-01-01" },
  { id: "pos-5", name: "Software Developer", code: "IT-DEV", departmentId: "dept-4", departmentName: "Information Technology", level: "STAFF", minSalary: 8000000, maxSalary: 18000000, description: "Pengembang perangkat lunak", isActive: true, employeeCount: 6, createdAt: "2024-01-01" },
  { id: "pos-6", name: "UI/UX Designer", code: "IT-UX", departmentId: "dept-4", departmentName: "Information Technology", level: "STAFF", minSalary: 7000000, maxSalary: 15000000, description: "Desainer antarmuka", isActive: true, employeeCount: 2, createdAt: "2024-01-01" },
  { id: "pos-7", name: "Finance Manager", code: "FIN-MGR", departmentId: "dept-3", departmentName: "Finance & Accounting", level: "MANAGER", minSalary: 15000000, maxSalary: 25000000, description: "Manajer Keuangan", isActive: true, employeeCount: 1, createdAt: "2024-01-01" },
  { id: "pos-8", name: "Accountant", code: "FIN-ACC", departmentId: "dept-3", departmentName: "Finance & Accounting", level: "STAFF", minSalary: 6000000, maxSalary: 12000000, description: "Staf Akuntan", isActive: true, employeeCount: 4, createdAt: "2024-01-01" },
  { id: "pos-9", name: "Marketing Manager", code: "MKT-MGR", departmentId: "dept-5", departmentName: "Marketing", level: "MANAGER", minSalary: 15000000, maxSalary: 25000000, description: "Manajer Pemasaran", isActive: true, employeeCount: 1, createdAt: "2024-01-01" },
  { id: "pos-10", name: "Marketing Staff", code: "MKT-STF", departmentId: "dept-5", departmentName: "Marketing", level: "STAFF", minSalary: 5500000, maxSalary: 10000000, description: "Staf Pemasaran", isActive: true, employeeCount: 4, createdAt: "2024-01-01" },
  { id: "pos-11", name: "Sales Manager", code: "SLS-MGR", departmentId: "dept-7", departmentName: "Sales", level: "MANAGER", minSalary: 15000000, maxSalary: 25000000, description: "Manajer Penjualan", isActive: true, employeeCount: 1, createdAt: "2024-01-01" },
  { id: "pos-12", name: "Sales Executive", code: "SLS-EXE", departmentId: "dept-7", departmentName: "Sales", level: "STAFF", minSalary: 5500000, maxSalary: 12000000, description: "Eksekutif Penjualan", isActive: true, employeeCount: 6, createdAt: "2024-01-01" },
  { id: "pos-13", name: "Operations Supervisor", code: "OPS-SPV", departmentId: "dept-6", departmentName: "Operations", level: "SUPERVISOR", minSalary: 8000000, maxSalary: 14000000, description: "Supervisor Operasional", isActive: true, employeeCount: 3, createdAt: "2024-01-01" },
  { id: "pos-14", name: "Operations Staff", code: "OPS-STF", departmentId: "dept-6", departmentName: "Operations", level: "STAFF", minSalary: 5000000, maxSalary: 8000000, description: "Staf Operasional", isActive: true, employeeCount: 10, createdAt: "2024-01-01" },
  { id: "pos-15", name: "GA Staff", code: "GA-STF", departmentId: "dept-9", departmentName: "General Affairs", level: "STAFF", minSalary: 5000000, maxSalary: 8000000, description: "Staf Urusan Umum", isActive: true, employeeCount: 4, createdAt: "2024-03-01" },
];
