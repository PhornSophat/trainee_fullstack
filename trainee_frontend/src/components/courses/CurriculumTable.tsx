import type { Chapter, TabType } from "../../types/course";
import { ChapterRow } from "./ChapterRow";

type CurriculumTableProps = {
  activeTab: TabType;
  chapters: Chapter[];
  isLoading?: boolean;
  onLessonClick?: (lessonId: string | number) => void; // Added prop
};

export function CurriculumTable({
  activeTab,
  chapters,
  isLoading,
  onLessonClick,
}: CurriculumTableProps) {
  if (activeTab !== "Curriculum") {
    return (
      <div className="p-8 text-center text-slate-500 min-h-[300px] flex items-center justify-center">
        Content for <strong className="mx-1">{activeTab}</strong>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="p-12 text-sm font-medium text-center text-slate-400 animate-pulse">
        Loading curriculum data...
      </div>
    );
  }

  return (
    <div className="w-full bg-white text-slate-700">
      <div className="sticky top-0 z-10 grid grid-cols-12 px-8 py-4 text-xs font-semibold bg-white border-b border-slate-200 text-slate-900">
        <div className="col-span-1">No.</div>
        <div className="col-span-5">Chapter</div>
        <div className="col-span-2">Lesson</div>
        <div className="col-span-4 text-right">Overall Progress</div>
      </div>

      <div className="divide-y divide-slate-100">
        {chapters.length > 0 ? (
          chapters.map((chapter, index) => (
            <ChapterRow
              key={chapter.id}
              chapter={chapter}
              index={index}
              onLessonClick={onLessonClick} // Pass prop down
            />
          ))
        ) : (
          <div className="p-8 text-xs italic text-center text-slate-400">
            No curriculum chapters available.
          </div>
        )}
      </div>
    </div>
  );
}