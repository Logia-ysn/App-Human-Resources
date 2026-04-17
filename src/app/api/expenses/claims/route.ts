import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { apiGuard, isGuardError } from "@/lib/api-guard";
import { successResponse, errorResponse } from "@/types/api";
import { createExpenseClaimSchema } from "@/lib/validators/expense";
import { notifyAdmins } from "@/lib/notify";

export async function GET(req: NextRequest) {
  const session = await apiGuard({ minRole: "EMPLOYEE" });
  if (isGuardError(session)) return session;

  const status = req.nextUrl.searchParams.get("status");
  const employeeId = req.nextUrl.searchParams.get("employeeId");

  const where: Record<string, unknown> = {};
  if (status) where.status = status;
  if (employeeId) where.employeeId = employeeId;

  if (session.user.role === "EMPLOYEE" && session.user.employeeId) {
    where.employeeId = session.user.employeeId;
  }

  const claims = await prisma.expenseClaim.findMany({
    where,
    orderBy: { submittedDate: "desc" },
    include: {
      employee: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          employeeNumber: true,
          department: { select: { name: true } },
        },
      },
      approvedBy: {
        select: { id: true, firstName: true, lastName: true },
      },
      items: true,
    },
  });

  return NextResponse.json(successResponse(claims));
}

export async function POST(req: NextRequest) {
  const session = await apiGuard();
  if (isGuardError(session)) return session;

  if (!session.user.employeeId) {
    return NextResponse.json(
      errorResponse("Akun tidak terhubung dengan data karyawan"),
      { status: 400 },
    );
  }

  const body = await req.json().catch(() => ({}));
  const parsed = createExpenseClaimSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      errorResponse(parsed.error.issues[0].message),
      { status: 400 },
    );
  }

  const { title, items } = parsed.data;
  const totalAmount = items.reduce((sum, it) => sum + it.amount, 0);

  const claim = await prisma.expenseClaim.create({
    data: {
      employeeId: session.user.employeeId,
      title,
      totalAmount,
      status: "PENDING",
      submittedDate: new Date(),
      items: {
        create: items.map((it) => ({
          description: it.description,
          amount: it.amount,
          category: it.category,
          date: new Date(it.date),
        })),
      },
    },
    include: {
      employee: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          employeeNumber: true,
        },
      },
      items: true,
    },
  });

  const fullName = `${claim.employee.firstName} ${claim.employee.lastName}`;
  await notifyAdmins({
    title: "Klaim Pengeluaran Baru",
    message: `${fullName} (${claim.employee.employeeNumber}) mengajukan klaim "${title}" senilai Rp ${totalAmount.toLocaleString("id-ID")}.`,
    type: "GENERAL",
    actionUrl: "/expenses/claims",
    excludeUserId: session.user.id,
  }).catch(() => undefined);

  return NextResponse.json(successResponse(claim), { status: 201 });
}
