export type AppConfig = {
  // Jam Kerja
  defaultStartTime: string;
  defaultEndTime: string;
  lateToleranceMinutes: number;
  breakDurationMinutes: number;
  workDays: number[]; // 0=Sunday, 1=Monday ... 6=Saturday

  // Overtime
  overtimeMultiplier: number;
  minOvertimeMinutes: number;
  maxOvertimeHoursPerDay: number;

  // Cuti
  annualLeaveEntitlement: number;
  leaveWaitingPeriodMonths: number;
  maxCarryOverDays: number;
  collectiveLeaveDays: number;
  weddingLeaveDays: number;
  maternityLeaveDays: number;
  paternityLeaveDays: number;
  bereavementLeaveDays: number;
  sickWithoutNoteDays: number;

  // Absensi
  attendanceMethod: "MANUAL" | "GPS" | "FINGERPRINT";
  gpsRadiusMeters: number;
  autoCheckoutTime: string;
  allowOutOfSchedule: boolean;
};

export const defaultAppConfig: AppConfig = {
  defaultStartTime: "08:00",
  defaultEndTime: "17:00",
  lateToleranceMinutes: 15,
  breakDurationMinutes: 60,
  workDays: [1, 2, 3, 4, 5], // Mon-Fri

  overtimeMultiplier: 1.5,
  minOvertimeMinutes: 60,
  maxOvertimeHoursPerDay: 4,

  annualLeaveEntitlement: 12,
  leaveWaitingPeriodMonths: 3,
  maxCarryOverDays: 5,
  collectiveLeaveDays: 2,
  weddingLeaveDays: 3,
  maternityLeaveDays: 90,
  paternityLeaveDays: 2,
  bereavementLeaveDays: 2,
  sickWithoutNoteDays: 1,

  attendanceMethod: "MANUAL",
  gpsRadiusMeters: 100,
  autoCheckoutTime: "23:59",
  allowOutOfSchedule: false,
};
