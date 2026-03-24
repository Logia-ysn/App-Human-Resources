export type ShiftType = {
  id: string;
  name: string;
  startTime: string;
  endTime: string;
  breakDuration: number;
  color: string;
  isActive: boolean;
};

export type ShiftAssignment = {
  id: string;
  employeeId: string;
  employeeName: string;
  departmentName: string;
  shiftId: string;
  shiftName: string;
  startDate: string;
  endDate: string | null;
  isActive: boolean;
};

export const shiftTypes: ShiftType[] = [
  { id: "shift-1", name: "Shift Pagi", startTime: "06:00", endTime: "14:00", breakDuration: 60, color: "#F59E0B", isActive: true },
  { id: "shift-2", name: "Shift Siang", startTime: "14:00", endTime: "22:00", breakDuration: 60, color: "#3B82F6", isActive: true },
  { id: "shift-3", name: "Shift Malam", startTime: "22:00", endTime: "06:00", breakDuration: 60, color: "#6366F1", isActive: true },
  { id: "shift-4", name: "Regular", startTime: "08:00", endTime: "17:00", breakDuration: 60, color: "#10B981", isActive: true },
];

export const shiftAssignments: ShiftAssignment[] = [
  { id: "sa-1", employeeId: "emp-005", employeeName: "Andi Prasetyo", departmentName: "Information Technology", shiftId: "shift-4", shiftName: "Regular", startDate: "2026-01-01", endDate: null, isActive: true },
  { id: "sa-2", employeeId: "emp-006", employeeName: "Lina Marlina", departmentName: "Operations", shiftId: "shift-1", shiftName: "Shift Pagi", startDate: "2026-03-01", endDate: "2026-03-31", isActive: true },
  { id: "sa-3", employeeId: "emp-008", employeeName: "Bambang Gunawan", departmentName: "Operations", shiftId: "shift-2", shiftName: "Shift Siang", startDate: "2026-03-01", endDate: "2026-03-31", isActive: true },
  { id: "sa-4", employeeId: "emp-012", employeeName: "Wati Susanto", departmentName: "Operations", shiftId: "shift-3", shiftName: "Shift Malam", startDate: "2026-03-01", endDate: "2026-03-31", isActive: true },
  { id: "sa-5", employeeId: "emp-013", employeeName: "Hendra Wijaya", departmentName: "Operations", shiftId: "shift-1", shiftName: "Shift Pagi", startDate: "2026-03-01", endDate: "2026-03-31", isActive: true },
];
