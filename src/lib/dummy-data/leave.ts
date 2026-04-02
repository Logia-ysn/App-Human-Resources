export type LeaveTypeRecord = {
  id: string;
  name: string;
  code: string;
  defaultQuota: number;
  isPaid: boolean;
  isCarryOver: boolean;
  maxCarryOver: number;
  requiresDoc: boolean;
  allowHalfDay: boolean;
  isActive: boolean;
};

export type LeaveBalanceRecord = {
  id: string;
  employeeId: string;
  employeeName: string;
  leaveTypeId: string;
  leaveTypeName: string;
  year: number;
  entitlement: number;
  carried: number;
  used: number;
  pending: number;
};

export type LeaveRequestRecord = {
  id: string;
  employeeId: string;
  employeeName: string;
  departmentName: string;
  leaveTypeId: string;
  leaveTypeName: string;
  startDate: string;
  endDate: string;
  totalDays: number;
  reason: string;
  status: "PENDING" | "APPROVED" | "REJECTED" | "CANCELLED";
  createdAt: string;
  approvedBy: string | null;
  approverNote: string | null;
};

export const leaveTypes: LeaveTypeRecord[] = [
  { id: "lt-1", name: "Cuti Tahunan", code: "ANNUAL", defaultQuota: 12, isPaid: true, isCarryOver: true, maxCarryOver: 6, requiresDoc: false, allowHalfDay: true, isActive: true },
  { id: "lt-2", name: "Cuti Sakit", code: "SICK", defaultQuota: 14, isPaid: true, isCarryOver: false, maxCarryOver: 0, requiresDoc: true, allowHalfDay: false, isActive: true },
  { id: "lt-3", name: "Cuti Melahirkan", code: "MATERNITY", defaultQuota: 90, isPaid: true, isCarryOver: false, maxCarryOver: 0, requiresDoc: true, allowHalfDay: false, isActive: true },
  { id: "lt-4", name: "Cuti Ayah", code: "PATERNITY", defaultQuota: 2, isPaid: true, isCarryOver: false, maxCarryOver: 0, requiresDoc: true, allowHalfDay: false, isActive: true },
  { id: "lt-5", name: "Cuti Menikah", code: "MARRIAGE", defaultQuota: 3, isPaid: true, isCarryOver: false, maxCarryOver: 0, requiresDoc: true, allowHalfDay: false, isActive: true },
  { id: "lt-6", name: "Cuti Duka", code: "BEREAVEMENT", defaultQuota: 3, isPaid: true, isCarryOver: false, maxCarryOver: 0, requiresDoc: false, allowHalfDay: false, isActive: true },
  { id: "lt-7", name: "Cuti Tanpa Bayar", code: "UNPAID", defaultQuota: 30, isPaid: false, isCarryOver: false, maxCarryOver: 0, requiresDoc: false, allowHalfDay: false, isActive: true },
];

export const leaveBalances: LeaveBalanceRecord[] = [
  { id: "lb-1", employeeId: "emp-1", employeeName: "Budi Santoso", leaveTypeId: "lt-1", leaveTypeName: "Cuti Tahunan", year: 2026, entitlement: 12, carried: 3, used: 2, pending: 0 },
  { id: "lb-2", employeeId: "emp-2", employeeName: "Sari Dewi", leaveTypeId: "lt-1", leaveTypeName: "Cuti Tahunan", year: 2026, entitlement: 12, carried: 5, used: 3, pending: 1 },
  { id: "lb-3", employeeId: "emp-3", employeeName: "Andi Wijaya", leaveTypeId: "lt-1", leaveTypeName: "Cuti Tahunan", year: 2026, entitlement: 12, carried: 2, used: 1, pending: 0 },
  { id: "lb-4", employeeId: "emp-4", employeeName: "Dewi Lestari", leaveTypeId: "lt-1", leaveTypeName: "Cuti Tahunan", year: 2026, entitlement: 12, carried: 0, used: 4, pending: 2 },
  { id: "lb-5", employeeId: "emp-8", employeeName: "Rini Susanti", leaveTypeId: "lt-1", leaveTypeName: "Cuti Tahunan", year: 2026, entitlement: 12, carried: 6, used: 5, pending: 0 },
  { id: "lb-6", employeeId: "emp-9", employeeName: "Maya Putri", leaveTypeId: "lt-1", leaveTypeName: "Cuti Tahunan", year: 2026, entitlement: 12, carried: 0, used: 3, pending: 1 },
  { id: "lb-7", employeeId: "emp-10", employeeName: "Deni Pratama", leaveTypeId: "lt-1", leaveTypeName: "Cuti Tahunan", year: 2026, entitlement: 12, carried: 4, used: 6, pending: 0 },
];

export const leaveRequests: LeaveRequestRecord[] = [
  { id: "lr-1", employeeId: "emp-9", employeeName: "Maya Putri", departmentName: "Marketing", leaveTypeId: "lt-1", leaveTypeName: "Cuti Tahunan", startDate: "2026-03-23", endDate: "2026-03-24", totalDays: 2, reason: "Urusan keluarga", status: "APPROVED", createdAt: "2026-03-18", approvedBy: "Budi Santoso", approverNote: null },
  { id: "lr-2", employeeId: "emp-4", employeeName: "Dewi Lestari", departmentName: "Information Technology", leaveTypeId: "lt-1", leaveTypeName: "Cuti Tahunan", startDate: "2026-03-25", endDate: "2026-03-26", totalDays: 2, reason: "Liburan keluarga", status: "PENDING", createdAt: "2026-03-20", approvedBy: null, approverNote: null },
  { id: "lr-3", employeeId: "emp-6", employeeName: "Fitri Handayani", departmentName: "Human Resources", leaveTypeId: "lt-2", leaveTypeName: "Cuti Sakit", startDate: "2026-03-23", endDate: "2026-03-23", totalDays: 1, reason: "Sakit demam", status: "APPROVED", createdAt: "2026-03-23", approvedBy: "Sari Dewi", approverNote: null },
  { id: "lr-4", employeeId: "emp-12", employeeName: "Nadia Kartika", departmentName: "Finance & Accounting", leaveTypeId: "lt-1", leaveTypeName: "Cuti Tahunan", startDate: "2026-04-01", endDate: "2026-04-03", totalDays: 3, reason: "Wisuda adik", status: "PENDING", createdAt: "2026-03-21", approvedBy: null, approverNote: null },
  { id: "lr-5", employeeId: "emp-13", employeeName: "Hendra Saputra", departmentName: "Sales", leaveTypeId: "lt-5", leaveTypeName: "Cuti Menikah", startDate: "2026-04-10", endDate: "2026-04-12", totalDays: 3, reason: "Pernikahan", status: "PENDING", createdAt: "2026-03-15", approvedBy: null, approverNote: null },
  { id: "lr-6", employeeId: "emp-2", employeeName: "Sari Dewi", departmentName: "Human Resources", leaveTypeId: "lt-1", leaveTypeName: "Cuti Tahunan", startDate: "2026-02-14", endDate: "2026-02-14", totalDays: 1, reason: "Acara keluarga", status: "APPROVED", createdAt: "2026-02-10", approvedBy: "Budi Santoso", approverNote: null },
  { id: "lr-7", employeeId: "emp-15", employeeName: "Wahyu Hidayat", departmentName: "Operations", leaveTypeId: "lt-1", leaveTypeName: "Cuti Tahunan", startDate: "2026-03-10", endDate: "2026-03-11", totalDays: 2, reason: "Mengurus surat-surat", status: "REJECTED", createdAt: "2026-03-05", approvedBy: "Budi Santoso", approverNote: "Tidak bisa, deadline project" },
];
