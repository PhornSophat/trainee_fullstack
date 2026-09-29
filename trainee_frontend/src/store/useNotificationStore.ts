import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  fetchNotificationsApi,
  markNotificationReadApi,
  markAllNotificationsReadApi,
} from "@/services/notificationService";
import userProfileImg from "@/assets/images/e20220628.jpg";

export type NotificationType =
  | "COURSE_REQUEST"
  | "COURSE_APPROVED"
  | "COURSE_REJECTED"
  | "HOMEWORK_SUBMITTED"
  | "HOMEWORK_REVIEWED"
  | "HOMEWORK_MESSAGE"
  | "SYSTEM";

export interface AppNotification {
  id: string;
  type: NotificationType;
  title: string;
  breadcrumb: string;
  message: string;
  timeAgo: string;
  createdAt: string;
  avatarUrl?: string;
  senderName: string;
  read: boolean;
  targetUrl?: string;
  courseId?: string | number;
  courseTitle?: string;
  forRole?: "user" | "admin" | "all";
}

const defaultNotifications: AppNotification[] = [
  {
    id: "notif-1",
    type: "COURSE_REQUEST",
    breadcrumb: "អភិវឌ្ឍប្រព័ន្ធឌីជីថល > សំណើ",
    title: "សំណើចូលរៀនជំនាញសិក្សា",
    message: "ឡេង សុខជាយ បានពិនិត្យសំណើរបស់អ្នក ...",
    timeAgo: "១ សប្ដាហ៍មុន",
    createdAt: new Date(Date.now() - 7 * 86400000).toISOString(),
    avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80",
    senderName: "ឡេង សុខជាយ",
    read: true,
    forRole: "all",
    targetUrl: "/trainee/programs",
  },
  {
    id: "notif-2",
    type: "COURSE_REJECTED",
    breadcrumb: "រចនានិងអភិវឌ្ឍគេហទំព័រ > សំណើ",
    title: "សំណើចូលរៀនជំនាញសិក្សា",
    message: "ខូច គឿន បានបដិសេធសំណើក្នុងការចូលរួម...",
    timeAgo: "១ សប្ដាហ៍មុន",
    createdAt: new Date(Date.now() - 7 * 86400000 - 3600000).toISOString(),
    avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=80",
    senderName: "ខូច គឿន",
    read: true,
    forRole: "all",
    targetUrl: "/trainee/programs",
  },
  {
    id: "notif-3",
    type: "COURSE_APPROVED",
    breadcrumb: "ដំណើរការប្រព័ន្ធឌីជីថល > សំណើ",
    title: "សំណើចូលរៀនជំនាញសិក្សា",
    message: "ខូច គឿន បានអនុម័តសំណើក្នុងការចូលរួម ...",
    timeAgo: "១ សប្ដាហ៍មុន",
    createdAt: new Date(Date.now() - 7 * 86400000 - 7200000).toISOString(),
    avatarUrl: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=120&auto=format&fit=crop&q=80",
    senderName: "ខូច គឿន",
    read: true,
    forRole: "all",
    targetUrl: "/trainee/programs",
  },
  {
    id: "notif-4",
    type: "COURSE_REQUEST",
    breadcrumb: "អភិវឌ្ឍប្រព័ន្ធឌីជីថល > សំណើ",
    title: "សំណើចូលរៀនជំនាញសិក្សា",
    message: "ឡេង សុខជាយ បានពិនិត្យសំណើចូលរួម អ...",
    timeAgo: "១ សប្ដាហ៍មុន",
    createdAt: new Date(Date.now() - 8 * 86400000).toISOString(),
    avatarUrl: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=120&auto=format&fit=crop&q=80",
    senderName: "ឡេង សុខជាយ",
    read: true,
    forRole: "all",
    targetUrl: "/trainee/programs",
  },
  {
    id: "notif-5",
    type: "COURSE_REQUEST",
    breadcrumb: "រចនានិងអភិវឌ្ឍគេហទំព័រ > សំណើ",
    title: "សំណើចូលរៀនជំនាញសិក្សា",
    message: "ឡេង សុខជាយ បានពិនិត្យសំណើចូលរួម រ...",
    timeAgo: "១ សប្ដាហ៍មុន",
    createdAt: new Date(Date.now() - 8 * 86400000 - 1800000).toISOString(),
    avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80",
    senderName: "ឡេង សុខជាយ",
    read: true,
    forRole: "all",
    targetUrl: "/trainee/programs",
  },
  {
    id: "notif-6",
    type: "COURSE_REQUEST",
    breadcrumb: "អភិវឌ្ឍប្រព័ន្ធឌីជីថល > សំណើ",
    title: "សំណើចូលរៀនជំនាញសិក្សា",
    message: "ជីង គឹមឡាយ បានពិនិត្យសំណើចូលរួម អភិ...",
    timeAgo: "១ សប្ដាហ៍មុន",
    createdAt: new Date(Date.now() - 9 * 86400000).toISOString(),
    avatarUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=120&auto=format&fit=crop&q=80",
    senderName: "ជីង គឹមឡាយ",
    read: true,
    forRole: "all",
    targetUrl: "/trainee/programs",
  },
  {
    id: "notif-7",
    type: "COURSE_REQUEST",
    breadcrumb: "រចនានិងអភិវឌ្ឍគេហទំព័រ > សំណើ",
    title: "សំណើចូលរៀនជំនាញសិក្សា",
    message: "ជីង គឹមឡាយ បានពិនិត្យសំណើចូលរួម រច...",
    timeAgo: "១ សប្ដាហ៍មុន",
    createdAt: new Date(Date.now() - 9 * 86400000 - 3600000).toISOString(),
    avatarUrl: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=120&auto=format&fit=crop&q=80",
    senderName: "ជីង គឹមឡាយ",
    read: true,
    forRole: "all",
    targetUrl: "/trainee/programs",
  },
];

interface NotificationState {
  notifications: AppNotification[];
  isLoading: boolean;
  fetchNotifications: (role?: "user" | "admin") => Promise<void>;
  getUnreadCount: (role?: "user" | "admin") => number;
  addNotification: (
    payload: Omit<AppNotification, "id" | "createdAt" | "read" | "timeAgo"> & {
      timeAgo?: string;
      read?: boolean;
    }
  ) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: (role?: "user" | "admin") => void;
  clearAll: () => void;
  resetToDefault: () => void;
}

export const useNotificationStore = create<NotificationState>()(
  persist(
    (set, get) => ({
      notifications: defaultNotifications,
      isLoading: false,

      fetchNotifications: async (role) => {
        try {
          set({ isLoading: true });
          const backendItems = await fetchNotificationsApi(role);
          if (backendItems && backendItems.length > 0) {
            set({ notifications: backendItems });
          }
        } catch (err) {
          console.error("Failed to fetch notifications from backend:", err);
        } finally {
          set({ isLoading: false });
        }
      },

      getUnreadCount: (role) => {
        const list = get().notifications;
        return list.filter((n) => {
          if (n.read) return false;
          if (!role || n.forRole === "all" || !n.forRole) return true;
          return n.forRole === role;
        }).length;
      },

      addNotification: (payload) => {
        const newNotif: AppNotification = {
          id: `notif-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          type: payload.type,
          title: payload.title,
          breadcrumb: payload.breadcrumb,
          message: payload.message,
          timeAgo: payload.timeAgo || "ទើបតែឥឡូវនេះ",
          createdAt: new Date().toISOString(),
          avatarUrl: payload.avatarUrl || userProfileImg,
          senderName: payload.senderName || "សុផាត ផន",
          read: payload.read ?? false,
          targetUrl: payload.targetUrl,
          courseId: payload.courseId,
          courseTitle: payload.courseTitle,
          forRole: payload.forRole || "all",
        };

        set((state) => ({
          notifications: [newNotif, ...state.notifications],
        }));
      },

      markAsRead: (id: string) => {
        set((state) => ({
          notifications: state.notifications.map((n) =>
            n.id === id ? { ...n, read: true } : n
          ),
        }));
        markNotificationReadApi(id).catch(console.error);
      },

      markAllAsRead: (role) => {
        set((state) => ({
          notifications: state.notifications.map((n) => {
            if (!role || n.forRole === "all" || !n.forRole || n.forRole === role) {
              return { ...n, read: true };
            }
            return n;
          }),
        }));
        markAllNotificationsReadApi(role).catch(console.error);
      },

      clearAll: () => set({ notifications: [] }),

      resetToDefault: () => set({ notifications: defaultNotifications }),
    }),
    {
      name: "app_notifications_storage",
      version: 2,
      migrate: (persistedState: unknown) => {
        const state = persistedState as { notifications?: AppNotification[] } | undefined;
        if (state?.notifications) {
          return {
            ...state,
            notifications: state.notifications.map((n) =>
              // Ensure default mock notifications are always read
              n.id.startsWith("notif-1") || n.id.startsWith("notif-2") || n.id.startsWith("notif-3") || n.id.startsWith("notif-4") || n.id.startsWith("notif-5") || n.id.startsWith("notif-6") || n.id.startsWith("notif-7")
                ? { ...n, read: true }
                : n
            ),
          };
        }
        return state;
      },
    }
  )
);
