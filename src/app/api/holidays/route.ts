import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { apiGuard, isGuardError } from "@/lib/api-guard";
import { successResponse } from "@/types/api";

export async function GET(req: NextRequest) {
  const session = await apiGuard();
  if (isGuardError(session)) return session;

  const year = req.nextUrl.searchParams.get("year") ?? String(new Date().getFullYear());
  const startOfYear = new Date(`${year}-01-01`);
  const endOfYear = new Date(`${parseInt(year) + 1}-01-01`);

  const holidays = await prisma.holiday.findMany({
    where: {
      date: { gte: startOfYear, lt: endOfYear },
    },
    orderBy: { date: "asc" },
  });

  return NextResponse.json(successResponse(holidays));
}
