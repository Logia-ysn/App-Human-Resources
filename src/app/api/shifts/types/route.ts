import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { apiGuard, isGuardError } from "@/lib/api-guard";
import { successResponse } from "@/types/api";

export async function GET(_req: NextRequest) {
  const session = await apiGuard({ minRole: "EMPLOYEE" });
  if (isGuardError(session)) return session;

  const shiftTypes = await prisma.shiftType.findMany({
    orderBy: { name: "asc" },
  });

  return NextResponse.json(successResponse(shiftTypes));
}
