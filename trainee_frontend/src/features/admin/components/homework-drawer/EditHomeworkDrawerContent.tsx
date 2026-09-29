import { useState } from "react";
import { ClipboardList, Loader2 } from "lucide-react";
import type { Homework } from "@/types/course";

type EditHomeworkDrawerContentProps = {
  homework?: Homework | null;
  onSave: (data: { title: string; description?: string }) => Promise<void>;
  onCancel: () => void;
};

export function EditHomeworkDrawerContent({
  homework,
  onSave,
  onCancel: _onCancel,
}: EditHomeworkDrawerContentProps) {
  const [title, setTitle] = useState(homework?.title || "");
  const [description, setDescription] = useState(homework?.description || "");
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    try {
      setIsSaving(true);
      await onSave({
        title: title.trim(),
        description: description.trim(),
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex-1 flex flex-col justify-between font-kantumruy"
    >
      {/* Form Fields */}
      <div className="p-6 space-y-6">
        {/* Homework Title (ចំណងជើង*) */}
        <div className="relative">
          <label className="absolute -top-2.5 left-3 bg-white px-1 text-xs font-medium text-slate-500 z-10 select-none">
            ចំណងជើងកិច្ចការផ្ទះ*
          </label>
          <div className="flex items-center gap-3 px-3 py-3 border rounded-lg border-slate-300 focus-within:border-cyan-600 bg-white">
            <ClipboardList className="w-5 h-5 text-slate-500 shrink-0" />
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              autoFocus
              className="w-full text-sm outline-none bg-transparent text-slate-800"
              placeholder="e.g. Homework 1: API Contract Design"
            />
          </div>
        </div>

        {/* Objective / Description (ការពិពណ៌នា) */}
        <div>
          <label className="block text-sm font-semibold text-[#60738d] mb-2">
            ការពិពណ៌នា / សេចក្តីណែនាំ
          </label>
          <textarea
            rows={5}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full p-4 text-sm leading-relaxed border rounded-xl border-slate-300 text-slate-800 focus:border-cyan-600 outline-none resize-none"
            placeholder={homework?.description || "Design the API contract and specifications for the new feature..."}
          />
        </div>
      </div>

      {/* Bottom Sticky Footer */}
      <div className="sticky bottom-0 flex items-center justify-end px-6 py-4 mt-auto bg-white border-t border-slate-200">
        <button
          type="submit"
          disabled={isSaving || !title.trim()}
          className="flex items-center justify-center gap-2 rounded-lg bg-cyan-600 px-8 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-cyan-700 disabled:opacity-50"
        >
          {isSaving ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>កំពុងរក្សាទុក...</span>
            </>
          ) : (
            <span>រួចរាល់</span>
          )}
        </button>
      </div>
    </form>
  );
}
