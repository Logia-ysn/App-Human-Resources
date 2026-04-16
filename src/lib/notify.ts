import { prisma } from "@/lib/db";
import type { NotifType, Role } from "@prisma/client";

type AdminNotifyPayload = {
  title: string;
  message: string;
  type?: NotifType;
  actionUrl?: string;
  roles?: Role[];
  excludeUserId?: string;
};

export async function notifyAdmins(payload: AdminNotifyPayload): Promise<number> {
  const roles = payload.roles ?? ["HR_ADMIN", "MANAGER", "SUPER_ADMIN"];

  const admins = await prisma.user.findMany({
    where: {
      role: { in: roles },
      isActive: true,
      ...(payload.excludeUserId && { id: { not: payload.excludeUserId } }),
    },
    select: { id: true },
  });

  if (admins.length === 0) return 0;

  await prisma.notification.createMany({
    data: admins.map((admin) => ({
      userId: admin.id,
      title: payload.title,
      message: payload.message,
      type: payload.type ?? "GENERAL",
      actionUrl: payload.actionUrl,
    })),
  });

  return admins.length;
}

type EmployeeNotifyPayload = {
  employeeId: string;
  title: string;
  message: string;
  type?: NotifType;
  actionUrl?: string;
};

export async function notifyEmployee(payload: EmployeeNotifyPayload): Promise<boolean> {
  const user = await prisma.user.findFirst({
    where: { employeeId: payload.employeeId, isActive: true },
    select: { id: true },
  });
  if (!user) return false;

  await prisma.notification.create({
    data: {
      userId: user.id,
      title: payload.title,
      message: payload.message,
      type: payload.type ?? "GENERAL",
      actionUrl: payload.actionUrl,
    },
  });
  return true;
}
