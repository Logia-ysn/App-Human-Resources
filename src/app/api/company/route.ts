import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { apiGuard, isGuardError } from "@/lib/api-guard";
import { successResponse, errorResponse } from "@/types/api";

export async function GET() {
  const session = await apiGuard();
  if (isGuardError(session)) return session;

  const company = await prisma.company.findFirst();
  return NextResponse.json(successResponse(company));
}

export async function PATCH(req: NextRequest) {
  const session = await apiGuard({ minRole: "SUPER_ADMIN" });
  if (isGuardError(session)) return session;

  const body = await req.json();
  const company = await prisma.company.findFirst();

  if (!company) {
    return NextResponse.json(errorResponse("Data perusahaan tidak ditemukan"), { status: 404 });
  }

  const updated = await prisma.company.update({
    where: { id: company.id },
    data: body,
  });

  return NextResponse.json(successResponse(updated));
}
