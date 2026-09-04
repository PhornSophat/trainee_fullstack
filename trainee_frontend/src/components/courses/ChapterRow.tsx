import { useState } from "react";
import type { Chapter } from "../../types/course";
import { LessonRow } from "../../components/courses/LessonRow";

type ChapterRowProps = {
  chapter: Chapter;
  index: number;
  onLessonClick?: (lessonId: string | number) => void;
};

export function ChapterRow({ chapter, index, onLessonClick }: ChapterRowProps) {
  const [isExpanded, setIsExpanded] = useState(false);    
  const lessons = chapter.lessons || [];
  const totalProgress = lessons.reduce((old, cur) => old + (cur.progressPercentage || 0), 0);
  const chapterProgress = lessons.length > 0 ? Math.round(totalProgress / lessons.length) : 0;
    
  return (
    <div className={`transition-colors bg-white ${isExpanded ? "bg-slate-300" : ""}`}>
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="grid items-center w-full grid-cols-12 px-8 py-4 text-sm text-left transition-colors cursor-pointer hover:bg-slate-50"
      >
        <div className="col-span-1 font-normal text-slate-400">
          {index + 1}
        </div>
        <div className={`flex items-center col-span-5 gap-2 pr-4 `}>
          <svg
            className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${
              isExpanded ? "rotate-90 text-indigo-600" : ""
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
          </svg>
          <span className="justify-end gap-3 font-medium text-slate-800">
            {chapter.title}
          </span>
        </div>
        <div className="flex items-center col-span-2 gap-2 pr-4">
          <svg
            className="w-4 h-4 text-slate-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332-.477-4.5-1.253"
            />
          </svg>
          <span className="justify-end gap-3 font-medium text-slate-800">
            {lessons.length} lessons
          </span>
        </div>
        <div className="flex items-center justify-end col-span-3 gap-3">
          <div className="w-32 h-2 overflow-hidden border rounded-full bg-slate-100 border-slate-200/60">
            <div
              className={`h-full transition-all duration-300 ${
                chapterProgress === 100
                  ? "bg-emerald-500" 
                  : chapterProgress > 0 
                  ? "bg-indigo-500"
                  : "bg-transparent"
              }`}
              style={{ width: `${chapterProgress}%` }}
            />
          </div>
          <span className="text-xs font-semibold text-slate-600 min-w-[36px] text-right font-mono">
            {chapterProgress}%
          </span>
        </div>
      </button>

      {isExpanded && (
        <div className="py-3 pl-16 pr-8 space-y-2 border-t bg-slate-50/50 border-slate-100">
          {lessons.map((lesson, lessonIndex) => (
            <LessonRow 
              key={lesson.id}
              lesson={lesson}
              chapterIndex={index}
              lessonIndex={lessonIndex}
              onClick={() => onLessonClick?.(lesson.id)}
            />
          ))}
        </div>   
      )}
    </div>
  );
}