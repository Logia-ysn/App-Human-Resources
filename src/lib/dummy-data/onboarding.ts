export type OnboardingTask = {
  id: string;
  title: string;
  category: "DOKUMEN" | "TRAINING" | "EQUIPMENT" | "AKUN" | "LAINNYA";
  assignee: "HR" | "IT" | "KARYAWAN" | "MANAGER";
  dueDay: number;
};

export type OnboardingTemplate = {
  id: string;
  name: string;
  description: string;
  tasks: OnboardingTask[];
  isActive: boolean;
};

export type EmployeeOnboardingTask = {
  taskId: string;
  title: string;
  category: string;
  assignee: string;
  isCompleted: boolean;
  completedAt: string | null;
};

export type EmployeeOnboarding = {
  id: string;
  employeeId: string;
  employeeName: string;
  departmentName: string;
  positionName: string;
  templateName: string;
  startDate: string;
  status: "IN_PROGRESS" | "COMPLETED";
  tasks: EmployeeOnboardingTask[];
};

export const onboardingTemplates: OnboardingTemplate[] = [
  {
    id: "tpl-1",
    name: "Standard Onboarding",
    description: "Template onboarding standar untuk karyawan baru",
    isActive: true,
    tasks: [
      { id: "t-1", title: "Kumpulkan fotokopi KTP", category: "DOKUMEN", assignee: "KARYAWAN", dueDay: 1 },
      { id: "t-2", title: "Kumpulkan fotokopi NPWP", category: "DOKUMEN", assignee: "KARYAWAN", dueDay: 1 },
      { id: "t-3", title: "Kumpulkan ijazah terakhir", category: "DOKUMEN", assignee: "KARYAWAN", dueDay: 3 },
      { id: "t-4", title: "Foto 3x4 (2 lembar)", category: "DOKUMEN", assignee: "KARYAWAN", dueDay: 3 },
      { id: "t-5", title: "Setup email perusahaan", category: "AKUN", assignee: "IT", dueDay: 1 },
      { id: "t-6", title: "Setup akses sistem HRIS", category: "AKUN", assignee: "IT", dueDay: 1 },
      { id: "t-7", title: "Penyerahan laptop/PC", category: "EQUIPMENT", assignee: "IT", dueDay: 1 },
      { id: "t-8", title: "ID Card karyawan", category: "EQUIPMENT", assignee: "HR", dueDay: 3 },
      { id: "t-9", title: "Orientasi perusahaan", category: "TRAINING", assignee: "HR", dueDay: 1 },
      { id: "t-10", title: "Training SOP departemen", category: "TRAINING", assignee: "MANAGER", dueDay: 7 },
      { id: "t-11", title: "Perkenalan tim", category: "LAINNYA", assignee: "MANAGER", dueDay: 1 },
      { id: "t-12", title: "Daftarkan BPJS Kesehatan", category: "DOKUMEN", assignee: "HR", dueDay: 14 },
      { id: "t-13", title: "Daftarkan BPJS Ketenagakerjaan", category: "DOKUMEN", assignee: "HR", dueDay: 14 },
    ],
  },
  {
    id: "tpl-2",
    name: "Onboarding Magang",
    description: "Template onboarding untuk anak magang",
    isActive: true,
    tasks: [
      { id: "t-20", title: "Kumpulkan fotokopi KTP", category: "DOKUMEN", assignee: "KARYAWAN", dueDay: 1 },
      { id: "t-21", title: "Surat pengantar kampus", category: "DOKUMEN", assignee: "KARYAWAN", dueDay: 1 },
      { id: "t-22", title: "Setup email perusahaan", category: "AKUN", assignee: "IT", dueDay: 1 },
      { id: "t-23", title: "Penyerahan laptop/PC", category: "EQUIPMENT", assignee: "IT", dueDay: 1 },
      { id: "t-24", title: "Orientasi perusahaan", category: "TRAINING", assignee: "HR", dueDay: 1 },
      { id: "t-25", title: "Perkenalan tim", category: "LAINNYA", assignee: "MANAGER", dueDay: 1 },
    ],
  },
];

export const employeeOnboardings: EmployeeOnboarding[] = [
  {
    id: "onb-1",
    employeeId: "emp-014",
    employeeName: "Dewi Lestari",
    departmentName: "Information Technology",
    positionName: "Software Developer",
    templateName: "Standard Onboarding",
    startDate: "2026-03-15",
    status: "IN_PROGRESS",
    tasks: [
      { taskId: "t-1", title: "Kumpulkan fotokopi KTP", category: "DOKUMEN", assignee: "KARYAWAN", isCompleted: true, completedAt: "2026-03-15" },
      { taskId: "t-2", title: "Kumpulkan fotokopi NPWP", category: "DOKUMEN", assignee: "KARYAWAN", isCompleted: true, completedAt: "2026-03-15" },
      { taskId: "t-3", title: "Kumpulkan ijazah terakhir", category: "DOKUMEN", assignee: "KARYAWAN", isCompleted: true, completedAt: "2026-03-16" },
      { taskId: "t-4", title: "Foto 3x4 (2 lembar)", category: "DOKUMEN", assignee: "KARYAWAN", isCompleted: false, completedAt: null },
      { taskId: "t-5", title: "Setup email perusahaan", category: "AKUN", assignee: "IT", isCompleted: true, completedAt: "2026-03-15" },
      { taskId: "t-6", title: "Setup akses sistem HRIS", category: "AKUN", assignee: "IT", isCompleted: true, completedAt: "2026-03-15" },
      { taskId: "t-7", title: "Penyerahan laptop/PC", category: "EQUIPMENT", assignee: "IT", isCompleted: true, completedAt: "2026-03-15" },
      { taskId: "t-8", title: "ID Card karyawan", category: "EQUIPMENT", assignee: "HR", isCompleted: false, completedAt: null },
      { taskId: "t-9", title: "Orientasi perusahaan", category: "TRAINING", assignee: "HR", isCompleted: true, completedAt: "2026-03-15" },
      { taskId: "t-10", title: "Training SOP departemen", category: "TRAINING", assignee: "MANAGER", isCompleted: false, completedAt: null },
      { taskId: "t-11", title: "Perkenalan tim", category: "LAINNYA", assignee: "MANAGER", isCompleted: true, completedAt: "2026-03-15" },
      { taskId: "t-12", title: "Daftarkan BPJS Kesehatan", category: "DOKUMEN", assignee: "HR", isCompleted: false, completedAt: null },
      { taskId: "t-13", title: "Daftarkan BPJS Ketenagakerjaan", category: "DOKUMEN", assignee: "HR", isCompleted: false, completedAt: null },
    ],
  },
  {
    id: "onb-2",
    employeeId: "emp-015",
    employeeName: "Rini Susanti",
    departmentName: "Marketing",
    positionName: "Content Writer",
    templateName: "Standard Onboarding",
    startDate: "2026-03-01",
    status: "COMPLETED",
    tasks: [
      { taskId: "t-1", title: "Kumpulkan fotokopi KTP", category: "DOKUMEN", assignee: "KARYAWAN", isCompleted: true, completedAt: "2026-03-01" },
      { taskId: "t-2", title: "Kumpulkan fotokopi NPWP", category: "DOKUMEN", assignee: "KARYAWAN", isCompleted: true, completedAt: "2026-03-01" },
      { taskId: "t-9", title: "Orientasi perusahaan", category: "TRAINING", assignee: "HR", isCompleted: true, completedAt: "2026-03-01" },
      { taskId: "t-10", title: "Training SOP departemen", category: "TRAINING", assignee: "MANAGER", isCompleted: true, completedAt: "2026-03-05" },
    ],
  },
];
