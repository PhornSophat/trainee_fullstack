import { DashboardSidebarItem } from "./DashboardSidebarItem";

type DashboardSidebarProps = {
  isOpen: boolean;
  onClose: () => void;
};

export function DashboardSidebar({
  isOpen,
  onClose,
}: DashboardSidebarProps) {
  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`
          fixed left-0 top-0 z-50
          h-screen w-56
          border-r border-slate-200 bg-white

          transform transition-transform duration-300

          lg:static lg:translate-x-0

          ${isOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        {/* <div className="px-5 py-6 border-b border-slate-200">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
            Training
          </p>
          <h2 className="mt-1 font-semibold text-slate-800">Learning menu</h2>
        </div> */}

        <nav className="p-4 space-y-2">

          <DashboardSidebarItem 
            to="overview" 
            label="Overview" 
          />

          <DashboardSidebarItem
            to="tasks"
            label="Tasks"
          />

          <DashboardSidebarItem
            to="settings"
            label="Settings"
          />

        </nav>
      </aside>
    </>
  );
}
