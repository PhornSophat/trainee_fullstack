import { Check, Plus, Pencil } from "lucide-react";

type WhatYouWillLearnSectionProps = {
  skills?: string[];
  onAddSkill?: () => void;
  onEditSkill?: (index: number, text: string) => void;
};


export function WhatYouWillLearnSection({ skills, onAddSkill, onEditSkill }: WhatYouWillLearnSectionProps) {
  const items = skills ?? [];

  return (
    <section className="px-5 py-4 border-b border-slate-100 font-kantumruy">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-bold text-[#60738d]">What you will learn</h3>
        <button
          type="button"
          onClick={onAddSkill}
          title="Add new learning point"
          aria-label="Add new learning point"
          className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded transition-colors"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>
      {items.length === 0 ? (
        <p className="text-xs text-slate-400 italic py-2">No learning points added yet.</p>
      ) : (
        <ul className="space-y-1">
          {items.map((skill, index) => (
            <li
              key={index}
              onClick={() => onEditSkill?.(index, skill)}
              className="flex items-start gap-3 p-2 text-sm rounded-lg cursor-pointer text-slate-700 hover:bg-slate-50 transition-colors group"
            >
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-200 text-slate-600 mt-0.5 group-hover:bg-[#0088A8]/10 group-hover:text-[#0088A8]">
                <Check className="w-4 h-4" />
              </span>
              <div className="flex-1 min-w-0 flex items-center justify-between">
                <span className="leading-snug block">{skill}</span>
                <Pencil className="w-3.5 h-3.5 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity ml-2 shrink-0" />
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
