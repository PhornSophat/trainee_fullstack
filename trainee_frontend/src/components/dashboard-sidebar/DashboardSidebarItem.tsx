import { NavLink } from "react-router-dom";

type DashboardSidebarItemProps = {
  to: string;
  label: string;
};

export function DashboardSidebarItem({
  to,
  label,
}: DashboardSidebarItemProps) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `
        block rounded-lg px-4 py-3 text-sm font-medium transition-colors

        ${
          isActive
            ? "bg-[#1e2b3f] text-amber-400"
            : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
        }
        `
      }
    >
      {label}
    </NavLink>
  );
}
