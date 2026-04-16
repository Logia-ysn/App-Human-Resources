import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { apiGuard, isGuardError } from "@/lib/api-guard";
import { successResponse, errorResponse } from "@/types/api";
import { hasMinRole } from "@/lib/utils/permissions";
import { recordAudit, getRequestMeta } from "@/lib/audit";

const MAX_PHOTO_SIZE = 3_000_000;

const photoSchema = z.object({
  photoUrl: z
    .string()
    .regex(
      /^data:image\/(png|jpeg|jpg|webp|gif);base64,/,
      "Format foto tidak valid (harus PNG/JPG/WebP/GIF)"
    )
    .max(MAX_PHOTO_SIZE, "Ukuran foto terlalu besar (maks 2MB)")
    .nullable(),
});

type Params = { params: Promise<{ id: string }> };

export async function PATCH(req: NextRequest, { params }: Params) {
  const session = await apiGuard();
  if (isGuardError(session)) return session;

  const { id } = await params;
  const isSelf = session.user.employeeId === id;
  const isHrAdmin = hasMinRole(session.user.role, "HR_ADMIN");

  if (!isSelf && !isHrAdmin) {
    return NextResponse.json(errorResponse("Tidak memiliki akses"), { status: 403 });
  }

  const body = await req.json().catch(() => null);
  const parsed = photoSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      errorResponse(parsed.error.issues[0]?.message ?? "Input tidak valid"),
      { status: 400 }
    );
  }

  const existing = await prisma.employee.findFirst({
    where: { id, isDeleted: false },
    select: { id: true, photoUrl: true },
  });
  if (!existing) {
    return NextResponse.json(errorResponse("Karyawan tidak ditemukan"), { status: 404 });
  }

  const updated = await prisma.employee.update({
    where: { id },
    data: { photoUrl: parsed.data.photoUrl },
    select: { id: true, photoUrl: true },
  });

  await recordAudit({
    userId: session.user.id,
    action: "UPDATE",
    entityType: "Employee",
    entityId: id,
    oldValues: { photoUrl: existing.photoUrl ? "[set]" : null },
    newValues: { photoUrl: updated.photoUrl ? "[set]" : null },
    ...getRequestMeta(req.headers),
  });

  return NextResponse.json(successResponse(updated));
}
