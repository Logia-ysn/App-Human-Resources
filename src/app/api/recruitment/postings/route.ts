import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { apiGuard, isGuardError } from "@/lib/api-guard";
import { successResponse } from "@/types/api";

export async function GET(req: NextRequest) {
  const session = await apiGuard({ minRole: "MANAGER" });
  if (isGuardError(session)) return session;

  const status = req.nextUrl.searchParams.get("status");
  const where: Record<string, unknown> = {};
  if (status) where.status = status;

  const postings = await prisma.jobPosting.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: {
      position: { select: { id: true, name: true } },
      department: { select: { id: true, name: true } },
      createdBy: { select: { id: true, firstName: true, lastName: true } },
      _count: { select: { applicants: true } },
    },
  });

  return NextResponse.json(successResponse(postings));
}
