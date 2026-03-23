export type Department = {
  id: string;
  name: string;
  code: string;
  description: string;
  parentId: string | null;
  headEmployeeId: string | null;
  headEmployeeName: string | null;
  isActive: boolean;
  employeeCount: number;
  createdAt: string;
};

export const departments: Department[] = [
  {
    id: "dept-1",
    name: "Board of Directors",
    code: "BOD",
    description: "Direksi perusahaan",
    parentId: null,
    headEmployeeId: "emp-1",
    headEmployeeName: "Budi Santoso",
    isActive: true,
    employeeCount: 3,
    createdAt: "2024-01-01",
  },
  {
    id: "dept-2",
    name: "Human Resources",
    code: "HR",
    description: "Sumber Daya Manusia",
    parentId: null,
    headEmployeeId: "emp-2",
    headEmployeeName: "Sari Dewi",
    isActive: true,
    employeeCount: 5,
    createdAt: "2024-01-01",
  },
  {
    id: "dept-3",
    name: "Finance & Accounting",
    code: "FIN",
    description: "Keuangan dan Akuntansi",
    parentId: null,
    headEmployeeId: "emp-8",
    headEmployeeName: "Rini Susanti",
    isActive: true,
    employeeCount: 8,
    createdAt: "2024-01-01",
  },
  {
    id: "dept-4",
    name: "Information Technology",
    code: "IT",
    description: "Teknologi Informasi",
    parentId: null,
    headEmployeeId: "emp-3",
    headEmployeeName: "Andi Wijaya",
    isActive: true,
    employeeCount: 12,
    createdAt: "2024-01-01",
  },
  {
    id: "dept-5",
    name: "Marketing",
    code: "MKT",
    description: "Pemasaran dan Komunikasi",
    parentId: null,
    headEmployeeId: "emp-9",
    headEmployeeName: "Maya Putri",
    isActive: true,
    employeeCount: 7,
    createdAt: "2024-01-01",
  },
  {
    id: "dept-6",
    name: "Operations",
    code: "OPS",
    description: "Operasional dan Produksi",
    parentId: null,
    headEmployeeId: null,
    headEmployeeName: null,
    isActive: true,
    employeeCount: 15,
    createdAt: "2024-01-01",
  },
  {
    id: "dept-7",
    name: "Sales",
    code: "SALES",
    description: "Penjualan dan Business Development",
    parentId: null,
    headEmployeeId: "emp-10",
    headEmployeeName: "Deni Pratama",
    isActive: true,
    employeeCount: 10,
    createdAt: "2024-01-01",
  },
  {
    id: "dept-8",
    name: "Legal & Compliance",
    code: "LEGAL",
    description: "Hukum dan Kepatuhan",
    parentId: null,
    headEmployeeId: null,
    headEmployeeName: null,
    isActive: true,
    employeeCount: 3,
    createdAt: "2024-06-01",
  },
  {
    id: "dept-9",
    name: "General Affairs",
    code: "GA",
    description: "Urusan Umum",
    parentId: "dept-2",
    headEmployeeId: null,
    headEmployeeName: null,
    isActive: true,
    employeeCount: 4,
    createdAt: "2024-03-01",
  },
];
