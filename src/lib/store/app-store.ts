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

import {
  defaultPayrollConfig,
  type PayrollConfig,
} from "@/lib/dummy-data/payroll-config";

import {
  defaultAppConfig,
  type AppConfig,
} from "@/lib/dummy-data/app-config";

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
  payrollConfig: PayrollConfig;
  appConfig: AppConfig;

  // Flags
  isUsingDemoData: boolean;
  hasBeenInitialized: boolean;

  // Global actions
  resetAllData: () => void;
  restoreDemoData: () => void;

  // Employee CRUD
  addEmployee: (emp: Employee) => void;
  updateEmployee: (id: string, data: Partial<Employee>) => void;
  deleteEmployee: (id: string) => void;

  // Department CRUD
  addDepartment: (dept: Department) => void;
  updateDepartment: (id: string, data: Partial<Department>) => void;
  deleteDepartment: (id: string) => void;

  // Position CRUD
  addPosition: (pos: Position) => void;
  updatePosition: (id: string, data: Partial<Position>) => void;
  deletePosition: (id: string) => void;

  // Computed helpers
  getActiveEmployees: () => Employee[];

  // Attendance
  addAttendanceRecord: (rec: AttendanceRecord) => void;
  updateAttendanceRecord: (id: string, data: Partial<AttendanceRecord>) => void;
  deleteAttendanceRecord: (id: string) => void;
  addOvertimeRecord: (rec: OvertimeRecord) => void;
  updateOvertimeRecord: (id: string, data: Partial<OvertimeRecord>) => void;
  addHoliday: (h: HolidayRecord) => void;
  updateHoliday: (id: string, data: Partial<HolidayRecord>) => void;
  deleteHoliday: (id: string) => void;

  // Leave
  addLeaveRequest: (req: LeaveRequestRecord) => void;
  updateLeaveRequest: (id: string, data: Partial<LeaveRequestRecord>) => void;
  approveLeaveRequest: (id: string, approvedBy: string) => void;
  rejectLeaveRequest: (id: string, approvedBy: string, note?: string) => void;
  cancelLeaveRequest: (id: string) => void;
  updateLeaveBalance: (id: string, data: Partial<LeaveBalanceRecord>) => void;
  addLeaveType: (lt: LeaveTypeRecord) => void;
  updateLeaveType: (id: string, data: Partial<LeaveTypeRecord>) => void;
  deleteLeaveType: (id: string) => void;

  // Payroll
  addPayrollPeriod: (p: PayrollPeriodRecord) => void;
  updatePayrollPeriod: (id: string, data: Partial<PayrollPeriodRecord>) => void;
  addPayslip: (p: PayslipRecord) => void;
  updatePayslip: (id: string, data: Partial<PayslipRecord>) => void;

  // Recruitment
  addJobPosting: (jp: JobPostingRecord) => void;
  updateJobPosting: (id: string, data: Partial<JobPostingRecord>) => void;
  deleteJobPosting: (id: string) => void;
  addApplicant: (a: ApplicantRecord) => void;
  updateApplicant: (id: string, data: Partial<ApplicantRecord>) => void;
  deleteApplicant: (id: string) => void;

  // Performance
  addReviewCycle: (rc: ReviewCycleRecord) => void;
  updateReviewCycle: (id: string, data: Partial<ReviewCycleRecord>) => void;
  addPerformanceReview: (pr: PerformanceReviewRecord) => void;
  updatePerformanceReview: (id: string, data: Partial<PerformanceReviewRecord>) => void;

  // Training
  addTraining: (t: TrainingRecord) => void;
  updateTraining: (id: string, data: Partial<TrainingRecord>) => void;
  deleteTraining: (id: string) => void;
  addTrainingParticipant: (tp: TrainingParticipantRecord) => void;
  updateTrainingParticipant: (id: string, data: Partial<TrainingParticipantRecord>) => void;

  // Onboarding
  addOnboardingTemplate: (t: OnboardingTemplate) => void;
  updateOnboardingTemplate: (id: string, data: Partial<OnboardingTemplate>) => void;
  deleteOnboardingTemplate: (id: string) => void;
  addEmployeeOnboarding: (o: EmployeeOnboarding) => void;
  updateEmployeeOnboarding: (id: string, data: Partial<EmployeeOnboarding>) => void;

  // Lifecycle
  addLifecycleEvent: (e: LifecycleEvent) => void;

  // Expenses
  addEmployeeAdvance: (a: EmployeeAdvance) => void;
  updateEmployeeAdvance: (id: string, data: Partial<EmployeeAdvance>) => void;
  addExpenseClaim: (c: ExpenseClaim) => void;
  updateExpenseClaim: (id: string, data: Partial<ExpenseClaim>) => void;

  // Shifts
  addShiftType: (st: ShiftType) => void;
  updateShiftType: (id: string, data: Partial<ShiftType>) => void;
  deleteShiftType: (id: string) => void;
  addShiftAssignment: (sa: ShiftAssignment) => void;
  updateShiftAssignment: (id: string, data: Partial<ShiftAssignment>) => void;
  deleteShiftAssignment: (id: string) => void;

  // Company settings
  updateCompanySettings: (data: Partial<CompanySettings>) => void;

  // Payroll config
  updatePayrollConfig: (data: Partial<PayrollConfig>) => void;

  // App config
  updateAppConfig: (data: Partial<AppConfig>) => void;

  // Activity feed
  addActivityItem: (item: ActivityItem) => void;
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
    payrollConfig: { ...defaultPayrollConfig },
    appConfig: { ...defaultAppConfig },
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
    payrollConfig: { ...defaultPayrollConfig },
    appConfig: { ...defaultAppConfig },
  };
}

// ---------- Constants ----------
const MAX_ACTIVITY_FEED = 100;

// ---------- Generic helpers ----------
function addTo<T>(arr: T[], item: T): T[] {
  return [...arr, item];
}

function updateIn<T extends { id: string }>(arr: T[], id: string, data: Partial<T>): T[] {
  return arr.map((item) => (item.id === id ? { ...item, ...data } : item));
}

function removeFrom<T extends { id: string }>(arr: T[], id: string): T[] {
  return arr.filter((item) => item.id !== id);
}

// ---------- Store ----------
export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Default: start with demo data
      ...getDemoSnapshot(),
      isUsingDemoData: true,
      hasBeenInitialized: true,

      // Global
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

      // Computed helpers
      getActiveEmployees: () => {
        return get().employees.filter((e) => !e.isDeleted);
      },

      // Employee — soft delete + cascade cleanup
      addEmployee: (emp) =>
        set((s) => ({ employees: addTo(s.employees, emp) })),
      updateEmployee: (id, data) =>
        set((s) => ({ employees: updateIn(s.employees, id, data) })),
      deleteEmployee: (id) =>
        set((s) => ({
          employees: updateIn(s.employees, id, { isDeleted: true } as Partial<Employee>),
          // Deactivate related shift assignments
          shiftAssignments: s.shiftAssignments.map((sa) =>
            sa.employeeId === id ? { ...sa, isActive: false } : sa,
          ),
        })),

      // Department — soft delete via deactivation pattern + detach employees
      addDepartment: (dept) =>
        set((s) => ({ departments: addTo(s.departments, dept) })),
      updateDepartment: (id, data) =>
        set((s) => ({ departments: updateIn(s.departments, id, data) })),
      deleteDepartment: (id) =>
        set((s) => {
          const hasEmployees = s.employees.some(
            (e) => e.departmentId === id && !e.isDeleted,
          );
          if (hasEmployees) {
            // Detach employees from department
            return {
              departments: removeFrom(s.departments, id),
              employees: s.employees.map((e) =>
                e.departmentId === id
                  ? { ...e, departmentId: "", departmentName: "" }
                  : e,
              ),
              // Also remove positions linked to this department
              positions: s.positions.filter((p) => p.departmentId !== id),
            };
          }
          return {
            departments: removeFrom(s.departments, id),
            positions: s.positions.filter((p) => p.departmentId !== id),
          };
        }),

      // Position — cascade detach employees
      addPosition: (pos) =>
        set((s) => ({ positions: addTo(s.positions, pos) })),
      updatePosition: (id, data) =>
        set((s) => ({ positions: updateIn(s.positions, id, data) })),
      deletePosition: (id) =>
        set((s) => ({
          positions: removeFrom(s.positions, id),
          employees: s.employees.map((e) =>
            e.positionId === id
              ? { ...e, positionId: "", positionName: "" }
              : e,
          ),
        })),

      // Attendance
      addAttendanceRecord: (rec) =>
        set((s) => ({ attendanceRecords: addTo(s.attendanceRecords, rec) })),
      updateAttendanceRecord: (id, data) =>
        set((s) => ({ attendanceRecords: updateIn(s.attendanceRecords, id, data) })),
      deleteAttendanceRecord: (id) =>
        set((s) => ({ attendanceRecords: removeFrom(s.attendanceRecords, id) })),
      addOvertimeRecord: (rec) =>
        set((s) => ({ overtimeRecords: addTo(s.overtimeRecords, rec) })),
      updateOvertimeRecord: (id, data) =>
        set((s) => ({ overtimeRecords: updateIn(s.overtimeRecords, id, data) })),
      addHoliday: (h) =>
        set((s) => ({ holidays: addTo(s.holidays, h) })),
      updateHoliday: (id, data) =>
        set((s) => ({ holidays: updateIn(s.holidays, id, data) })),
      deleteHoliday: (id) =>
        set((s) => ({ holidays: removeFrom(s.holidays, id) })),

      // Leave — with balance management
      addLeaveRequest: (req) =>
        set((s) => {
          // When adding a new request as PENDING, increment pending balance
          const updatedBalances = s.leaveBalances.map((b) => {
            if (
              b.employeeId === req.employeeId &&
              b.leaveTypeId === req.leaveTypeId
            ) {
              return { ...b, pending: b.pending + req.totalDays };
            }
            return b;
          });
          return {
            leaveRequests: addTo(s.leaveRequests, req),
            leaveBalances: updatedBalances,
          };
        }),
      updateLeaveRequest: (id, data) =>
        set((s) => ({ leaveRequests: updateIn(s.leaveRequests, id, data) })),
      approveLeaveRequest: (id, approvedBy) =>
        set((s) => {
          const request = s.leaveRequests.find((r) => r.id === id);
          if (!request || request.status !== "PENDING") {
            return { leaveRequests: s.leaveRequests };
          }
          const updatedRequests = updateIn(s.leaveRequests, id, {
            status: "APPROVED" as const,
            approvedBy,
          });
          // Move from pending to used
          const updatedBalances = s.leaveBalances.map((b) => {
            if (
              b.employeeId === request.employeeId &&
              b.leaveTypeId === request.leaveTypeId
            ) {
              return {
                ...b,
                pending: Math.max(0, b.pending - request.totalDays),
                used: b.used + request.totalDays,
              };
            }
            return b;
          });
          return { leaveRequests: updatedRequests, leaveBalances: updatedBalances };
        }),
      rejectLeaveRequest: (id, approvedBy, note) =>
        set((s) => {
          const request = s.leaveRequests.find((r) => r.id === id);
          if (!request || request.status !== "PENDING") {
            return { leaveRequests: s.leaveRequests };
          }
          const updatedRequests = updateIn(s.leaveRequests, id, {
            status: "REJECTED" as const,
            approvedBy,
            ...(note ? { approverNote: note } : {}),
          });
          // Restore pending balance
          const updatedBalances = s.leaveBalances.map((b) => {
            if (
              b.employeeId === request.employeeId &&
              b.leaveTypeId === request.leaveTypeId
            ) {
              return {
                ...b,
                pending: Math.max(0, b.pending - request.totalDays),
              };
            }
            return b;
          });
          return { leaveRequests: updatedRequests, leaveBalances: updatedBalances };
        }),
      cancelLeaveRequest: (id) =>
        set((s) => {
          const request = s.leaveRequests.find((r) => r.id === id);
          if (!request) return { leaveRequests: s.leaveRequests };
          const wasPending = request.status === "PENDING";
          const wasApproved = request.status === "APPROVED";
          const updatedRequests = updateIn(s.leaveRequests, id, {
            status: "CANCELLED" as const,
          });
          const updatedBalances = s.leaveBalances.map((b) => {
            if (
              b.employeeId === request.employeeId &&
              b.leaveTypeId === request.leaveTypeId
            ) {
              if (wasPending) {
                return { ...b, pending: Math.max(0, b.pending - request.totalDays) };
              }
              if (wasApproved) {
                return { ...b, used: Math.max(0, b.used - request.totalDays) };
              }
            }
            return b;
          });
          return { leaveRequests: updatedRequests, leaveBalances: updatedBalances };
        }),
      updateLeaveBalance: (id, data) =>
        set((s) => ({ leaveBalances: updateIn(s.leaveBalances, id, data) })),
      addLeaveType: (lt) =>
        set((s) => ({ leaveTypes: addTo(s.leaveTypes, lt) })),
      updateLeaveType: (id, data) =>
        set((s) => ({ leaveTypes: updateIn(s.leaveTypes, id, data) })),
      deleteLeaveType: (id) =>
        set((s) => ({ leaveTypes: removeFrom(s.leaveTypes, id) })),

      // Payroll
      addPayrollPeriod: (p) =>
        set((s) => ({ payrollPeriods: addTo(s.payrollPeriods, p) })),
      updatePayrollPeriod: (id, data) =>
        set((s) => ({ payrollPeriods: updateIn(s.payrollPeriods, id, data) })),
      addPayslip: (p) =>
        set((s) => ({ payslips: addTo(s.payslips, p) })),
      updatePayslip: (id, data) =>
        set((s) => ({ payslips: updateIn(s.payslips, id, data) })),

      // Recruitment — cascade delete applicants when job posting deleted
      addJobPosting: (jp) =>
        set((s) => ({ jobPostings: addTo(s.jobPostings, jp) })),
      updateJobPosting: (id, data) =>
        set((s) => ({ jobPostings: updateIn(s.jobPostings, id, data) })),
      deleteJobPosting: (id) =>
        set((s) => ({
          jobPostings: removeFrom(s.jobPostings, id),
          applicants: s.applicants.filter((a) => a.jobPostingId !== id),
        })),
      addApplicant: (a) =>
        set((s) => ({ applicants: addTo(s.applicants, a) })),
      updateApplicant: (id, data) =>
        set((s) => ({ applicants: updateIn(s.applicants, id, data) })),
      deleteApplicant: (id) =>
        set((s) => ({ applicants: removeFrom(s.applicants, id) })),

      // Performance
      addReviewCycle: (rc) =>
        set((s) => ({ reviewCycles: addTo(s.reviewCycles, rc) })),
      updateReviewCycle: (id, data) =>
        set((s) => ({ reviewCycles: updateIn(s.reviewCycles, id, data) })),
      addPerformanceReview: (pr) =>
        set((s) => ({ performanceReviews: addTo(s.performanceReviews, pr) })),
      updatePerformanceReview: (id, data) =>
        set((s) => ({ performanceReviews: updateIn(s.performanceReviews, id, data) })),

      // Training — cascade delete participants when training deleted
      addTraining: (t) =>
        set((s) => ({ trainings: addTo(s.trainings, t) })),
      updateTraining: (id, data) =>
        set((s) => ({ trainings: updateIn(s.trainings, id, data) })),
      deleteTraining: (id) =>
        set((s) => ({
          trainings: removeFrom(s.trainings, id),
          trainingParticipants: s.trainingParticipants.filter((tp) => tp.trainingId !== id),
        })),
      addTrainingParticipant: (tp) =>
        set((s) => ({ trainingParticipants: addTo(s.trainingParticipants, tp) })),
      updateTrainingParticipant: (id, data) =>
        set((s) => ({ trainingParticipants: updateIn(s.trainingParticipants, id, data) })),

      // Onboarding
      addOnboardingTemplate: (t) =>
        set((s) => ({ onboardingTemplates: addTo(s.onboardingTemplates, t) })),
      updateOnboardingTemplate: (id, data) =>
        set((s) => ({ onboardingTemplates: updateIn(s.onboardingTemplates, id, data) })),
      deleteOnboardingTemplate: (id) =>
        set((s) => ({ onboardingTemplates: removeFrom(s.onboardingTemplates, id) })),
      addEmployeeOnboarding: (o) =>
        set((s) => ({ employeeOnboardings: addTo(s.employeeOnboardings, o) })),
      updateEmployeeOnboarding: (id, data) =>
        set((s) => ({ employeeOnboardings: updateIn(s.employeeOnboardings, id, data) })),

      // Lifecycle
      addLifecycleEvent: (e) =>
        set((s) => ({ lifecycleEvents: addTo(s.lifecycleEvents, e) })),

      // Expenses
      addEmployeeAdvance: (a) =>
        set((s) => ({ employeeAdvances: addTo(s.employeeAdvances, a) })),
      updateEmployeeAdvance: (id, data) =>
        set((s) => ({ employeeAdvances: updateIn(s.employeeAdvances, id, data) })),
      addExpenseClaim: (c) =>
        set((s) => ({ expenseClaims: addTo(s.expenseClaims, c) })),
      updateExpenseClaim: (id, data) =>
        set((s) => ({ expenseClaims: updateIn(s.expenseClaims, id, data) })),

      // Shifts
      addShiftType: (st) =>
        set((s) => ({ shiftTypes: addTo(s.shiftTypes, st) })),
      updateShiftType: (id, data) =>
        set((s) => ({ shiftTypes: updateIn(s.shiftTypes, id, data) })),
      deleteShiftType: (id) =>
        set((s) => ({
          shiftTypes: removeFrom(s.shiftTypes, id),
          shiftAssignments: s.shiftAssignments.filter((sa) => sa.shiftId !== id),
        })),
      addShiftAssignment: (sa) =>
        set((s) => ({ shiftAssignments: addTo(s.shiftAssignments, sa) })),
      updateShiftAssignment: (id, data) =>
        set((s) => ({ shiftAssignments: updateIn(s.shiftAssignments, id, data) })),
      deleteShiftAssignment: (id) =>
        set((s) => ({ shiftAssignments: removeFrom(s.shiftAssignments, id) })),

      // Company settings
      updateCompanySettings: (data) =>
        set((s) => ({ companySettings: { ...s.companySettings, ...data } })),

      // Payroll config
      updatePayrollConfig: (data) =>
        set((s) => ({ payrollConfig: { ...s.payrollConfig, ...data } })),

      // App config
      updateAppConfig: (data) =>
        set((s) => ({ appConfig: { ...s.appConfig, ...data } })),

      // Activity feed — capped at MAX_ACTIVITY_FEED
      addActivityItem: (item) =>
        set((s) => ({
          activityFeed: [item, ...s.activityFeed].slice(0, MAX_ACTIVITY_FEED),
        })),
    }),
    {
      name: "hris-app-store",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) =>
        Object.fromEntries(
          Object.entries(state).filter(
            ([, v]) => typeof v !== "function",
          ),
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ) as any,
    },
  ),
);
