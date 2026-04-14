import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { apiGuard, isGuardError } from "@/lib/api-guard";
import { successResponse, errorResponse } from "@/types/api";
import { seedDatabase } from "@/lib/seed";
import { resetActionSchema } from "@/lib/validators/settings";

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
  "employee_work_history",
  "employee_family",
  "employee_education",
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

// Tables yang HARUS dipertahankan saat action=reset (jangan kunci admin)
const PRESERVE_ON_RESET = new Set(["users", "sessions", "audit_logs"]);

async function truncateAll(preserveAuth: boolean) {
  if (preserveAuth) {
    // Mode aman: pakai DELETE (bukan TRUNCATE CASCADE) supaya FK dari
    // tabel yang dipertahankan (users.employeeId, audit_logs.userId)
    // tidak ikut tertarik. Lebih lambat tapi tidak mengunci admin.
    await prisma.user.updateMany({ data: { employeeId: null } });
    for (const table of TRUNCATE_ORDER) {
      if (PRESERVE_ON_RESET.has(table)) continue;
      await prisma.$executeRawUnsafe(`DELETE FROM "${table}"`);
    }
    return;
  }
  // Mode reseed: hapus semuanya termasuk users (akan di-recreate seed)
  for (const table of TRUNCATE_ORDER) {
    await prisma.$executeRawUnsafe(`TRUNCATE TABLE "${table}" CASCADE`);
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

  if (parsed.data.action === "reset") {
    await truncateAll(true);
    return NextResponse.json(successResponse({ message: "Semua data berhasil dihapus (akun login dipertahankan)" }));
  }

  await truncateAll(false);
  try {
    await seedDatabase(prisma);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Seed gagal";
    return NextResponse.json(errorResponse(`Data dihapus tapi seed gagal: ${msg}`), { status: 500 });
  }
  return NextResponse.json(successResponse({ message: "Data demo berhasil dimuat ulang" }));
}
