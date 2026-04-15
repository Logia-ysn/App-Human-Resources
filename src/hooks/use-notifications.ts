"use client";

import useSWR from "swr";
import { fetcher, apiClient } from "@/lib/api-client";

export type NotificationItem = {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: string;
  actionUrl: string | null;
  isRead: boolean;
  readAt: string | null;
  createdAt: string;
};

export type NotificationsResponse = {
  notifications: NotificationItem[];
  unreadCount: number;
};

export function useNotifications(unreadOnly = false) {
  const { data, error, isLoading, mutate } = useSWR<NotificationsResponse>(
    `/api/notifications?unreadOnly=${unreadOnly}`,
    fetcher,
  );
  return {
    notifications: data?.notifications ?? [],
    unreadCount: data?.unreadCount ?? 0,
    error,
    isLoading,
    mutate,
  };
}

export async function markNotificationRead(id: string) {
  return apiClient("/api/notifications", { method: "PATCH", body: { id } });
}

export async function markAllNotificationsRead() {
  return apiClient("/api/notifications", { method: "PATCH", body: { markAllRead: true } });
}
