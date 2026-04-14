import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { apiGuard, isGuardError } from "@/lib/api-guard";
import { successResponse, errorResponse } from "@/types/api";
import { approveLeaveSchema } from "@/lib/validators/leave";
import { recordAudit, getRequestMeta } from "@/lib/audit";

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
  const { ipAddress, userAgent } = getRequestMeta(req.headers);

  const updated = await prisma.$transaction(async (tx) => {
    const updatedRequest = await tx.leaveRequest.update({
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

    const year = leaveRequest.startDate.getFullYear();
    const balance = await tx.leaveBalance.findFirst({
      where: {
        employeeId: leaveRequest.employeeId,
        leaveTypeId: leaveRequest.leaveTypeId,
        year,
      },
    });

    if (balance) {
      const totalDays = Math.ceil(Number(leaveRequest.totalDays));
      if (status === "APPROVED") {
        await tx.leaveBalance.update({
          where: { id: balance.id },
          data: {
            used: { increment: totalDays },
            pending: { decrement: totalDays },
          },
        });
      } else {
        // REJECTED — release pending
        await tx.leaveBalance.update({
          where: { id: balance.id },
          data: { pending: { decrement: totalDays } },
        });
      }
    }

    if (session.user.employeeId) {
      await tx.leaveApproval.create({
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

    return updatedRequest;
  });

  await recordAudit({
    userId: session.user.id,
    action: status === "APPROVED" ? "APPROVE_LEAVE" : "REJECT_LEAVE",
    entityType: "LeaveRequest",
    entityId: id,
    newValues: { status, note },
    ipAddress,
    userAgent,
  });

  return NextResponse.json(successResponse(updated));
}
