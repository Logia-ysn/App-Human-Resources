import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { apiGuard, isGuardError } from "@/lib/api-guard";
import { successResponse, errorResponse } from "@/types/api";
import { approveLeaveSchema } from "@/lib/validators/leave";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(req: NextRequest, { params }: Params) {
  const session = await apiGuard({ minRole: "MANAGER" });
  if (isGuardError(session)) return session;

  const { id } = await params;
  const body = await req.json();
  const parsed = approveLeaveSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(errorResponse(parsed.error.issues[0].message), { status: 400 });
  }

  const leaveRequest = await prisma.leaveRequest.findUnique({
    where: { id },
  });

  if (!leaveRequest) {
    return NextResponse.json(errorResponse("Pengajuan cuti tidak ditemukan"), { status: 404 });
  }

  if (leaveRequest.status !== "PENDING") {
    return NextResponse.json(errorResponse("Pengajuan cuti sudah diproses"), { status: 400 });
  }

  const { status, note } = parsed.data;

  // Update leave request status
  const updated = await prisma.leaveRequest.update({
    where: { id },
    data: {
      status,
      approverNote: note,
    },
    include: {
      employee: { select: { id: true, firstName: true, lastName: true, employeeNumber: true } },
      leaveType: { select: { id: true, name: true, code: true } },
    },
  });

  // Update leave balance
  const year = leaveRequest.startDate.getFullYear();
  const balance = await prisma.leaveBalance.findFirst({
    where: {
      employeeId: leaveRequest.employeeId,
      leaveTypeId: leaveRequest.leaveTypeId,
      year,
    },
  });

  if (balance) {
    const totalDays = Math.ceil(Number(leaveRequest.totalDays));
    if (status === "APPROVED") {
      await prisma.leaveBalance.update({
        where: { id: balance.id },
        data: {
          used: { increment: totalDays },
          pending: { decrement: totalDays },
        },
      });
    } else {
      // REJECTED — release pending
      await prisma.leaveBalance.update({
        where: { id: balance.id },
        data: { pending: { decrement: totalDays } },
      });
    }
  }

  // Create leave approval record
  if (session.user.employeeId) {
    await prisma.leaveApproval.create({
      data: {
        leaveRequestId: id,
        approverId: session.user.employeeId,
        sequence: 1,
        status,
        note,
        actionAt: new Date(),
      },
    });
  }

  return NextResponse.json(successResponse(updated));
}
