import { HelpCircle, Plus, Pencil } from "lucide-react";
import type { CourseFAQ } from "@/types/course";

type QnASectionProps = {
  faqs?: CourseFAQ[];
  onAddFaq?: () => void;
  onEditFaq?: (index: number, faq: CourseFAQ) => void;
};

export function QnASection({ faqs, onAddFaq, onEditFaq }: QnASectionProps) {
  const items = faqs ?? [];

  return (
    <section className="px-5 py-4 pb-8 font-kantumruy">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-bold text-[#60738d]">Q&A</h3>
        <button
          type="button"
          onClick={onAddFaq}
          title="Add question & answer"
          aria-label="Add question & answer"
          className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded transition-colors"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>
      {items.length === 0 ? (
        <p className="text-xs text-slate-400 italic py-2">No Q&A added yet.</p>
      ) : (
        <div className="space-y-1">
          {items.map((item, idx) => (
            <div
              key={idx}
              onClick={() => onEditFaq?.(idx, item)}
              className="flex items-start gap-3 p-2 rounded-lg cursor-pointer hover:bg-slate-50 transition-colors group"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-200 text-slate-700 mt-0.5 group-hover:bg-[#0088A8]/10 group-hover:text-[#0088A8] transition-colors">
                <HelpCircle className="w-5 h-5" />
              </span>
              <div className="flex-1 min-w-0 pb-1">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold leading-snug text-slate-800">{item.question}</h4>
                  <Pencil className="w-3.5 h-3.5 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity ml-2 shrink-0" />
                </div>
                {item.answer && (
                  <p className="mt-1 text-xs leading-relaxed text-slate-500">{item.answer}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
