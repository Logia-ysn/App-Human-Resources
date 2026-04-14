import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { apiGuard, isGuardError } from "@/lib/api-guard";
import { successResponse, errorResponse } from "@/types/api";
import { resetPasswordSchema } from "@/lib/validators/user";
import { recordAudit, getRequestMeta } from "@/lib/audit";

type Params = { params: Promise<{ id: string }> };

export async function POST(req: NextRequest, { params }: Params) {
  const session = await apiGuard({ minRole: "HR_ADMIN" });
  if (isGuardError(session)) return session;

  const { id } = await params;
  const body = await req.json().catch(() => null);
  const parsed = resetPasswordSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      errorResponse(parsed.error.issues[0].message),
      { status: 400 },
    );
  }

  const account = await prisma.user.findUnique({ where: { employeeId: id } });
  if (!account) {
    return NextResponse.json(errorResponse("Akun tidak ditemukan"), {
      status: 404,
    });
  }

  const passwordHash = await bcrypt.hash(parsed.data.password, 10);
  await prisma.user.update({
    where: { id: account.id },
    data: {
      passwordHash,
      mustChangePassword: parsed.data.mustChangePassword,
    },
  });

  await recordAudit({
    userId: session.user.id,
    action: "PASSWORD_CHANGED",
    entityType: "User",
    entityId: account.id,
    newValues: { mustChangePassword: parsed.data.mustChangePassword },
    ...getRequestMeta(req.headers),
  });

  return NextResponse.json(successResponse({ success: true }));
}
