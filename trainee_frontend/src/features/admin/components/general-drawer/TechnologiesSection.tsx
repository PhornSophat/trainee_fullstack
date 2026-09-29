import { Plus, Pencil } from "lucide-react";
import type { CourseTechnology } from "@/types/course";

type TechnologiesSectionProps = {
  technologies?: CourseTechnology[];
  onAddTech?: () => void;
  onEditTech?: (index: number, tech: CourseTechnology) => void;
};

export function TechnologiesSection({
  technologies,
  onAddTech,
  onEditTech,
}: TechnologiesSectionProps) {
  const items = technologies ?? [];

  return (
    <section className="px-5 py-4 border-b border-slate-100 font-kantumruy">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-bold text-[#60738d]">Technologies</h3>
        <button
          type="button"
          onClick={onAddTech}
          title="Add technology"
          aria-label="Add technology"
          className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded transition-colors"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>
      {items.length === 0 ? (
        <p className="text-xs text-slate-400 italic py-2">No technologies added yet.</p>
      ) : (
        <div className="space-y-1">
          {items.map((tech, idx) => (
            <div
              key={`${tech.name}-${idx}`}
              onClick={() => onEditTech?.(idx, tech)}
              className="flex items-center gap-3 p-2 rounded-lg cursor-pointer hover:bg-slate-50 transition-colors group"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100 border border-slate-200/80 p-1.5 overflow-hidden group-hover:border-[#0088A8]/40 transition-colors">
                {tech.icon ? (
                  <img
                    src={tech.icon}
                    alt={tech.name}
                    className="w-full h-full object-contain"
                    onError={(e) => {
                      (e.currentTarget as HTMLElement).style.display = "none";
                    }}
                  />
                ) : (
                  <span className="text-xs font-bold text-slate-700 group-hover:text-[#0088A8] transition-colors">
                    {tech.name.slice(0, 2).toLowerCase()}
                  </span>
                )}
              </span>
              <div className="flex-1 min-w-0 flex items-center justify-between">
                <span className="text-sm font-medium text-slate-800">{tech.name}</span>
                <Pencil className="w-3.5 h-3.5 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity ml-2 shrink-0" />
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
