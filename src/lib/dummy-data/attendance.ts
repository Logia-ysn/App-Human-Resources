export type AttendanceRecord = {
  id: string;
  employeeId: string;
  employeeName: string;
  date: string;
  checkIn: string | null;
  checkOut: string | null;
  lateMinutes: number;
  earlyLeaveMin: number;
  workMinutes: number;
  overtimeMinutes: number;
  status: "PRESENT" | "ABSENT" | "LATE" | "LEAVE" | "HOLIDAY" | "SICK" | "BUSINESS_TRIP";
  isManualEntry: boolean;
};

export type OvertimeRecord = {
  id: string;
  employeeId: string;
  employeeName: string;
  date: string;
  startTime: string;
  endTime: string;
  plannedMinutes: number;
  reason: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  approvedBy: string | null;
};

export type HolidayRecord = {
  id: string;
  name: string;
  date: string;
  type: "NATIONAL" | "COMPANY" | "CUTI_BERSAMA";
};

const today = "2026-03-23";
const yesterday = "2026-03-22";
const twoDaysAgo = "2026-03-21";

export const attendanceRecords: AttendanceRecord[] = [
  { id: "att-1", employeeId: "emp-1", employeeName: "Budi Santoso", date: today, checkIn: "07:55", checkOut: "17:05", lateMinutes: 0, earlyLeaveMin: 0, workMinutes: 480, overtimeMinutes: 5, status: "PRESENT", isManualEntry: false },
  { id: "att-2", employeeId: "emp-2", employeeName: "Sari Dewi", date: today, checkIn: "08:00", checkOut: "17:00", lateMinutes: 0, earlyLeaveMin: 0, workMinutes: 480, overtimeMinutes: 0, status: "PRESENT", isManualEntry: false },
  { id: "att-3", employeeId: "emp-3", employeeName: "Andi Wijaya", date: today, checkIn: "08:15", checkOut: "17:30", lateMinutes: 15, earlyLeaveMin: 0, workMinutes: 480, overtimeMinutes: 30, status: "LATE", isManualEntry: false },
  { id: "att-4", employeeId: "emp-4", employeeName: "Dewi Lestari", date: today, checkIn: "08:02", checkOut: null, lateMinutes: 2, earlyLeaveMin: 0, workMinutes: 0, overtimeMinutes: 0, status: "PRESENT", isManualEntry: false },
  { id: "att-5", employeeId: "emp-5", employeeName: "Rizky Ramadhan", date: today, checkIn: null, checkOut: null, lateMinutes: 0, earlyLeaveMin: 0, workMinutes: 0, overtimeMinutes: 0, status: "ABSENT", isManualEntry: false },
  { id: "att-6", employeeId: "emp-6", employeeName: "Fitri Handayani", date: today, checkIn: null, checkOut: null, lateMinutes: 0, earlyLeaveMin: 0, workMinutes: 0, overtimeMinutes: 0, status: "SICK", isManualEntry: false },
  { id: "att-7", employeeId: "emp-7", employeeName: "Agus Prabowo", date: today, checkIn: "07:50", checkOut: "17:00", lateMinutes: 0, earlyLeaveMin: 0, workMinutes: 480, overtimeMinutes: 0, status: "PRESENT", isManualEntry: false },
  { id: "att-8", employeeId: "emp-8", employeeName: "Rini Susanti", date: today, checkIn: "08:00", checkOut: "17:10", lateMinutes: 0, earlyLeaveMin: 0, workMinutes: 480, overtimeMinutes: 10, status: "PRESENT", isManualEntry: false },
  { id: "att-9", employeeId: "emp-9", employeeName: "Maya Putri", date: today, checkIn: null, checkOut: null, lateMinutes: 0, earlyLeaveMin: 0, workMinutes: 0, overtimeMinutes: 0, status: "LEAVE", isManualEntry: false },
  { id: "att-10", employeeId: "emp-10", employeeName: "Deni Pratama", date: today, checkIn: "08:30", checkOut: "17:00", lateMinutes: 30, earlyLeaveMin: 0, workMinutes: 450, overtimeMinutes: 0, status: "LATE", isManualEntry: false },
  { id: "att-11", employeeId: "emp-11", employeeName: "Fajar Nugroho", date: today, checkIn: "08:00", checkOut: "17:00", lateMinutes: 0, earlyLeaveMin: 0, workMinutes: 480, overtimeMinutes: 0, status: "PRESENT", isManualEntry: false },
  { id: "att-12", employeeId: "emp-12", employeeName: "Nadia Kartika", date: today, checkIn: "07:58", checkOut: "16:50", lateMinutes: 0, earlyLeaveMin: 10, workMinutes: 470, overtimeMinutes: 0, status: "PRESENT", isManualEntry: false },
  { id: "att-13", employeeId: "emp-13", employeeName: "Hendra Saputra", date: today, checkIn: null, checkOut: null, lateMinutes: 0, earlyLeaveMin: 0, workMinutes: 0, overtimeMinutes: 0, status: "BUSINESS_TRIP", isManualEntry: false },
  { id: "att-14", employeeId: "emp-14", employeeName: "Putri Rahayu", date: today, checkIn: "08:05", checkOut: "17:00", lateMinutes: 5, earlyLeaveMin: 0, workMinutes: 475, overtimeMinutes: 0, status: "PRESENT", isManualEntry: false },
  { id: "att-15", employeeId: "emp-15", employeeName: "Wahyu Hidayat", date: today, checkIn: "08:00", checkOut: "19:00", lateMinutes: 0, earlyLeaveMin: 0, workMinutes: 480, overtimeMinutes: 120, status: "PRESENT", isManualEntry: false },
];

export const overtimeRecords: OvertimeRecord[] = [
  { id: "ot-1", employeeId: "emp-3", employeeName: "Andi Wijaya", date: yesterday, startTime: "17:00", endTime: "20:00", plannedMinutes: 180, reason: "Deployment server produksi", status: "APPROVED", approvedBy: "Budi Santoso" },
  { id: "ot-2", employeeId: "emp-15", employeeName: "Wahyu Hidayat", date: today, startTime: "17:00", endTime: "19:00", plannedMinutes: 120, reason: "Maintenance mesin produksi", status: "PENDING", approvedBy: null },
  { id: "ot-3", employeeId: "emp-4", employeeName: "Dewi Lestari", date: twoDaysAgo, startTime: "17:00", endTime: "19:30", plannedMinutes: 150, reason: "Bug fixing release v2.1", status: "APPROVED", approvedBy: "Andi Wijaya" },
  { id: "ot-4", employeeId: "emp-11", employeeName: "Fajar Nugroho", date: today, startTime: "17:00", endTime: "20:00", plannedMinutes: 180, reason: "Migrasi database", status: "PENDING", approvedBy: null },
  { id: "ot-5", employeeId: "emp-13", employeeName: "Hendra Saputra", date: yesterday, startTime: "17:00", endTime: "18:30", plannedMinutes: 90, reason: "Follow up client", status: "REJECTED", approvedBy: "Deni Pratama" },
];

export const holidays: HolidayRecord[] = [
  { id: "hol-1", name: "Tahun Baru 2026", date: "2026-01-01", type: "NATIONAL" },
  { id: "hol-2", name: "Isra Miraj", date: "2026-01-27", type: "NATIONAL" },
  { id: "hol-3", name: "Imlek", date: "2026-02-17", type: "NATIONAL" },
  { id: "hol-4", name: "Hari Raya Nyepi", date: "2026-03-19", type: "NATIONAL" },
  { id: "hol-5", name: "Wafat Isa Almasih", date: "2026-04-03", type: "NATIONAL" },
  { id: "hol-6", name: "Hari Buruh", date: "2026-05-01", type: "NATIONAL" },
  { id: "hol-7", name: "Kenaikan Isa Almasih", date: "2026-05-14", type: "NATIONAL" },
  { id: "hol-8", name: "Hari Lahir Pancasila", date: "2026-06-01", type: "NATIONAL" },
  { id: "hol-9", name: "Idul Adha", date: "2026-06-17", type: "NATIONAL" },
  { id: "hol-10", name: "Tahun Baru Islam", date: "2026-07-07", type: "NATIONAL" },
  { id: "hol-11", name: "Hari Kemerdekaan RI", date: "2026-08-17", type: "NATIONAL" },
  { id: "hol-12", name: "Maulid Nabi", date: "2026-09-16", type: "NATIONAL" },
  { id: "hol-13", name: "Hari Natal", date: "2026-12-25", type: "NATIONAL" },
  { id: "hol-14", name: "HUT Perusahaan", date: "2026-10-15", type: "COMPANY" },
];
