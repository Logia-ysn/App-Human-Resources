import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { apiGuard, isGuardError } from "@/lib/api-guard";
import { successResponse, errorResponse } from "@/types/api";
import { updateAppConfigSchema } from "@/lib/validators/settings";

export async function GET() {
  const session = await apiGuard();
  if (isGuardError(session)) return session;

  const config = await prisma.appConfig.findFirst({ where: { id: "app-config" } });
  return NextResponse.json(successResponse(config?.data ?? null));
}

export async function PATCH(req: NextRequest) {
  const session = await apiGuard({ minRole: "SUPER_ADMIN" });
  if (isGuardError(session)) return session;

  const body = await req.json().catch(() => null);
  const parsed = updateAppConfigSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(errorResponse(parsed.error.issues[0].message), { status: 400 });
  }

  // Merge with existing data instead of replacing
  const existing = await prisma.appConfig.findFirst({ where: { id: "app-config" } });
  const currentData = (existing?.data as Record<string, unknown>) ?? {};
  const mergedData = { ...currentData, ...parsed.data } as Prisma.InputJsonValue;

  const config = await prisma.appConfig.upsert({
    where: { id: "app-config" },
    update: { data: mergedData },
    create: { id: "app-config", data: mergedData },
  });

  return NextResponse.json(successResponse(config.data));
}
