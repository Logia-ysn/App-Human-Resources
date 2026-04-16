import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { apiGuard, isGuardError } from "@/lib/api-guard";
import { successResponse, errorResponse } from "@/types/api";
import { resolveProfileChangeRequestSchema } from "@/lib/validators/profile-change-request";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await apiGuard({ minRole: "HR_ADMIN" });
  if (isGuardError(session)) return session;

  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  const parsed = resolveProfileChangeRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      errorResponse(parsed.error.issues[0].message),
      { status: 400 }
    );
  }

  const existing = await prisma.profileChangeRequest.findUnique({
    where: { id },
    include: {
      employee: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          user: { select: { id: true } },
        },
      },
    },
  });
  if (!existing) {
    return NextResponse.json(errorResponse("Permintaan tidak ditemukan"), { status: 404 });
  }
  if (existing.status !== "PENDING") {
    return NextResponse.json(
      errorResponse("Permintaan sudah diproses sebelumnya"),
      { status: 400 }
    );
  }

  const handlerEmployeeId = session.user.employeeId ?? null;

  const updated = await prisma.profileChangeRequest.update({
    where: { id },
    data: {
      status: parsed.data.status,
      handledNote: parsed.data.handledNote ?? null,
      handledById: handlerEmployeeId,
      handledAt: new Date(),
    },
  });

  // Notify the requesting employee about the outcome
  const requesterUserId = existing.employee.user?.id;
  if (requesterUserId) {
    const resolved = parsed.data.status === "RESOLVED";
    await prisma.notification.create({
      data: {
        userId: requesterUserId,
        title: resolved
          ? "Permintaan Perubahan Profil Disetujui"
          : "Permintaan Perubahan Profil Ditolak",
        message: resolved
          ? "Permintaan perubahan profil Anda sudah diproses oleh HR."
          : `Permintaan perubahan profil Anda ditolak.${
              parsed.data.handledNote ? ` Catatan: ${parsed.data.handledNote}` : ""
            }`,
        type: "GENERAL",
        actionUrl: "/ess/profile",
      },
    });
  }

  return NextResponse.json(successResponse(updated));
}
