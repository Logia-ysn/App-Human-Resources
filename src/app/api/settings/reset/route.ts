import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { apiGuard, isGuardError } from "@/lib/api-guard";
import { successResponse, errorResponse } from "@/types/api";
import { resetActionSchema } from "@/lib/validators/settings";
import { recordAudit, getRequestMeta } from "@/lib/audit";

// Business tables to clear. Preserved: users, sessions, audit_logs.
const DELETE_ORDER = [
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
  "employee_work_history",
  "employee_family",
  "employee_education",
  "employee_documents",
  "employee_contracts",
  "employees",
  "positions",
  "departments",
  "companies",
];

async function clearBusinessData() {
  // users.employeeId must be nulled first so employees row can be deleted
  await prisma.user.updateMany({ data: { employeeId: null } });
  for (const table of DELETE_ORDER) {
    await prisma.$executeRawUnsafe(`DELETE FROM "${table}"`);
  }
}

export async function POST(req: NextRequest) {
  const session = await apiGuard({ minRole: "SUPER_ADMIN" });
  if (isGuardError(session)) return session;

  const body = await req.json().catch(() => null);
  const parsed = resetActionSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(errorResponse(parsed.error.issues[0].message), { status: 400 });
  }

  await clearBusinessData();
  await recordAudit({
    userId: session.user.id,
    action: "RESET_DATA",
    entityType: "System",
    entityId: "database",
    ...getRequestMeta(req.headers),
  });
  return NextResponse.json(
    successResponse({ message: "Semua data berhasil dihapus (akun login dipertahankan)" })
  );
}
