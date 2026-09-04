import { Bell, Menu, MoonStar, User, Settings, Repeat, X, ShieldCheck } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/store/useAuthStore";
import { useCoursesStore } from "@/store/courseStore";

type HeaderProps = {
  onMenuOpen: () => void;
};

export function Header({ onMenuOpen }: HeaderProps) {

  const [open, setOpen] = useState(false);
  const [showRoleDrawer, setShowRoleDrawer] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const role = useAuthStore((s) => s.role);
  const setRole = useAuthStore((s) => s.setRole);
  const previousRoleRef = useRef(role);
  const fetchCourses = useCoursesStore((s) => s.fetchCourses);
  const courses = useCoursesStore((s) => s.courses);
  const navigate = useNavigate();

  useEffect(() => { fetchCourses(); }, [fetchCourses]);

  useEffect(() => {
    const closeProfileMenu = (event: MouseEvent) => {
      if (!profileMenuRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    if (open) {
      document.addEventListener("mousedown", closeProfileMenu);
    }

    return () => document.removeEventListener("mousedown", closeProfileMenu);
  }, [open]);

  useEffect(() => {
    if (previousRoleRef.current === 'user' && role === 'admin') {
      navigate('/admin/insight', { replace: true });
    } else if (previousRoleRef.current === 'admin' && role === 'user') {
      navigate('/trainee/programs', { replace: true });
    }

    previousRoleRef.current = role;
  }, [role, navigate]);

  const hasPending = courses.some((c) => c.approvalStatus === 'PENDING');
  const showDot = role === 'admin' && hasPending;

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
          <button
            type="button"
            onClick={() => { if (role === 'admin') navigate('/admin/courses'); }}
            className="relative transition-colors hover:text-[#1e2b3f]"
            aria-label="Notifications"
          >
            <Bell className="h-[24px] w-[24px]" strokeWidth={1.8} />
            {showDot && (
              <span className="absolute -right-0.5 -top-0.5 h-1.5 w-1.5 rounded-full bg-red-500 ring-1 ring-white" />
            )}
          </button>
          <button type="button" className="flex items-center gap-1.5" aria-label="Language: Khmer">
            <span className="text-lg leading-none" aria-hidden="true">🇰🇭</span>
          </button>
          <div ref={profileMenuRef} className="relative">
            <button type="button" onClick={() => setOpen(o => !o)} aria-label="Open profile menu">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-200 text-[9px] font-bold text-slate-600 ring-1 ring-slate-300">
                {role === 'admin' ? 'AD' : 'SP'}
              </span>
            </button>
            {open && (
              <div className="absolute right-0 py-1 mt-4 bg-white border rounded-md shadow-lg w-52 border-slate-200">
                <button onClick={() => setOpen(false)}
                  className="flex items-center w-full gap-3 px-3 py-2 text-left text-md hover:bg-slate-50">
                  <span className="flex items-center justify-center font-bold rounded h-9 w-9 bg-slate-100 text-slate-900"><User className="w-5 h-5" /></span> Profile
                </button>
                <button onClick={() => setOpen(false)}
                  className="flex items-center w-full gap-3 px-3 py-2 text-base text-left hover:bg-slate-50">
                  <span className="flex items-center justify-center rounded h-9 w-9 bg-slate-100 text-slate-600"><Settings className="w-5 h-5" /></span> Setting
                </button>
                <button onClick={() => { setOpen(false); setShowRoleDrawer(true); }}
                  className="flex items-center w-full gap-3 px-3 py-2 text-base text-left hover:bg-slate-50">
                  <span className="flex items-center justify-center rounded text-slate-600 h-9 w-9 bg-slate-100"><Repeat className="w-5 h-5" /></span> Switch Role
                </button>
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
      <div className={`fixed top-0 right-0 z-50 flex h-full w-[450px] flex-col bg-white shadow-lg transition-transform duration-300 ${showRoleDrawer ? 'translate-x-0' : 'translate-x-full'}`}>
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
        <div className="p-4 space-y-2">
          <button
            onClick={() => { setRole('admin'); setShowRoleDrawer(false); }}
            className={`flex w-full items-center gap-4 px-4 py-3 text-lg text-left rounded transition-colors ${role === 'admin'
                ? 'border-[#0088A8] bg-[#0088A8]/5 font-semibold text-[#0088A8]'
                : 'border-slate-200 hover:bg-slate-50'
              }`}
          >
            <span className={`flex h-10 w-10 items-center justify-center rounded-full ${role === 'admin' ? 'bg-[#0088A8]/70 text-white' : 'bg-slate-100'}`}>
              <ShieldCheck className="w-6 h-6" />
            </span>
            Admin
            {role === 'admin' && <span className="ml-auto">✓</span>}
          </button>
          <button
            onClick={() => { setRole('user'); setShowRoleDrawer(false); }}
            className={`flex w-full items-center gap-4 px-4 py-3 text-lg text-left rounded transition-colors ${role === 'user'
                ? 'border-[#0088A8] bg-[#0088A8]/5 font-semibold text-[#0088A8]'
                : 'border-slate-200 hover:bg-[#0088A8]/12'
              }`}
          >
            <span className={`flex h-10 w-10 items-center justify-center rounded-full ${role === 'user' ? 'bg-[#0088A8]/70 text-white' : 'bg-slate-100'}`}>
              <User className="w-6 h-6" />
            </span>
            Normal User
            {role === 'user' && <span className="ml-auto">✓</span>}
          </button>
        </div>
      </div>
    </>
  );
}
