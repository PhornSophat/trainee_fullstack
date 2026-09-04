import type { ComponentType } from "react";
import {
  ArrowDownUp,
  Cable,
  Cloud,
  Database,
  Heart,
  Link,
  Monitor,
  Paintbrush,
  Shield,
  Smartphone,
} from "lucide-react";

import type { CategoryNavigationItem } from "../../types/categories";

const iconMap : Record<
    CategoryNavigationItem["icon"],
    ComponentType<{
      className?: string;
      strokeWidth?: number;
    }>
  > = {
    web: Monitor,
    mobile: Smartphone,
    devops: Cloud,
    cyber: Shield,
    uxui: Paintbrush,
    api: Cable,
    database: Database,
    blockchain: Link,
  }

type CategoryNavigationProps = {
  items: CategoryNavigationItem[];
  selectedId?: CategoryNavigationItem["id"];
  onSelect?: (item: CategoryNavigationItem) => void;
  onSortClick?: () => void;
  onFavoritesClick?: () => void;
  className?: string;
};

export function CategoryNavigation({
  items,
  selectedId,
  onSelect,
  onSortClick,
  onFavoritesClick,
  className = "",
}: CategoryNavigationProps) {
  return (
    <nav
      className={`flex items-center gap-4 overflow-x-auto px-4 py-5 ${className}`}
      aria-label="Training categories"
    >
      <button
        type="button"
        onClick={onSortClick}
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-slate-400 text-[#62738d] transition hover:border-slate-300 hover:bg-slate-50"
        aria-label="Sort categories"
      >
        <ArrowDownUp className="w-5 h-5" strokeWidth={1.8} />
      </button>

      <div className="flex flex-wrap items-center justify-center gap-4">
        {items.map((item) => {
          const Icon: ComponentType<{ className?: string; strokeWidth?: number }> = iconMap[item.icon] ?? Monitor;
          const isSelected = selectedId === item.id;

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelect?.(item)}
              className={`flex h-10 shrink-0 items-center gap-2 rounded-full border px-5 text-sm font-medium transition ${
                isSelected
                  ? "border-[#1e2b3f] bg-[#1e2b3f] text-white"
                  : "border-[#cad6e5] text-slate-800 hover:border-[#91a4be] hover:bg-slate-50"
              }`}
              aria-pressed={isSelected}
            >
              <Icon className="h-5 w-5 text-[#62738d]" strokeWidth={2} />
              {item.name}
            </button>
          );
        })}
      </div>

      <button
        type="button"
        onClick={onFavoritesClick}
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-slate-400 text-[#62738d] transition hover:border-slate-300 hover:bg-slate-50"
        aria-label="Show favorites"
      >
        <Heart className="w-5 h-5" strokeWidth={1.8} />
      </button>
    </nav>
  );
}
