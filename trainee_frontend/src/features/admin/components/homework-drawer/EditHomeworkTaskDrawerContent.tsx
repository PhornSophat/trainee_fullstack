import { useState } from "react";
import { FileText, Loader2, Calendar, Award } from "lucide-react";
import type { HomeworkTask, HomeworkType } from "@/types/course";

type EditHomeworkTaskDrawerContentProps = {
  task?: HomeworkTask | null;
  onSave: (data: {
    title: string;
    description?: string;
    type: HomeworkType;
    maxScore: number;
    dueDate?: string;
  }) => Promise<void>;
  onCancel: () => void;
};

export function EditHomeworkTaskDrawerContent({
  task,
  onSave,
  onCancel: _onCancel,
}: EditHomeworkTaskDrawerContentProps) {
  const [title, setTitle] = useState(task?.title || "");
  const [description, setDescription] = useState(task?.description || "");
  const [type, setType] = useState<HomeworkType>(task?.type || "task");
  const [maxScore, setMaxScore] = useState<number>(task?.maxScore ?? 100);
  const [dueDate, setDueDate] = useState<string>(() => {
    if (!task?.dueDate) return "";
    try {
      const d = new Date(task.dueDate);
      return d.toISOString().substring(0, 16);
    } catch {
      return "";
    }
  });
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    try {
      setIsSaving(true);
      await onSave({
        title: title.trim(),
        description: description.trim(),
        type,
        maxScore: Number(maxScore) || 100,
        dueDate: dueDate ? new Date(dueDate).toISOString() : undefined,
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
        {/* 1. Task Title (ចំណងជើងភារកិច្ច*) */}
        <div className="relative">
          <label className="absolute -top-2.5 left-3 bg-white px-1 text-xs font-medium text-slate-500 z-10 select-none">
            ចំណងជើងភារកិច្ច*
          </label>
          <div className="flex items-center gap-3 px-3 py-3 border rounded-lg border-slate-300 focus-within:border-cyan-600 bg-white">
            <FileText className="w-5 h-5 text-slate-500 shrink-0" />
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              autoFocus
              className="w-full text-sm outline-none bg-transparent text-slate-800"
              placeholder="e.g. Define API endpoints"
            />
          </div>
        </div>

        {/* 2. Type & Max Score */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1.5">
              ប្រភេទភារកិច្ច (Type)
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as HomeworkType)}
              className="w-full px-3 py-2.5 border rounded-lg border-slate-300 text-sm bg-white text-slate-800 outline-none focus:border-cyan-600 cursor-pointer"
            >
              <option value="task">Task (កិច្ចការអនុវត្ត)</option>
              <option value="quiz">Quiz (កម្រងសំណួរ)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1.5">
              ពិន្ទុអតិបរមា (Max Score)
            </label>
            <div className="flex items-center gap-2 px-3 py-2.5 border rounded-lg border-slate-300 focus-within:border-cyan-600 bg-white">
              <Award className="w-4 h-4 text-slate-400 shrink-0" />
              <input
                type="number"
                min={1}
                max={1000}
                value={maxScore}
                onChange={(e) => setMaxScore(Number(e.target.value))}
                className="w-full text-sm outline-none text-slate-800 bg-transparent"
              />
            </div>
          </div>
        </div>

        {/* 3. Due Date */}
        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1.5">
            កាលបរិច្ឆេទផុតកំណត់ (Due Date)
          </label>
          <div className="flex items-center gap-3 px-3 py-2.5 border rounded-lg border-slate-300 focus-within:border-cyan-600 bg-white">
            <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
            <input
              type="datetime-local"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full text-sm outline-none text-slate-800 bg-transparent"
            />
          </div>
        </div>

        {/* 4. Instructions / Description (ការណែនាំ) */}
        <div>
          <label className="block text-sm font-semibold text-[#60738d] mb-2">
            ការណែនាំ / សេចក្តីលម្អិត
          </label>
          <textarea
            rows={5}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full p-4 text-sm leading-relaxed border rounded-xl border-slate-300 text-slate-800 focus:border-cyan-600 outline-none resize-none"
            placeholder={task?.description || "Provide instructions, requirements, deliverables, or questions for students..."}
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
