import type { Lesson } from "../../types/course";
import { formatKhmerLessonTitle } from "../../lib/khmerUtils";

type LessonRowProps = {
  lesson: Lesson;
  chapterIndex?: number;
  lessonIndex: number;
  onClick?: () => void; // Added click handler callback
};

export function LessonRow({
  lesson,
  chapterIndex: _chapterIndex,
  lessonIndex,
  onClick,
}: LessonRowProps) {
  const progress = lesson.progressPercentage || 0;

  return (
    <div
      onClick={onClick}
      className="flex items-center justify-between p-3.5 text-sm transition-all bg-white border rounded-lg cursor-pointer border-slate-200/60 shadow-2xs hover:border-indigo-300 hover:shadow-xs"
    >
      <div className="flex items-center gap-3">
        <span className="text-base font-normal transition-colors text-slate-900 hover:text-indigo-600 font-kantumruy">
          {formatKhmerLessonTitle(lesson.title, lessonIndex)}
        </span>
        {lesson.duration && (
          <span className="text-slate-500 font-mono text-xs font-normal">
            (Duration: {lesson.duration})
          </span>
        )}
      </div>

      <div className="flex items-center gap-3">
        <div className="w-24 bg-slate-100 rounded-full h-1.5 overflow-hidden border border-slate-200/40">
          <div
            className={`h-full transition-all duration-300 ${
              progress === 100 ? "bg-emerald-500" : "bg-amber-500"
            }`}
            style={{ width: `${progress}%` }}
          />
        </div>
        <span
          className={`px-2.5 py-0.5 rounded-md font-mono text-xs font-normal border ${
            progress === 100
              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
              : progress > 0
              ? "bg-amber-50 text-amber-700 border-amber-200"
              : "bg-slate-100 text-slate-500 border-slate-200"
          }`}
        >
          {progress} %
        </span>
      </div>
    </div>
  );
}