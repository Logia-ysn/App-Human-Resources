"use client";

import useSWR from "swr";
import { fetcher } from "@/lib/api-client";

export type JobPostingWithRelations = {
  id: string;
  title: string;
  type: string;
  description: string;
  requirements: string;
  salaryMin: string | null;
  salaryMax: string | null;
  showSalary: boolean;
  location: string;
  vacancies: number;
  status: string;
  publishedAt: string | null;
  closingDate: string | null;
  position: { id: string; name: string };
  department: { id: string; name: string };
  createdBy: { id: string; firstName: string; lastName: string };
  _count: { applicants: number };
};

export type ApplicantWithRelations = {
  id: string;
  jobPostingId: string;
  name: string;
  email: string;
  phone: string;
  linkedinUrl: string | null;
  expectedSalary: string | null;
  yearsExperience: number | null;
  currentCompany: string | null;
  status: string;
  createdAt: string;
  jobPosting: {
    id: string;
    title: string;
    department: { name: string };
  };
  interviews: Array<{
    id: string;
    round: number;
    status: string;
    scheduledAt: string;
  }>;
};

export function useJobPostings(params: { status?: string } = {}) {
  const qs = new URLSearchParams();
  if (params.status) qs.set("status", params.status);
  const query = qs.toString();
  const { data, error, isLoading, mutate } = useSWR<JobPostingWithRelations[]>(
    `/api/recruitment/postings${query ? `?${query}` : ""}`,
    fetcher,
  );
  return { postings: data ?? [], error, isLoading, mutate };
}

export function useApplicants(params: { status?: string; postingId?: string } = {}) {
  const qs = new URLSearchParams();
  if (params.status) qs.set("status", params.status);
  if (params.postingId) qs.set("postingId", params.postingId);
  const query = qs.toString();
  const { data, error, isLoading, mutate } = useSWR<ApplicantWithRelations[]>(
    `/api/recruitment/applicants${query ? `?${query}` : ""}`,
    fetcher,
  );
  return { applicants: data ?? [], error, isLoading, mutate };
}
