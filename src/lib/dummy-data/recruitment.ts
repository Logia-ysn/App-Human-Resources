export type JobPostingRecord = {
  id: string;
  title: string;
  departmentName: string;
  positionName: string;
  type: "PERMANENT" | "CONTRACT" | "INTERNSHIP";
  location: string;
  vacancies: number;
  salaryMin: number | null;
  salaryMax: number | null;
  showSalary: boolean;
  status: "DRAFT" | "PUBLISHED" | "CLOSED" | "ON_HOLD";
  applicantCount: number;
  publishedAt: string | null;
  closingDate: string | null;
  createdAt: string;
};

export type ApplicantRecord = {
  id: string;
  jobPostingId: string;
  jobTitle: string;
  name: string;
  email: string;
  phone: string;
  source: string;
  expectedSalary: number | null;
  yearsExperience: number;
  status: "NEW" | "SCREENING" | "SHORTLISTED" | "INTERVIEW" | "OFFERED" | "ACCEPTED" | "REJECTED" | "WITHDRAWN";
  createdAt: string;
};

export const jobPostings: JobPostingRecord[] = [
  { id: "job-1", title: "Senior Software Developer", departmentName: "Information Technology", positionName: "Software Developer", type: "PERMANENT", location: "Jakarta Selatan", vacancies: 2, salaryMin: 12000000, salaryMax: 18000000, showSalary: true, status: "PUBLISHED", applicantCount: 8, publishedAt: "2026-03-01", closingDate: "2026-04-15", createdAt: "2026-02-28" },
  { id: "job-2", title: "Marketing Staff", departmentName: "Marketing", positionName: "Marketing Staff", type: "PERMANENT", location: "Jakarta Selatan", vacancies: 1, salaryMin: 6000000, salaryMax: 10000000, showSalary: false, status: "PUBLISHED", applicantCount: 12, publishedAt: "2026-03-10", closingDate: "2026-04-30", createdAt: "2026-03-08" },
  { id: "job-3", title: "Accounting Staff", departmentName: "Finance & Accounting", positionName: "Accountant", type: "CONTRACT", location: "Jakarta Selatan", vacancies: 1, salaryMin: 7000000, salaryMax: 10000000, showSalary: true, status: "PUBLISHED", applicantCount: 5, publishedAt: "2026-03-15", closingDate: "2026-04-20", createdAt: "2026-03-12" },
  { id: "job-4", title: "Sales Executive", departmentName: "Sales", positionName: "Sales Executive", type: "PERMANENT", location: "Jakarta Selatan", vacancies: 3, salaryMin: null, salaryMax: null, showSalary: false, status: "DRAFT", applicantCount: 0, publishedAt: null, closingDate: null, createdAt: "2026-03-20" },
  { id: "job-5", title: "IT Intern", departmentName: "Information Technology", positionName: "Software Developer", type: "INTERNSHIP", location: "Jakarta Selatan", vacancies: 2, salaryMin: 3000000, salaryMax: 4000000, showSalary: true, status: "CLOSED", applicantCount: 20, publishedAt: "2026-01-05", closingDate: "2026-02-28", createdAt: "2026-01-03" },
];

export const applicants: ApplicantRecord[] = [
  { id: "app-1", jobPostingId: "job-1", jobTitle: "Senior Software Developer", name: "Ahmad Fauzi", email: "ahmad.fauzi@gmail.com", phone: "081300000001", source: "LinkedIn", expectedSalary: 16000000, yearsExperience: 5, status: "INTERVIEW", createdAt: "2026-03-05" },
  { id: "app-2", jobPostingId: "job-1", jobTitle: "Senior Software Developer", name: "Bambang Tri", email: "bambang.tri@gmail.com", phone: "081300000002", source: "JobStreet", expectedSalary: 15000000, yearsExperience: 4, status: "SHORTLISTED", createdAt: "2026-03-06" },
  { id: "app-3", jobPostingId: "job-1", jobTitle: "Senior Software Developer", name: "Citra Ayu", email: "citra.ayu@gmail.com", phone: "081300000003", source: "Referral", expectedSalary: 17000000, yearsExperience: 6, status: "NEW", createdAt: "2026-03-15" },
  { id: "app-4", jobPostingId: "job-2", jobTitle: "Marketing Staff", name: "Diana Permata", email: "diana.p@gmail.com", phone: "081300000004", source: "Glints", expectedSalary: 7500000, yearsExperience: 2, status: "OFFERED", createdAt: "2026-03-12" },
  { id: "app-5", jobPostingId: "job-2", jobTitle: "Marketing Staff", name: "Eko Prasetyo", email: "eko.prasetyo@gmail.com", phone: "081300000005", source: "LinkedIn", expectedSalary: 8000000, yearsExperience: 3, status: "REJECTED", createdAt: "2026-03-11" },
  { id: "app-6", jobPostingId: "job-3", jobTitle: "Accounting Staff", name: "Fitriani Wulan", email: "fitriani.w@gmail.com", phone: "081300000006", source: "JobStreet", expectedSalary: 8000000, yearsExperience: 2, status: "SCREENING", createdAt: "2026-03-16" },
  { id: "app-7", jobPostingId: "job-1", jobTitle: "Senior Software Developer", name: "Gunawan Saiful", email: "gunawan.s@gmail.com", phone: "081300000007", source: "Website", expectedSalary: 14000000, yearsExperience: 3, status: "SCREENING", createdAt: "2026-03-18" },
];
