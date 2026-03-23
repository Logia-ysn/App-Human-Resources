export type ReviewCycleRecord = {
  id: string;
  name: string;
  type: "QUARTERLY" | "SEMI_ANNUAL" | "ANNUAL";
  startDate: string;
  endDate: string;
  selfReviewDeadline: string;
  managerReviewDeadline: string;
  status: "DRAFT" | "ACTIVE" | "REVIEW_IN_PROGRESS" | "COMPLETED";
  totalReviews: number;
  completedReviews: number;
};

export type PerformanceReviewRecord = {
  id: string;
  cycleId: string;
  cycleName: string;
  employeeId: string;
  employeeName: string;
  departmentName: string;
  positionName: string;
  reviewerName: string;
  status: "NOT_STARTED" | "SELF_REVIEW" | "MANAGER_REVIEW" | "COMPLETED";
  selfScore: number | null;
  managerScore: number | null;
  finalScore: number | null;
  rating: "OUTSTANDING" | "EXCEEDS_EXPECTATIONS" | "MEETS_EXPECTATIONS" | "BELOW_EXPECTATIONS" | "UNSATISFACTORY" | null;
};

export const reviewCycles: ReviewCycleRecord[] = [
  { id: "rc-1", name: "Review H2 2025", type: "SEMI_ANNUAL", startDate: "2025-07-01", endDate: "2025-12-31", selfReviewDeadline: "2026-01-15", managerReviewDeadline: "2026-01-31", status: "COMPLETED", totalReviews: 15, completedReviews: 15 },
  { id: "rc-2", name: "Review H1 2026", type: "SEMI_ANNUAL", startDate: "2026-01-01", endDate: "2026-06-30", selfReviewDeadline: "2026-07-15", managerReviewDeadline: "2026-07-31", status: "ACTIVE", totalReviews: 15, completedReviews: 0 },
  { id: "rc-3", name: "Review Q1 2026", type: "QUARTERLY", startDate: "2026-01-01", endDate: "2026-03-31", selfReviewDeadline: "2026-04-10", managerReviewDeadline: "2026-04-20", status: "REVIEW_IN_PROGRESS", totalReviews: 15, completedReviews: 5 },
];

export const performanceReviews: PerformanceReviewRecord[] = [
  { id: "pr-1", cycleId: "rc-3", cycleName: "Review Q1 2026", employeeId: "emp-2", employeeName: "Sari Dewi", departmentName: "Human Resources", positionName: "HR Manager", reviewerName: "Budi Santoso", status: "COMPLETED", selfScore: 85, managerScore: 88, finalScore: 87, rating: "EXCEEDS_EXPECTATIONS" },
  { id: "pr-2", cycleId: "rc-3", cycleName: "Review Q1 2026", employeeId: "emp-3", employeeName: "Andi Wijaya", departmentName: "Information Technology", positionName: "IT Manager", reviewerName: "Budi Santoso", status: "COMPLETED", selfScore: 90, managerScore: 92, finalScore: 91, rating: "OUTSTANDING" },
  { id: "pr-3", cycleId: "rc-3", cycleName: "Review Q1 2026", employeeId: "emp-4", employeeName: "Dewi Lestari", departmentName: "Information Technology", positionName: "Software Developer", reviewerName: "Andi Wijaya", status: "MANAGER_REVIEW", selfScore: 82, managerScore: null, finalScore: null, rating: null },
  { id: "pr-4", cycleId: "rc-3", cycleName: "Review Q1 2026", employeeId: "emp-8", employeeName: "Rini Susanti", departmentName: "Finance & Accounting", positionName: "Finance Manager", reviewerName: "Budi Santoso", status: "COMPLETED", selfScore: 78, managerScore: 80, finalScore: 79, rating: "MEETS_EXPECTATIONS" },
  { id: "pr-5", cycleId: "rc-3", cycleName: "Review Q1 2026", employeeId: "emp-9", employeeName: "Maya Putri", departmentName: "Marketing", positionName: "Marketing Manager", reviewerName: "Budi Santoso", status: "COMPLETED", selfScore: 88, managerScore: 85, finalScore: 86, rating: "EXCEEDS_EXPECTATIONS" },
  { id: "pr-6", cycleId: "rc-3", cycleName: "Review Q1 2026", employeeId: "emp-10", employeeName: "Deni Pratama", departmentName: "Sales", positionName: "Sales Manager", reviewerName: "Budi Santoso", status: "COMPLETED", selfScore: 75, managerScore: 72, finalScore: 73, rating: "MEETS_EXPECTATIONS" },
  { id: "pr-7", cycleId: "rc-3", cycleName: "Review Q1 2026", employeeId: "emp-11", employeeName: "Fajar Nugroho", departmentName: "Information Technology", positionName: "Software Developer", reviewerName: "Andi Wijaya", status: "SELF_REVIEW", selfScore: null, managerScore: null, finalScore: null, rating: null },
  { id: "pr-8", cycleId: "rc-3", cycleName: "Review Q1 2026", employeeId: "emp-12", employeeName: "Nadia Kartika", departmentName: "Finance & Accounting", positionName: "Accountant", reviewerName: "Rini Susanti", status: "NOT_STARTED", selfScore: null, managerScore: null, finalScore: null, rating: null },
];

export const RATING_LABELS: Record<string, string> = {
  OUTSTANDING: "Luar Biasa",
  EXCEEDS_EXPECTATIONS: "Melebihi Harapan",
  MEETS_EXPECTATIONS: "Memenuhi Harapan",
  BELOW_EXPECTATIONS: "Di Bawah Harapan",
  UNSATISFACTORY: "Tidak Memuaskan",
};

export const REVIEW_STATUS_LABELS: Record<string, string> = {
  NOT_STARTED: "Belum Mulai",
  SELF_REVIEW: "Self Review",
  MANAGER_REVIEW: "Manager Review",
  COMPLETED: "Selesai",
};
