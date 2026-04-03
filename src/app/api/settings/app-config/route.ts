import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { apiGuard, isGuardError } from "@/lib/api-guard";
import { successResponse, errorResponse } from "@/types/api";

export async function GET() {
  const session = await apiGuard();
  if (isGuardError(session)) return session;

  const config = await prisma.appConfig.findFirst({ where: { id: "app-config" } });
  return NextResponse.json(successResponse(config?.data ?? null));
}

export async function PATCH(req: NextRequest) {
  const session = await apiGuard({ minRole: "SUPER_ADMIN" });
  if (isGuardError(session)) return session;

  const body = await req.json();

  // Merge with existing data instead of replacing
  const existing = await prisma.appConfig.findFirst({ where: { id: "app-config" } });
  const currentData = (existing?.data as Record<string, unknown>) ?? {};
  const mergedData = { ...currentData, ...body };

  const config = await prisma.appConfig.upsert({
    where: { id: "app-config" },
    update: { data: mergedData },
    create: { id: "app-config", data: mergedData },
  });

  return NextResponse.json(successResponse(config.data));
}
