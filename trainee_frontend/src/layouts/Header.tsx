import { Bell, Menu, MoonStar, User, Settings, Repeat, X, ShieldCheck } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/store/useAuthStore";
import { useCoursesStore } from "@/store/courseStore";
import { useNotificationStore } from "@/store/useNotificationStore";
import { NotificationDropdown } from "@/components/notifications/NotificationDropdown";
import userProfileImg from "@/assets/images/e20220628.jpg";

type HeaderProps = {
  onMenuOpen: () => void;
};

export function Header({ onMenuOpen }: HeaderProps) {

  const [open, setOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [showRoleDrawer, setShowRoleDrawer] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const notificationMenuRef = useRef<HTMLDivElement>(null);
  const role = useAuthStore((s) => s.role);
  const setRole = useAuthStore((s) => s.setRole);
  const previousRoleRef = useRef(role);
  const fetchCourses = useCoursesStore((s) => s.fetchCourses);
  const navigate = useNavigate();

  const unreadCount = useNotificationStore((s) =>
    s.notifications.filter(
      (n) => !n.read && (!n.forRole || n.forRole === "all" || n.forRole === role)
    ).length
  );

  const showDot = unreadCount > 0;

  const fetchNotifications = useNotificationStore((s) => s.fetchNotifications);

  useEffect(() => {
    fetchCourses();
    fetchNotifications(role);
  }, [fetchCourses, fetchNotifications, role]);

  useEffect(() => {
    const closeDropdowns = (event: MouseEvent) => {
      if (!profileMenuRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
      if (!notificationMenuRef.current?.contains(event.target as Node)) {
        setNotificationOpen(false);
      }
    };

    if (open || notificationOpen) {
      document.addEventListener("mousedown", closeDropdowns);
    }

    return () => document.removeEventListener("mousedown", closeDropdowns);
  }, [open, notificationOpen]);

  useEffect(() => {
    if (previousRoleRef.current !== role) {
      fetchCourses(true);
    }
    if (previousRoleRef.current === 'user' && role === 'admin') {
      navigate('/admin/insight', { replace: true });
    } else if (previousRoleRef.current === 'admin' && role === 'user') {
      navigate('/trainee/programs', { replace: true });
    }

    previousRoleRef.current = role;
  }, [role, navigate, fetchCourses]);

  return (
    <>
      <header className="sticky top-0 z-20 flex items-center justify-between px-4 bg-white border-b shadow h-14 shrink-0 border-slate-200 sm:px-5">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onMenuOpen}
            className="p-1 rounded text-slate-600 hover:bg-slate-100 lg:hidden"
            aria-label="Open main menu"
          >
            <Menu className="w-5 h-5" />
          </button>
          <h1 className="text-lg font-semibold text-slate-700">
            {role === 'admin' ? 'Administrator' : 'Trainee'}
          </h1>
        </div>

        <div className="flex h-full items-center gap-4 text-[#536b89] sm:gap-5">
          <button type="button" className="transition-colors hover:text-[#1e2b3f]" aria-label="Toggle theme">
            <MoonStar className="h-[24px] w-[24px]" strokeWidth={1.8} />
          </button>
          
          {/* Notification Bell & Dropdown */}
          <div ref={notificationMenuRef} className="relative flex items-center">
            <button
              type="button"
              onClick={() => setNotificationOpen((prev) => !prev)}
              className="relative p-1 transition-colors hover:text-[#1e2b3f]"
              aria-label="Notifications"
            >
              <Bell className="h-[24px] w-[24px]" strokeWidth={1.8} />
              {showDot && (
                <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-bold text-white ring-2 ring-white">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </button>
            {notificationOpen && (
              <NotificationDropdown onClose={() => setNotificationOpen(false)} />
            )}
          </div>

          <button type="button" className="flex items-center gap-1.5" aria-label="Language: Khmer">
            <span className="text-lg leading-none" aria-hidden="true">🇰🇭</span>
          </button>
          <div ref={profileMenuRef} className="relative">
            <button
              type="button"
              onClick={() => setOpen((o) => !o)}
              aria-label="Open profile menu"
              className="flex items-center justify-center rounded-full transition-transform hover:scale-105 focus:outline-none"
            >
              {role === "admin" ? (
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-tr from-[#0088A8] to-[#0ab3dc] text-white shadow-sm ring-2 ring-slate-200 hover:ring-[#0088A8] transition-all">
                  <User className="h-4 w-4" />
                </div>
              ) : (
                <img
                  src={userProfileImg}
                  alt="User Profile"
                  className="h-8 w-8 rounded-full object-cover ring-2 ring-slate-200 hover:ring-[#0088A8] transition-all shadow-sm"
                />
              )}
            </button>
            {open && (
              <div className="absolute right-0 z-50 mt-3 w-56 rounded-xl border border-slate-200 bg-white py-2 shadow-xl">
                <div className="flex items-center gap-3 border-b border-slate-100 px-3.5 pb-2.5 pt-1">
                  {role === "admin" ? (
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-tr from-[#0088A8] to-[#0ab3dc] text-white shadow-sm ring-1 ring-slate-200">
                      <User className="h-5 w-5" />
                    </div>
                  ) : (
                    <img
                      src={userProfileImg}
                      alt="Profile"
                      className="h-10 w-10 rounded-full object-cover ring-1 ring-slate-200 shadow-sm"
                    />
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-slate-800">
                      {role === "admin" ? "Administrator" : "សុផាត ផន"}
                    </p>
                    <p className="text-xs text-slate-500 capitalize">
                      {role === "admin" ? "Admin" : "Normal User"}
                    </p>
                  </div>
                </div>
                <div className="pt-1">
                  <button
                    onClick={() => setOpen(false)}
                    className="flex w-full items-center gap-3 px-3.5 py-2 text-sm text-slate-700 transition-colors hover:bg-slate-50"
                  >
                    <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-100 text-slate-700">
                      <User className="h-4 w-4" />
                    </span>
                    Profile
                  </button>
                  <button
                    onClick={() => setOpen(false)}
                    className="flex w-full items-center gap-3 px-3.5 py-2 text-sm text-slate-700 transition-colors hover:bg-slate-50"
                  >
                    <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-100 text-slate-700">
                      <Settings className="h-4 w-4" />
                    </span>
                    Setting
                  </button>
                  <button
                    onClick={() => {
                      setOpen(false);
                      setShowRoleDrawer(true);
                    }}
                    className="flex w-full items-center gap-3 px-3.5 py-2 text-sm text-slate-700 transition-colors hover:bg-slate-50"
                  >
                    <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-100 text-slate-700">
                      <Repeat className="h-4 w-4" />
                    </span>
                    Switch Role
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Right-sliding role drawer */}
      {showRoleDrawer && (
        <div
          className="fixed inset-0 z-40 bg-black/30"
          onClick={() => setShowRoleDrawer(false)}
        />
      )}
      <div className={`fixed top-0 right-0 z-50 flex h-full w-[500px] flex-col bg-white shadow-lg transition-transform duration-300 ${showRoleDrawer ? 'translate-x-0' : 'translate-x-full'}`}>
        <button
          type="button"
          onClick={() => setShowRoleDrawer(false)}
          aria-label="Close"
          className={`absolute -left-11 top-4 rounded-l-full bg-[#1e2b3f]/80 p-3 text-white transition-all hover:bg-[#263649] ${showRoleDrawer ? "opacity-100" : "pointer-events-none opacity-0"
            }`}
        >
          <X className="w-5 h-5" />
        </button>
        <div className="flex items-center justify-between p-4 border-b border-slate-200 bg-[#1e2b3f]">
          <h2 className="flex items-center justify-center w-full text-lg font-semibold text-white">Switch Role</h2>
        </div>
        <div className="py-4 space-y-2">
          <button
            onClick={() => { setRole('admin'); setShowRoleDrawer(false); }}
            className={`flex w-full items-center gap-4 px-4 py-3 text-lg text-left rounded transition-colors ${role === 'admin'
                ? 'border-[#0088A8] bg-[#0088A8]/30 font-semibold text-[#0088A8]'
                : 'border-slate-200 hover:bg-slate-50'
              }`}
          >
            <div className="relative">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-tr from-[#0088A8] to-[#0ab3dc] text-white shadow-sm ring-2 ring-slate-200">
                <User className="h-6 w-6" />
              </div>
              <span className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-[#0088A8] text-white ring-2 ring-white">
                <ShieldCheck className="h-3 w-3" />
              </span>
            </div>
            <div>
              <p className="font-semibold text-slate-800">Admin</p>
              {/* <p className="text-xs text-slate-500 font-normal">Administrator account</p> */}
            </div>
            {role === 'admin' && <span className="ml-auto font-bold text-[#0088A8]">✓</span>}
          </button>
          <button
            onClick={() => { setRole('user'); setShowRoleDrawer(false); }}
            className={`flex w-full items-center gap-4 px-4 py-3 text-lg text-left rounded transition-colors ${role === 'user'
                ? 'border-[#0088A8] bg-[#0088A8]/30 font-semibold text-[#0088A8]'
                : 'border-slate-200 hover:bg-[#0088A8]/12'
              }`}
          >
            <div className="relative">
              <img
                src={userProfileImg}
                alt="Trainee"
                className="h-11 w-11 rounded-full object-cover ring-2 ring-slate-200 shadow-sm"
              />
              <span className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-slate-600 text-white ring-2 ring-white">
                <User className="h-3 w-3" />
              </span>
            </div>
            <div>
              <p className="font-semibold text-slate-800">Trainee</p>
              {/* <p className="text-xs text-slate-500 font-normal">សុផាត ផន (Trainee)</p> */}
            </div>
            {role === 'user' && <span className="ml-auto font-bold text-[#0088A8]">✓</span>}
          </button>
        </div>
      </div>
    </>
  );
}
