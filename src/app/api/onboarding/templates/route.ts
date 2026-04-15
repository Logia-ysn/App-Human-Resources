import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { apiGuard, isGuardError } from "@/lib/api-guard";
import { successResponse } from "@/types/api";

export async function GET(_req: NextRequest) {
  const session = await apiGuard({ minRole: "MANAGER" });
  if (isGuardError(session)) return session;

  const templates = await prisma.onboardingTemplate.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      tasks: { orderBy: { sortOrder: "asc" } },
      _count: { select: { onboardings: true, tasks: true } },
    },
  });

  return NextResponse.json(successResponse(templates));
}
