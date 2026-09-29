import {
  Code2,
  Database,
  FileText,
  Server,
  Link2,
  Video,
  BookOpen,
  Plus,
  Pencil,
  ExternalLink,
} from "lucide-react";
import type { LearningResource } from "@/types/course";

type LearningResourcesSectionProps = {
  resources?: LearningResource[];
  onAddResource?: () => void;
  onEditResource?: (index: number, resource: LearningResource) => void;
};

const ICON_MAP: Record<string, typeof FileText> = {
  code: Code2,
  database: Database,
  file: FileText,
  server: Server,
  link: Link2,
  video: Video,
  book: BookOpen,
};

export function LearningResourcesSection({
  resources,
  onAddResource,
  onEditResource,
}: LearningResourcesSectionProps) {
  const items = resources ?? [];

  return (
    <section className="px-5 py-4 border-b border-slate-100 font-kantumruy">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-bold text-[#60738d]">Learning Resources</h3>
        <button
          type="button"
          onClick={onAddResource}
          title="Add learning resource"
          aria-label="Add learning resource"
          className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded transition-colors"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>
      {items.length === 0 ? (
        <p className="text-xs text-slate-400 italic py-2">No learning resources added yet.</p>
      ) : (
        <div className="space-y-1">
          {items.map((res, idx) => {
            const Icon = (res.icon && ICON_MAP[res.icon]) || FileText;
            return (
              <div
                key={`${res.title}-${idx}`}
                onClick={() => onEditResource?.(idx, res)}
                className="flex items-center gap-3 p-2 rounded-lg cursor-pointer hover:bg-slate-50 transition-colors group"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-200 text-slate-700 group-hover:bg-[#0088A8]/10 group-hover:text-[#0088A8] transition-colors">
                  <Icon className="w-5 h-5" />
                </span>
                <div className="flex-1 min-w-0 flex items-center justify-between py-1 border-b border-slate-100 group-hover:border-transparent">
                  <div className="flex flex-col min-w-0">
                    <span className="text-sm font-medium text-slate-800 truncate">
                      {res.title}
                    </span>
                    {res.url && (
                      <span className="text-xs text-slate-400 truncate flex items-center gap-1">
                        <ExternalLink className="w-3 h-3 shrink-0" />
                        <span className="truncate">{res.url}</span>
                      </span>
                    )}
                  </div>
                  <Pencil className="w-3.5 h-3.5 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity ml-2 shrink-0" />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
