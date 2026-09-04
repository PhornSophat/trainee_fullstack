import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { MainSidebarItem } from "../main-sidebar/MainSidebarItem";
import { useAuthStore } from "../../store/useAuthStore";
import {
  BarChart3,
  BriefcaseBusiness,
  ClipboardCheck,
  Code2,
  Home,
  Microscope,
  Settings,
  Star,
  Users,
  X,
} from "lucide-react";
import type { LucideIcon, LucideProps } from "lucide-react";

const StarFill = ((props: LucideProps) => <Star {...props} fill="currentColor" />) as LucideIcon;

type MainSidebarProps = {
  isOpen: boolean;
  onClose: () => void;
};

function MainSidebar({
  isOpen,
  onClose,
}: MainSidebarProps) {
  const { role } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [isTrainingMenuOpen, setIsTrainingMenuOpen] = useState(false);
  const isAdminTrainingActive = ["/admin/courses", "/admin/training-insight"].includes(location.pathname);
  const isInsightActive = location.pathname === "/admin/insight";
  const isTrainingInsightActive = location.pathname === "/admin/training-insight";
  const isCoursesActive = location.pathname === "/admin/courses";

  const closeTrainingMenu = () => setIsTrainingMenuOpen(false);
  const openTrainingPage = (path: string) => {
    navigate(path);
    closeTrainingMenu();
    onClose();
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          onClick={() => {
            onClose();
            closeTrainingMenu();
          }}
        />
      )}

      <aside
        className={`
          fixed inset-y-0 left-0 z-50
          flex h-dvh w-[124px] flex-col
          border-r border-[#314156] bg-[#1e2b3f]

          transform transition-transform duration-300

          lg:fixed lg:translate-x-0

          ${isOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        <div className="flex h-[112px] flex-col items-center justify-center border-[#314156]">
          <svg
            viewBox="0 0 64 62"
            className="h-14 w-14"
            role="img"
            aria-label="Training Platform"
          >
            <path d="M39 4C25 8 15 17 17 28c2 10 12 12 18 7 7-6 8-18 4-31Z" fill="#1482a7" />
            <path d="M18 26c10 3 12 9 3 15" fill="none" stroke="#ffc400" strokeWidth="3" strokeLinecap="round" />
          </svg>
          <span className="-mt-1 text-[10px] font-bold tracking-wide text-white">TRAINING</span>
          <span className="text-[7px] font-semibold tracking-[0.13em] text-slate-300">PLATFORM</span>
        </div>

        <nav className="px-2 pt-2 space-y-1" aria-label="Main navigation">
          <MainSidebarItem
            to={role === "admin" ? "/admin/insight" : "/trainee"}
            label="Home"
            icon={Home}
            end
            active={role === "admin" ? isInsightActive : undefined}
          />
          <MainSidebarItem
            label="Training"
            icon={Code2}
            to={role === "admin" ? undefined : "/trainee/programs"}
            onClick={role === "admin" ? () => setIsTrainingMenuOpen(true) : undefined}
            active={role === "admin" && isAdminTrainingActive}
          />
          <MainSidebarItem
            to="/training-eg"
            label="Research"
            icon={Microscope}
            disabled
          />
          <MainSidebarItem
            label="Project"
            icon={StarFill}
            disabled
          />
          <MainSidebarItem
            label="Industry"
            icon={BriefcaseBusiness}
            disabled
          />

          {role === "admin" && (
            <>
              <MainSidebarItem
                to="/admin/approvals"
                label="Approvals"
                icon={ClipboardCheck}
              />
              <MainSidebarItem
                label="Users"
                icon={Users}
                disabled
              />
              <MainSidebarItem
                label="Analytics"
                icon={BarChart3}
                disabled
              />
              <MainSidebarItem
                label="Settings"
                icon={Settings}
                disabled
              />
            </>
          )}
        </nav>

        <div className="mt-auto pb-4 text-center text-[10px] text-slate-500">Version 1.0.1</div>
      </aside>

      {isTrainingMenuOpen && (
        <button
          type="button"
          className="fixed inset-0 z-[44] hidden cursor-default bg-black/20 lg:block"
          onClick={closeTrainingMenu}
          aria-label="Close training menu"
        />
      )}

      <aside
        aria-hidden={!isTrainingMenuOpen}
        aria-label="Training administration menu"
        className={`fixed inset-y-0 left-0 z-[45] flex w-72 flex-col border-r border-[#314156] bg-[#1e2b3f] shadow-2xl transition-transform duration-300 ease-out lg:left-[124px] ${isTrainingMenuOpen
          ? "translate-x-0"
          : "-translate-x-full lg:-translate-x-[calc(100%+124px)]"
          }`}
      >
        <div className="flex items-center justify-between border-b border-[#314156] px-5 py-5">
          <div>
            <p className="text-xs font-semibold text-slate-400">CamCyber</p>
            <h2 className="mt-1 text-lg font-semibold text-white">Training System</h2>
          </div>
          <button
            type="button"
            onClick={closeTrainingMenu}
            className="rounded-full p-2 text-slate-400 transition-colors hover:bg-[#263649] hover:text-slate-200"
            aria-label="Close training menu"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        <nav className="p-3 space-y-1" aria-label="Training administration navigation">
          <button
            type="button"
            onClick={() => openTrainingPage("/admin/training-insight")}
            className={`flex w-full items-center gap-3 rounded-full px-4 py-3 text-left font-medium transition-colors ${isTrainingInsightActive
              ? "bg-[#2b3a4b] text-amber-400"
              : "text-slate-400 hover:bg-[#263649] hover:text-slate-200"
              }`}
          >
            <BarChart3 className="w-5 h-5" strokeWidth={2.5} aria-hidden="true" />
            Insight
          </button>
          <button
            type="button"
            onClick={() => openTrainingPage("/admin/courses")}
            className={`flex w-full items-center gap-3 rounded-full px-4 py-3 text-left font-medium transition-colors ${isCoursesActive
              ? "bg-[#2b3a4b] text-amber-400"
              : "text-slate-400 hover:bg-[#263649] hover:text-slate-200"
              }`}
          >
            <Code2 className="w-5 h-5" strokeWidth={2.5} aria-hidden="true" />
            Courses
          </button>
          <button
            type="button"
            className="flex items-center w-full gap-3 px-4 py-3 font-medium text-left rounded-md cursor-not-allowed text-slate-500"
            aria-disabled="true"
            title="Trainees page is coming soon"
          >
            <Users className="w-5 h-5" strokeWidth={2.5} aria-hidden="true" />
            Trainees
          </button>
        </nav>
      </aside>
    </>
  );
}

export { MainSidebar };
export default MainSidebar;
