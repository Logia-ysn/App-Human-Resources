import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { apiGuard, isGuardError } from "@/lib/api-guard";
import { successResponse, errorResponse } from "@/types/api";
import { z } from "zod";

type Params = { params: Promise<{ id: string }> };

const updateSchema = z.object({
  name: z.string().min(1).optional(),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  radius: z.number().int().min(10).max(10000).optional(),
  isActive: z.boolean().optional(),
});

export async function PATCH(req: NextRequest, { params }: Params) {
  const session = await apiGuard({ minRole: "SUPER_ADMIN" });
  if (isGuardError(session)) return session;

  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(errorResponse(parsed.error.issues[0].message), { status: 400 });
  }

  const existing = await prisma.officeLocation.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json(errorResponse("Lokasi tidak ditemukan"), { status: 404 });
  }

  const updated = await prisma.officeLocation.update({
    where: { id },
    data: parsed.data,
  });

  return NextResponse.json(successResponse(updated));
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const session = await apiGuard({ minRole: "SUPER_ADMIN" });
  if (isGuardError(session)) return session;

  const { id } = await params;

  const existing = await prisma.officeLocation.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json(errorResponse("Lokasi tidak ditemukan"), { status: 404 });
  }

  await prisma.officeLocation.delete({ where: { id } });

  return NextResponse.json(successResponse({ deleted: true }));
}
