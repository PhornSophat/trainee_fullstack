import { Code2, Database, Server, Plus, Pencil } from "lucide-react";
import type { KeyLesson } from "@/types/course";

type KeyLessonsSectionProps = {
  keyLessons?: KeyLesson[];
  onAddLesson?: () => void;
  onEditLesson?: (index: number, lesson: KeyLesson) => void;
};

export function KeyLessonsSection({
  keyLessons,
  onAddLesson,
  onEditLesson,
}: KeyLessonsSectionProps) {
  const items = keyLessons ?? [];
  const icons = [Code2, Database, Server];

  return (
    <section className="px-5 py-4 border-b border-slate-100 font-kantumruy">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-bold text-[#60738d]">Key Lessons</h3>
        <button
          type="button"
          onClick={onAddLesson}
          title="Add key lesson"
          aria-label="Add key lesson"
          className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded transition-colors"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>
      {items.length === 0 ? (
        <p className="text-xs text-slate-400 italic py-2">No key lessons added yet.</p>
      ) : (
        <div className="space-y-1">
          {items.map((item, idx) => {
            const Icon = icons[idx % icons.length];
            return (
              <div
                key={idx}
                onClick={() => onEditLesson?.(idx, item)}
                className="flex items-start gap-3 p-2 rounded-lg cursor-pointer hover:bg-slate-50 transition-colors group"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-200 text-slate-700 mt-0.5 group-hover:bg-[#0088A8]/10 group-hover:text-[#0088A8] transition-colors overflow-hidden border border-slate-200">
                  {item.imageUrl ? (
                    <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover" />
                  ) : (
                    <Icon className="w-5 h-5" />
                  )}
                </span>
                <div className="flex-1 min-w-0 pb-1">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-slate-800">{item.title}</h4>
                    <Pencil className="w-3.5 h-3.5 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity ml-2 shrink-0" />
                  </div>
                  {item.description && (
                    <p className="mt-0.5 text-xs text-slate-500 leading-relaxed">{item.description}</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
