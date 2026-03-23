export type TrainingRecord = {
  id: string;
  title: string;
  category: "TECHNICAL" | "SOFT_SKILL" | "COMPLIANCE" | "CERTIFICATION" | "ONBOARDING";
  provider: string;
  trainer: string;
  method: "ONLINE" | "OFFLINE" | "HYBRID";
  location: string;
  startDate: string;
  endDate: string;
  maxParticipants: number;
  enrolledCount: number;
  costPerPerson: number;
  status: "PLANNED" | "REGISTRATION_OPEN" | "IN_PROGRESS" | "COMPLETED";
  createdAt: string;
};

export type TrainingParticipantRecord = {
  id: string;
  trainingId: string;
  trainingTitle: string;
  employeeId: string;
  employeeName: string;
  departmentName: string;
  status: "REGISTERED" | "ATTENDED" | "COMPLETED_TRAINING" | "ABSENT";
  score: number | null;
  isPassed: boolean | null;
  rating: number | null;
};

export const trainings: TrainingRecord[] = [
  { id: "tr-1", title: "React & Next.js Advanced", category: "TECHNICAL", provider: "Tech Academy ID", trainer: "Dr. Adi Nugraha", method: "ONLINE", location: "Zoom", startDate: "2026-04-01", endDate: "2026-04-03", maxParticipants: 20, enrolledCount: 8, costPerPerson: 2500000, status: "REGISTRATION_OPEN", createdAt: "2026-03-10" },
  { id: "tr-2", title: "Leadership for Managers", category: "SOFT_SKILL", provider: "HR Development Center", trainer: "Ibu Ratna Sari", method: "OFFLINE", location: "Ruang Training Lt. 3", startDate: "2026-04-15", endDate: "2026-04-16", maxParticipants: 15, enrolledCount: 6, costPerPerson: 3000000, status: "PLANNED", createdAt: "2026-03-15" },
  { id: "tr-3", title: "K3 Workplace Safety", category: "COMPLIANCE", provider: "Safety First Indonesia", trainer: "Bpk. Hendra Wijaya", method: "OFFLINE", location: "Aula Utama", startDate: "2026-03-15", endDate: "2026-03-15", maxParticipants: 50, enrolledCount: 15, costPerPerson: 500000, status: "COMPLETED", createdAt: "2026-02-20" },
  { id: "tr-4", title: "AWS Cloud Practitioner", category: "CERTIFICATION", provider: "AWS Training Partner", trainer: "Online Self-Paced", method: "ONLINE", location: "AWS Platform", startDate: "2026-03-01", endDate: "2026-05-31", maxParticipants: 10, enrolledCount: 4, costPerPerson: 5000000, status: "IN_PROGRESS", createdAt: "2026-02-15" },
  { id: "tr-5", title: "Onboarding Program Q1 2026", category: "ONBOARDING", provider: "Internal HR", trainer: "Sari Dewi", method: "HYBRID", location: "Kantor + Zoom", startDate: "2026-01-15", endDate: "2026-01-17", maxParticipants: 10, enrolledCount: 2, costPerPerson: 0, status: "COMPLETED", createdAt: "2026-01-10" },
];

export const trainingParticipants: TrainingParticipantRecord[] = [
  { id: "tp-1", trainingId: "tr-3", trainingTitle: "K3 Workplace Safety", employeeId: "emp-15", employeeName: "Wahyu Hidayat", departmentName: "Operations", status: "COMPLETED_TRAINING", score: 85, isPassed: true, rating: 4 },
  { id: "tp-2", trainingId: "tr-3", trainingTitle: "K3 Workplace Safety", employeeId: "emp-6", employeeName: "Fitri Handayani", departmentName: "Human Resources", status: "COMPLETED_TRAINING", score: 90, isPassed: true, rating: 5 },
  { id: "tp-3", trainingId: "tr-4", trainingTitle: "AWS Cloud Practitioner", employeeId: "emp-3", employeeName: "Andi Wijaya", departmentName: "Information Technology", status: "ATTENDED", score: null, isPassed: null, rating: null },
  { id: "tp-4", trainingId: "tr-4", trainingTitle: "AWS Cloud Practitioner", employeeId: "emp-4", employeeName: "Dewi Lestari", departmentName: "Information Technology", status: "ATTENDED", score: null, isPassed: null, rating: null },
  { id: "tp-5", trainingId: "tr-1", trainingTitle: "React & Next.js Advanced", employeeId: "emp-4", employeeName: "Dewi Lestari", departmentName: "Information Technology", status: "REGISTERED", score: null, isPassed: null, rating: null },
  { id: "tp-6", trainingId: "tr-1", trainingTitle: "React & Next.js Advanced", employeeId: "emp-11", employeeName: "Fajar Nugroho", departmentName: "Information Technology", status: "REGISTERED", score: null, isPassed: null, rating: null },
  { id: "tp-7", trainingId: "tr-5", trainingTitle: "Onboarding Program Q1 2026", employeeId: "emp-7", employeeName: "Agus Prabowo", departmentName: "Information Technology", status: "COMPLETED_TRAINING", score: 88, isPassed: true, rating: 4 },
];

export const CATEGORY_LABELS: Record<string, string> = {
  TECHNICAL: "Teknikal",
  SOFT_SKILL: "Soft Skill",
  COMPLIANCE: "Kepatuhan",
  CERTIFICATION: "Sertifikasi",
  ONBOARDING: "Onboarding",
};

export const METHOD_LABELS: Record<string, string> = {
  ONLINE: "Online",
  OFFLINE: "Offline",
  HYBRID: "Hybrid",
};

export const TRAINING_STATUS_LABELS: Record<string, string> = {
  PLANNED: "Direncanakan",
  REGISTRATION_OPEN: "Pendaftaran Buka",
  IN_PROGRESS: "Berlangsung",
  COMPLETED: "Selesai",
};
