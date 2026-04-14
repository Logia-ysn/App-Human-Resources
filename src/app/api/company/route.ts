import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { apiGuard, isGuardError } from "@/lib/api-guard";
import { successResponse, errorResponse } from "@/types/api";
import { createCompanySchema, updateCompanySchema } from "@/lib/validators/settings";
import { recordAudit, getRequestMeta } from "@/lib/audit";

export async function GET() {
  const session = await apiGuard();
  if (isGuardError(session)) return session;

  const company = await prisma.company.findFirst();
  return NextResponse.json(successResponse(company));
}

export async function POST(req: NextRequest) {
  const session = await apiGuard({ minRole: "SUPER_ADMIN" });
  if (isGuardError(session)) return session;

  const body = await req.json().catch(() => null);
  const parsed = createCompanySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(errorResponse(parsed.error.issues[0].message), { status: 400 });
  }

  const existing = await prisma.company.findFirst();
  if (existing) {
    return NextResponse.json(errorResponse("Perusahaan sudah ada"), { status: 409 });
  }

  const created = await prisma.company.create({ data: parsed.data });

  await recordAudit({
    userId: session.user.id,
    action: "COMPANY_CREATE",
    entityType: "Company",
    entityId: created.id,
    newValues: created,
    ...getRequestMeta(req.headers),
  });

  return NextResponse.json(successResponse(created), { status: 201 });
}

export async function PATCH(req: NextRequest) {
  const session = await apiGuard({ minRole: "SUPER_ADMIN" });
  if (isGuardError(session)) return session;

  const body = await req.json().catch(() => null);
  const parsed = updateCompanySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(errorResponse(parsed.error.issues[0].message), { status: 400 });
  }

  const company = await prisma.company.findFirst();
  if (!company) {
    return NextResponse.json(errorResponse("Data perusahaan tidak ditemukan"), { status: 404 });
  }

  const updated = await prisma.company.update({
    where: { id: company.id },
    data: parsed.data,
  });

  await recordAudit({
    userId: session.user.id,
    action: "COMPANY_UPDATE",
    entityType: "Company",
    entityId: company.id,
    oldValues: company,
    newValues: updated,
    ...getRequestMeta(req.headers),
  });

  return NextResponse.json(successResponse(updated));
}
