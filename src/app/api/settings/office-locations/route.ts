import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { apiGuard, isGuardError } from "@/lib/api-guard";
import { successResponse, errorResponse } from "@/types/api";
import { z } from "zod";

const createSchema = z.object({
  name: z.string().min(1, "Nama lokasi wajib diisi"),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  radius: z.number().int().min(10).max(10000).default(100),
});

export async function GET() {
  const session = await apiGuard();
  if (isGuardError(session)) return session;

  const locations = await prisma.officeLocation.findMany({
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json(successResponse(locations));
}

export async function POST(req: NextRequest) {
  const session = await apiGuard({ minRole: "SUPER_ADMIN" });
  if (isGuardError(session)) return session;

  const body = await req.json().catch(() => ({}));
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(errorResponse(parsed.error.issues[0].message), { status: 400 });
  }

  const location = await prisma.officeLocation.create({
    data: parsed.data,
  });

  return NextResponse.json(successResponse(location), { status: 201 });
}
