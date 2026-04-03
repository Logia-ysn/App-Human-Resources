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

  const config = await prisma.appConfig.upsert({
    where: { id: "app-config" },
    update: { data: body },
    create: { id: "app-config", data: body },
  });

  return NextResponse.json(successResponse(config.data));
}
