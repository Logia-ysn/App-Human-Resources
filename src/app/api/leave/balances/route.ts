import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { apiGuard, isGuardError } from "@/lib/api-guard";
import { successResponse, errorResponse } from "@/types/api";

export async function GET(req: NextRequest) {
  const session = await apiGuard();
  if (isGuardError(session)) return session;

  const employeeId = req.nextUrl.searchParams.get("employeeId");
  const year = parseInt(req.nextUrl.searchParams.get("year") ?? String(new Date().getFullYear()));

  if (!employeeId) {
    return NextResponse.json(errorResponse("employeeId wajib diisi"), { status: 400 });
  }

  const balances = await prisma.leaveBalance.findMany({
    where: { employeeId, year },
    include: {
      leaveType: { select: { id: true, name: true, code: true, defaultQuota: true } },
    },
  });

  return NextResponse.json(successResponse(balances));
}
