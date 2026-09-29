import { useState } from "react";
import { Bell, CheckCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useNotificationStore, type AppNotification } from "@/store/useNotificationStore";
import { useAuthStore } from "@/store/useAuthStore";
import { useCourseRequestDrawerStore } from "@/store/useCourseRequestDrawerStore";
import { useHomeworkDrawerStore } from "@/store/useHomeworkDrawerStore";
import userProfileImg from "@/assets/images/e20220628.jpg";

type NotificationDropdownProps = {
  onClose: () => void;
};

function NotificationAvatar({ src, name }: { src?: string; name: string }) {
  const [hasError, setHasError] = useState(false);
  const initials = name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() || "U";

  const isTargetUserOrAdmin =
    name.includes("សុផាត") ||
    name.includes("Sophat") ||
    name.includes("គឿន") ||
    name.includes("Admin") ||
    name.includes("admin");

  const avatarSrc = isTargetUserOrAdmin ? userProfileImg : (src || userProfileImg);

  if (hasError) {
    return (
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-slate-200 text-xs font-bold text-slate-700 ring-1 ring-slate-300">
        {initials}
      </div>
    );
  }

  return (
    <img
      src={avatarSrc}
      alt={name}
      onError={() => setHasError(true)}
      className="h-11 w-11 shrink-0 rounded-full object-cover ring-1 ring-slate-200 shadow-sm"
    />
  );
}

export function NotificationDropdown({ onClose }: NotificationDropdownProps) {
  const [activeTab, setActiveTab] = useState<"all" | "unread">("all");
  const role = useAuthStore((s) => s.role);
  const navigate = useNavigate();

  const notifications = useNotificationStore((s) => s.notifications);
  const markAsRead = useNotificationStore((s) => s.markAsRead);
  const markAllAsRead = useNotificationStore((s) => s.markAllAsRead);

  // Filter notifications based on the current active role
  const roleFiltered = notifications.filter((n) => {
    if (!n.forRole || n.forRole === "all") return true;
    return n.forRole === role;
  });

  const unreadCount = roleFiltered.filter((n) => !n.read).length;

  const displayedList = roleFiltered.filter((n) => {
    if (activeTab === "unread") return !n.read;
    return true;
  });

  const openDrawer = useCourseRequestDrawerStore((s) => s.openDrawer);
  const openHomeworkDrawer = useHomeworkDrawerStore((s) => s.openDrawer);

  const handleItemClick = (item: AppNotification) => {
    markAsRead(item.id);
    onClose();

    // If Admin or Trainee clicks on Homework notification -> show right sliding drawer!
    if (item.type?.startsWith("HOMEWORK")) {
      let taskId: number | string = 1;
      if (item.targetUrl) {
        const match = item.targetUrl.match(/[?&]taskId=(\d+)/);
        if (match) taskId = parseInt(match[1], 10);
      }
      openHomeworkDrawer({
        taskId,
        courseId: item.courseId,
        courseTitle: item.courseTitle,
        taskTitle: item.title,
      });
      return;
    }

    // If Admin clicks on a course request, open the Course Request Drawer for approval
    if (
      role === "admin" &&
      (item.type === "COURSE_REQUEST" ||
        (item.title.includes("សំណើ") && !item.type?.startsWith("HOMEWORK")))
    ) {
      openDrawer({
        courseId: item.courseId || 1,
        courseTitle: item.courseTitle || "Fullstack Developer",
        courseKhmerTitle: item.breadcrumb?.split(">")[0]?.trim() || "អភិវឌ្ឍប្រព័ន្ធឌីជីថល",
        requesterName: item.senderName || "សុផាត ផន",
        requesterAvatar: item.avatarUrl,
        requestNote: item.message,
        approvalStatus: "PENDING",
      });
      return;
    }

    // For trainees (or approved notifications), navigate directly to the course
    if (item.targetUrl) {
      navigate(item.targetUrl);
    } else if (item.courseId) {
      navigate(`/trainee/programs/${item.courseId}`);
    }
  };

  return (
    <div className="absolute right-0 top-full mt-2.5 w-[360px] sm:w-[390px] max-w-[92vw] overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-150">
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-4 pb-2.5">
        <div className="flex items-center gap-2">
          <Bell className="h-5 w-5 text-slate-500" strokeWidth={1.8} />
          <h2 className="text-base font-bold text-slate-800">ការជូនដំណឹង</h2>
        </div>
        {unreadCount > 0 && (
          <button
            type="button"
            onClick={() => markAllAsRead(role)}
            className="flex items-center gap-1 text-[11px] font-medium text-sky-600 hover:text-sky-700 transition"
            title="Mark all as read"
          >
            <CheckCheck className="h-3.5 w-3.5" />
            <span>សម្គាល់ថាបានអាន</span>
          </button>
        )}
      </div>

      {/* Segmented Filter Control */}
      <div className="mx-4 mb-2 flex rounded-xl bg-[#F1F5F9] p-1">
        <button
          type="button"
          onClick={() => setActiveTab("all")}
          className={`flex-1 rounded-lg py-1.5 text-center text-sm font-medium transition-all ${
            activeTab === "all"
              ? "bg-white font-semibold text-slate-900 shadow-sm"
              : "text-slate-500 hover:text-slate-800"
          }`}
        >
          ទាំងអស់
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("unread")}
          className={`flex-1 rounded-lg py-1.5 text-center text-sm font-medium transition-all flex items-center justify-center gap-1.5 ${
            activeTab === "unread"
              ? "bg-white font-semibold text-slate-900 shadow-sm"
              : "text-slate-500 hover:text-slate-800"
          }`}
        >
          <span>មិនទាន់អាន</span>
          {unreadCount > 0 && (
            <span
              className={`rounded-full px-1.5 py-0.2 text-[10px] font-bold ${
                activeTab === "unread"
                  ? "bg-slate-900 text-white"
                  : "bg-slate-300 text-slate-700"
              }`}
            >
              {unreadCount}
            </span>
          )}
        </button>
      </div>

      {/* Notifications List */}
      <div className="max-h-[440px] overflow-y-auto divide-y divide-slate-100 [scrollbar-width:thin] [scrollbar-color:#e2e8f0_transparent]">
        {displayedList.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400 mb-2">
              <Bell className="h-6 w-6" strokeWidth={1.5} />
            </div>
            <p className="text-sm font-medium text-slate-600">មិនមានការជូនដំណឹងទេ</p>
            <p className="text-xs text-slate-400 mt-0.5">
              {activeTab === "unread"
                ? "អ្នកបានអានការជូនដំណឹងទាំងអស់រួចរាល់ហើយ"
                : "ការជូនដំណឹងថ្មីៗនឹងបង្ហាញនៅទីនេះ"}
            </p>
          </div>
        ) : (
          displayedList.map((item) => (
            <div
              key={item.id}
              role="button"
              tabIndex={0}
              onClick={() => handleItemClick(item)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  handleItemClick(item);
                }
              }}
              className={`group flex items-start gap-3 px-4 py-3.5 transition-colors cursor-pointer text-left ${
                item.read ? "bg-white hover:bg-slate-50/80" : "bg-sky-50/20 hover:bg-sky-50/40"
              }`}
            >
              <NotificationAvatar src={item.avatarUrl} name={item.senderName} />

              <div className="flex-1 min-w-0">
                {/* Category & Time */}
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[12px] text-slate-400 truncate font-normal">
                    {item.breadcrumb}
                  </span>
                  <span className="text-[12px] text-slate-400 shrink-0 font-normal">
                    {item.timeAgo}
                  </span>
                </div>

                {/* Title */}
                <h4 className="text-[14px] font-bold text-slate-900 leading-snug line-clamp-1 mt-0.5">
                  {item.title}
                </h4>

                {/* Description */}
                <p className="text-[12px] text-slate-600 line-clamp-1 leading-snug mt-0.5">
                  {item.message}
                </p>
              </div>

              {/* Unread dot */}
              {!item.read && (
                <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-blue-600 ring-2 ring-white" />
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
