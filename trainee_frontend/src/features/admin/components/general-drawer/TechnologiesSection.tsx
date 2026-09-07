import { ChevronRight, Plus } from "lucide-react";
import type { CourseTechnology } from "@/types/course";

export function TechnologiesSection({ technologies }: { technologies?: CourseTechnology[] }) {
  const defaultList = ["Django", "Docker", "Express.js", "FastAPI", "Flask"];
  const techNames = technologies && technologies.length > 0
    ? technologies.map(t => t.name)
    : defaultList;

  return (
    <section className="px-5 py-4 border-b border-slate-100 font-kantumruy">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-bold text-[#60738d]">Technologies</h3>
        <button type="button" className="p-1 text-slate-400 hover:text-slate-600">
          <Plus className="w-4 h-4" />
        </button>
      </div>
      <div className="space-y-2">
        {techNames.map((tech) => (
          <div key={tech} className="flex items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-300 text-slate-700 text-xs font-bold">
              {tech.slice(0, 2).toLowerCase()}
            </span>
            <div className="flex-1 min-w-0 py-2.5 border-b border-slate-200">
              <span className="text-sm font-medium text-slate-800">{tech}</span>
            </div>
          </div>
        ))}
        <div className="pt-2 text-right">
          <button type="button" className="inline-flex items-center gap-1 text-xs font-semibold text-cyan-600 hover:text-cyan-700">
            View all <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </section>
  );
}
