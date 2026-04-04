import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { apiGuard, isGuardError } from "@/lib/api-guard";
import { successResponse, errorResponse } from "@/types/api";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

// Tables to truncate in dependency order (children first)
const TRUNCATE_ORDER = [
  "expense_items",
  "expense_claims",
  "employee_advances",
  "activity_feeds",
  "notifications",
  "app_configs",
  "employee_onboarding_tasks",
  "employee_onboardings",
  "onboarding_tasks",
  "onboarding_templates",
  "shift_assignments",
  "shift_types",
  "lifecycle_events",
  "employee_certifications",
  "training_participants",
  "training_programs",
  "performance_kpis",
  "performance_reviews",
  "kpi_templates",
  "review_cycles",
  "interview_schedules",
  "applicants",
  "job_postings",
  "tax_configs",
  "thr_payments",
  "payslip_details",
  "payslips",
  "payroll_periods",
  "employee_salaries",
  "salary_components",
  "leave_approvals",
  "leave_requests",
  "leave_balances",
  "leave_types",
  "holidays",
  "overtime_requests",
  "attendances",
  "employee_schedules",
  "work_schedules",
  "employee_work_histories",
  "employee_families",
  "employee_educations",
  "employee_documents",
  "employee_contracts",
  "employees",
  "positions",
  "departments",
  "companies",
  "audit_logs",
  "sessions",
  "users",
];

async function truncateAll() {
  for (const table of TRUNCATE_ORDER) {
    await prisma.$executeRawUnsafe(`TRUNCATE TABLE "${table}" CASCADE`);
  }
}

export async function POST(req: NextRequest) {
  const session = await apiGuard({ minRole: "SUPER_ADMIN" });
  if (isGuardError(session)) return session;

  const body = await req.json().catch(() => ({}));
  const action = (body as { action?: string }).action;

  if (action === "reset") {
    await truncateAll();
    return NextResponse.json(successResponse({ message: "Semua data berhasil dihapus" }));
  }

  if (action === "reseed") {
    await truncateAll();
    try {
      await execAsync("npx prisma db seed", {
        cwd: process.cwd(),
        timeout: 120000,
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Seed gagal";
      return NextResponse.json(errorResponse(`Data dihapus tapi seed gagal: ${msg}`), { status: 500 });
    }
    return NextResponse.json(successResponse({ message: "Data demo berhasil dimuat ulang" }));
  }

  return NextResponse.json(errorResponse("Action tidak valid. Gunakan 'reset' atau 'reseed'."), { status: 400 });
}
