import { NavLink } from "react-router-dom";
import type { LucideIcon } from "lucide-react";

type MainSidebarItemProps = {
  to?: string;
  label: string;
  icon: LucideIcon;
  disabled?: boolean;
  end?: boolean;
  onClick?: () => void;
  active?: boolean;
};

export function MainSidebarItem({
  to,
  label,
  icon: Icon,
  disabled = false,
  end = false,
  onClick,
  active = false,
}: MainSidebarItemProps) {
  const content = (
    <>
      <Icon className="w-6 h-6" strokeWidth={2.5} aria-hidden="true" />
      <span className="mt-2 text-[14px] font-medium leading-tight">{label}</span>
    </>
  );

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        className={`flex min-h-[80px] w-full flex-col items-center justify-center rounded-md px-2 transition-colors ${active
            ? "bg-[#2b3a4b] text-amber-400"
            : "text-slate-400 hover:bg-[#263649] hover:text-slate-200"
          }`}
      >
        {content}
      </button>
    );
  }

  if (!to || disabled) {
    return (
      <div
        className="flex min-h-[80px] w-full cursor-default flex-col items-center justify-center rounded-md px-2 text-slate-400"
        aria-disabled="true"
      >
        {content}
      </div>
    );
  }

  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        `flex min-h-[80px] w-full flex-col items-center justify-center rounded-md px-2 transition-colors ${active || isActive
          ? "bg-[#2b3a4b] text-amber-400"
          : "text-slate-400 hover:bg-[#263649] hover:text-slate-200"
        }`
      }
    >
      {content}
    </NavLink>
  );
}
