import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { apiGuard, isGuardError } from "@/lib/api-guard";
import { successResponse, errorResponse } from "@/types/api";
import { createHolidaySchema } from "@/lib/validators/holiday";

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
    take: 500,
  });

  return NextResponse.json(successResponse(holidays));
}

export async function POST(req: NextRequest) {
  const session = await apiGuard({ minRole: "HR_ADMIN" });
  if (isGuardError(session)) return session;

  const body = await req.json().catch(() => null);
  const parsed = createHolidaySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      errorResponse(parsed.error.issues[0]?.message ?? "Input tidak valid"),
      { status: 400 }
    );
  }

  const { name, date, type, isRecurring } = parsed.data;
  const created = await prisma.holiday.create({
    data: {
      name,
      date: new Date(`${date}T00:00:00.000Z`),
      type,
      isRecurring,
    },
  });

  return NextResponse.json(successResponse(created), { status: 201 });
}
