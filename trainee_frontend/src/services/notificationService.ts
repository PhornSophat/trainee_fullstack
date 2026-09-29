import { apiClient, isApiConfigured } from "./apiClient";
import type { AppNotification } from "@/store/useNotificationStore";

export function formatKhmerTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffSec = Math.floor((now.getTime() - date.getTime()) / 1000);

  const toKhmerNumber = (num: number): string => {
    const khmerDigits = ["០", "១", "២", "៣", "៤", "៥", "៦", "៧", "៨", "៩"];
    return num
      .toString()
      .split("")
      .map((d) => khmerDigits[parseInt(d, 10)] ?? d)
      .join("");
  };

  if (diffSec < 60) return "ទើបតែឥឡូវនេះ";
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${toKhmerNumber(diffMin)} នាទីមុន`;
  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) return `${toKhmerNumber(diffHours)} ម៉ោងមុន`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${toKhmerNumber(diffDays)} ថ្ងៃមុន`;
  const diffWeeks = Math.floor(diffDays / 7);
  if (diffWeeks < 4) return `${toKhmerNumber(diffWeeks)} សប្ដាហ៍មុន`;
  const diffMonths = Math.floor(diffDays / 30);
  return `${toKhmerNumber(diffMonths)} ខែមុន`;
}

export async function fetchNotificationsApi(role?: string): Promise<AppNotification[]> {
  if (!isApiConfigured) return [];

  const res = await apiClient.get<Array<{
    id: string;
    type: string;
    title: string;
    breadcrumb?: string;
    message: string;
    sender_name?: string;
    avatar_url?: string;
    read: boolean;
    target_url?: string;
    course_id?: number;
    course_title?: string;
    for_role: string;
    created_at: string;
  }>>("/notifications", {
    params: { role },
  });

  return res.data.map((item) => ({
    id: item.id,
    type: item.type as AppNotification["type"],
    title: item.title,
    breadcrumb: item.breadcrumb || "វគ្គសិក្សា > សំណើ",
    message: item.message,
    timeAgo: formatKhmerTimeAgo(item.created_at),
    createdAt: item.created_at,
    avatarUrl: item.avatar_url,
    senderName: item.sender_name || "អ្នកប្រើប្រាស់",
    read: item.read,
    targetUrl: item.target_url,
    courseId: item.course_id,
    courseTitle: item.course_title,
    forRole: item.for_role as AppNotification["forRole"],
  }));
}

export async function markNotificationReadApi(id: string): Promise<void> {
  if (!isApiConfigured) return;
  await apiClient.patch(`/notifications/${id}/read`);
}

export async function markAllNotificationsReadApi(role?: string): Promise<void> {
  if (!isApiConfigured) return;
  await apiClient.patch("/notifications/read-all", null, {
    params: { role },
  });
}
