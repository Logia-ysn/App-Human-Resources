export type EmployeeAdvance = {
  id: string;
  employeeId: string;
  employeeName: string;
  departmentName: string;
  amount: number;
  purpose: string;
  requestDate: string;
  status: "DRAFT" | "PENDING" | "APPROVED" | "REJECTED" | "PAID" | "RETURNED";
  approvedBy: string | null;
  approvedDate: string | null;
  returnedAmount: number;
  notes: string;
};

export type ExpenseItem = {
  id: string;
  description: string;
  amount: number;
  category: "TRANSPORT" | "MAKAN" | "AKOMODASI" | "SUPPLIES" | "LAINNYA";
  date: string;
};

export type ExpenseClaim = {
  id: string;
  employeeId: string;
  employeeName: string;
  departmentName: string;
  title: string;
  totalAmount: number;
  items: ExpenseItem[];
  status: "DRAFT" | "PENDING" | "APPROVED" | "REJECTED" | "PAID";
  submittedDate: string;
  approvedBy: string | null;
  approvedDate: string | null;
};

export const employeeAdvances: EmployeeAdvance[] = [
  { id: "adv-1", employeeId: "emp-005", employeeName: "Andi Prasetyo", departmentName: "Information Technology", amount: 2000000, purpose: "Perjalanan dinas ke Surabaya", requestDate: "2026-03-15", status: "APPROVED", approvedBy: "Sari Dewi", approvedDate: "2026-03-16", returnedAmount: 0, notes: "Untuk hotel dan transport" },
  { id: "adv-2", employeeId: "emp-007", employeeName: "Rina Wulandari", departmentName: "Marketing", amount: 1500000, purpose: "Event marketing exhibition", requestDate: "2026-03-20", status: "PENDING", approvedBy: null, approvedDate: null, returnedAmount: 0, notes: "Biaya booth dan materi promosi" },
  { id: "adv-3", employeeId: "emp-009", employeeName: "Agus Setiawan", departmentName: "Sales", amount: 3000000, purpose: "Client visit Bandung", requestDate: "2026-03-10", status: "RETURNED", approvedBy: "Sari Dewi", approvedDate: "2026-03-11", returnedAmount: 500000, notes: "Sisa kasbon dikembalikan" },
  { id: "adv-4", employeeId: "emp-011", employeeName: "Sri Mulyani", departmentName: "Finance & Accounting", amount: 1000000, purpose: "Training sertifikasi akuntansi", requestDate: "2026-03-22", status: "PENDING", approvedBy: null, approvedDate: null, returnedAmount: 0, notes: "" },
];

export const expenseClaims: ExpenseClaim[] = [
  { id: "exp-1", employeeId: "emp-005", employeeName: "Andi Prasetyo", departmentName: "Information Technology", title: "Perjalanan Dinas Surabaya", totalAmount: 1850000, submittedDate: "2026-03-20", status: "PENDING", approvedBy: null, approvedDate: null, items: [
    { id: "ei-1", description: "Tiket pesawat PP", amount: 1200000, category: "TRANSPORT", date: "2026-03-17" },
    { id: "ei-2", description: "Hotel 1 malam", amount: 450000, category: "AKOMODASI", date: "2026-03-17" },
    { id: "ei-3", description: "Makan 2 hari", amount: 200000, category: "MAKAN", date: "2026-03-18" },
  ]},
  { id: "exp-2", employeeId: "emp-007", employeeName: "Rina Wulandari", departmentName: "Marketing", title: "Client Meeting Dinner", totalAmount: 750000, submittedDate: "2026-03-18", status: "APPROVED", approvedBy: "Sari Dewi", approvedDate: "2026-03-19", items: [
    { id: "ei-4", description: "Dinner dengan klien", amount: 500000, category: "MAKAN", date: "2026-03-16" },
    { id: "ei-5", description: "Taxi PP", amount: 250000, category: "TRANSPORT", date: "2026-03-16" },
  ]},
  { id: "exp-3", employeeId: "emp-003", employeeName: "Joko Widodo", departmentName: "Finance & Accounting", title: "Supplies Kantor", totalAmount: 350000, submittedDate: "2026-03-15", status: "PAID", approvedBy: "Sari Dewi", approvedDate: "2026-03-16", items: [
    { id: "ei-6", description: "Toner printer", amount: 250000, category: "SUPPLIES", date: "2026-03-14" },
    { id: "ei-7", description: "ATK", amount: 100000, category: "SUPPLIES", date: "2026-03-14" },
  ]},
];
