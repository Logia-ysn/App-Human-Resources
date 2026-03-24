"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

import {
  employees as demoEmployees,
  departments as demoDepartments,
  positions as demoPositions,
  attendanceRecords as demoAttendanceRecords,
  leaveRequests as demoLeaveRequests,
  leaveBalances as demoLeaveBalances,
  leaveTypes as demoLeaveTypes,
  payrollPeriods as demoPayrollPeriods,
  payslips as demoPayslips,
  jobPostings as demoJobPostings,
  applicants as demoApplicants,
  reviewCycles as demoReviewCycles,
  performanceReviews as demoPerformanceReviews,
  trainings as demoTrainings,
  trainingParticipants as demoTrainingParticipants,
  companySettings as demoCompanySettings,
  attendanceTrend as demoAttendanceTrend,
  leaveDistribution as demoLeaveDistribution,
  activityFeed as demoActivityFeed,
  type Employee,
  type Department,
  type Position,
  type AttendanceRecord,
  type LeaveRequestRecord,
  type LeaveBalanceRecord,
  type LeaveTypeRecord,
  type PayrollPeriodRecord,
  type PayslipRecord,
  type JobPostingRecord,
  type ApplicantRecord,
  type ReviewCycleRecord,
  type PerformanceReviewRecord,
  type TrainingRecord,
  type TrainingParticipantRecord,
  type CompanySettings,
  type AttendanceTrendPoint,
  type LeaveDistribution,
  type ActivityItem,
} from "@/lib/dummy-data";

import {
  overtimeRecords as demoOvertimeRecords,
  holidays as demoHolidays,
  type OvertimeRecord,
  type HolidayRecord,
} from "@/lib/dummy-data/attendance";

import {
  onboardingTemplates as demoOnboardingTemplates,
  employeeOnboardings as demoEmployeeOnboardings,
  type OnboardingTemplate,
  type EmployeeOnboarding,
} from "@/lib/dummy-data/onboarding";

import {
  lifecycleEvents as demoLifecycleEvents,
  type LifecycleEvent,
} from "@/lib/dummy-data/lifecycle";

import {
  employeeAdvances as demoEmployeeAdvances,
  expenseClaims as demoExpenseClaims,
  type EmployeeAdvance,
  type ExpenseClaim,
} from "@/lib/dummy-data/expenses";

import {
  shiftTypes as demoShiftTypes,
  shiftAssignments as demoShiftAssignments,
  type ShiftType,
  type ShiftAssignment,
} from "@/lib/dummy-data/shifts";

// ---------- Empty company settings default ----------
const emptyCompanySettings: CompanySettings = {
  id: "",
  name: "",
  legalName: "",
  npwp: "",
  address: "",
  city: "",
  province: "",
  postalCode: "",
  phone: "",
  email: "",
  website: "",
  logoUrl: "",
  umrAmount: 0,
  umrRegion: "",
  cutOffDate: 25,
  payDate: 28,
};

// ---------- State shape ----------
type AppState = {
  // Data
  employees: Employee[];
  departments: Department[];
  positions: Position[];
  attendanceRecords: AttendanceRecord[];
  overtimeRecords: OvertimeRecord[];
  holidays: HolidayRecord[];
  leaveRequests: LeaveRequestRecord[];
  leaveBalances: LeaveBalanceRecord[];
  leaveTypes: LeaveTypeRecord[];
  payrollPeriods: PayrollPeriodRecord[];
  payslips: PayslipRecord[];
  jobPostings: JobPostingRecord[];
  applicants: ApplicantRecord[];
  reviewCycles: ReviewCycleRecord[];
  performanceReviews: PerformanceReviewRecord[];
  trainings: TrainingRecord[];
  trainingParticipants: TrainingParticipantRecord[];
  companySettings: CompanySettings;
  attendanceTrend: AttendanceTrendPoint[];
  leaveDistribution: LeaveDistribution[];
  activityFeed: ActivityItem[];
  onboardingTemplates: OnboardingTemplate[];
  employeeOnboardings: EmployeeOnboarding[];
  lifecycleEvents: LifecycleEvent[];
  employeeAdvances: EmployeeAdvance[];
  expenseClaims: ExpenseClaim[];
  shiftTypes: ShiftType[];
  shiftAssignments: ShiftAssignment[];

  // Flags
  isUsingDemoData: boolean;
  hasBeenInitialized: boolean;

  // Actions
  resetAllData: () => void;
  restoreDemoData: () => void;
};

// ---------- Fresh copies of demo data ----------
function getDemoSnapshot() {
  return {
    employees: [...demoEmployees],
    departments: [...demoDepartments],
    positions: [...demoPositions],
    attendanceRecords: [...demoAttendanceRecords],
    overtimeRecords: [...demoOvertimeRecords],
    holidays: [...demoHolidays],
    leaveRequests: [...demoLeaveRequests],
    leaveBalances: [...demoLeaveBalances],
    leaveTypes: [...demoLeaveTypes],
    payrollPeriods: [...demoPayrollPeriods],
    payslips: [...demoPayslips],
    jobPostings: [...demoJobPostings],
    applicants: [...demoApplicants],
    reviewCycles: [...demoReviewCycles],
    performanceReviews: [...demoPerformanceReviews],
    trainings: [...demoTrainings],
    trainingParticipants: [...demoTrainingParticipants],
    companySettings: { ...demoCompanySettings },
    attendanceTrend: [...demoAttendanceTrend],
    leaveDistribution: [...demoLeaveDistribution],
    activityFeed: [...demoActivityFeed],
    onboardingTemplates: [...demoOnboardingTemplates],
    employeeOnboardings: [...demoEmployeeOnboardings],
    lifecycleEvents: [...demoLifecycleEvents],
    employeeAdvances: [...demoEmployeeAdvances],
    expenseClaims: [...demoExpenseClaims],
    shiftTypes: [...demoShiftTypes],
    shiftAssignments: [...demoShiftAssignments],
  };
}

function getEmptyData() {
  return {
    employees: [] as Employee[],
    departments: [] as Department[],
    positions: [] as Position[],
    attendanceRecords: [] as AttendanceRecord[],
    overtimeRecords: [] as OvertimeRecord[],
    holidays: [] as HolidayRecord[],
    leaveRequests: [] as LeaveRequestRecord[],
    leaveBalances: [] as LeaveBalanceRecord[],
    leaveTypes: [] as LeaveTypeRecord[],
    payrollPeriods: [] as PayrollPeriodRecord[],
    payslips: [] as PayslipRecord[],
    jobPostings: [] as JobPostingRecord[],
    applicants: [] as ApplicantRecord[],
    reviewCycles: [] as ReviewCycleRecord[],
    performanceReviews: [] as PerformanceReviewRecord[],
    trainings: [] as TrainingRecord[],
    trainingParticipants: [] as TrainingParticipantRecord[],
    companySettings: { ...emptyCompanySettings },
    attendanceTrend: [] as AttendanceTrendPoint[],
    leaveDistribution: [] as LeaveDistribution[],
    activityFeed: [] as ActivityItem[],
    onboardingTemplates: [] as OnboardingTemplate[],
    employeeOnboardings: [] as EmployeeOnboarding[],
    lifecycleEvents: [] as LifecycleEvent[],
    employeeAdvances: [] as EmployeeAdvance[],
    expenseClaims: [] as ExpenseClaim[],
    shiftTypes: [] as ShiftType[],
    shiftAssignments: [] as ShiftAssignment[],
  };
}

// ---------- Store ----------
export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      // Default: start with demo data
      ...getDemoSnapshot(),
      isUsingDemoData: true,
      hasBeenInitialized: true,

      resetAllData: () =>
        set({
          ...getEmptyData(),
          isUsingDemoData: false,
          hasBeenInitialized: true,
        }),

      restoreDemoData: () =>
        set({
          ...getDemoSnapshot(),
          isUsingDemoData: true,
          hasBeenInitialized: true,
        }),
    }),
    {
      name: "hris-app-store",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => {
        // Persist everything except the action functions
        const { resetAllData: _reset, restoreDemoData: _restore, ...rest } =
          state;
        return rest;
      },
    },
  ),
);
