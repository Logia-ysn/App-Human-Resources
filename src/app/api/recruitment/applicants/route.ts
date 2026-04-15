import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { apiGuard, isGuardError } from "@/lib/api-guard";
import { successResponse } from "@/types/api";

export async function GET(req: NextRequest) {
  const session = await apiGuard({ minRole: "MANAGER" });
  if (isGuardError(session)) return session;

  const status = req.nextUrl.searchParams.get("status");
  const postingId = req.nextUrl.searchParams.get("postingId");

  const where: Record<string, unknown> = {};
  if (status) where.status = status;
  if (postingId) where.jobPostingId = postingId;

  const applicants = await prisma.applicant.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: {
      jobPosting: {
        select: {
          id: true,
          title: true,
          department: { select: { name: true } },
        },
      },
      interviews: {
        orderBy: { scheduledAt: "desc" },
        take: 1,
        select: { id: true, round: true, status: true, scheduledAt: true },
      },
    },
  });

  return NextResponse.json(successResponse(applicants));
}
