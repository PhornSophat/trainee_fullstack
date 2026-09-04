import { BookOpen, CheckSquare, Clock3, Heart, Star } from "lucide-react";
import type { CourseCardItem } from "../../types/course";
import { levelStyles } from "./CourseCard.styles";
// import { getTimeAgo } from "./Course.utils";

type CourseCardProps = {
  course: CourseCardItem;
  onClick?: (course: CourseCardItem) => void;
  onFavoriteChange?: (course: CourseCardItem) => void;
};

export function CourseCard({ course, onClick, onFavoriteChange }: CourseCardProps) {
  const visibleInstructors = course.instructors.slice(0, 4);
  const additionalInstructors = course.instructors.length - visibleInstructors.length;
  const filledStars = Math.round(Math.min(5, Math.max(0, course.rating)));

  return (
    <article
     className="relative w-full max-w-[370px] mx-auto p-2 transition-all duration-300 bg-white group rounded-2xl hover:bg-slate-100 hover:shadow-md"
    >
      <div
        role="button"
        tabIndex={0}
        onClick={() => onClick?.(course)}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            onClick?.(course);
          }
        }}
        className="w-full text-left cursor-pointer"
        aria-label={`Open ${course.title}`}
      >
        <div className="relative h-[182px] overflow-hidden rounded-lg border border-slate-200 bg-white">
          <span
            className={`absolute -left-6 top-5 z-10 w-28 -rotate-45 py-1 text-center text-[10px] font-bold ${levelStyles[course.level]}`}
          >
            {course.level}
          </span>
          <img
            src={course.imageUrl}
            alt=""
            className="object-contain w-full h-full p-3 transition-transform duration-300 ease-out group-hover:scale-110"
          />
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              onFavoriteChange?.(course);
            }}
            className={`absolute right-3 top-3 rounded-full p-1.5 transition hover:bg-slate-100 ${
              course.isFavorite ? "text-rose-500" : "text-[#d5e2f1]"
            }`}
            aria-label={course.isFavorite ? "Remove from favorites" : "Add to favorites"}
          >
            <Heart className="w-5 h-5" fill={course.isFavorite ? "currentColor" : "none"} strokeWidth={1.8} />
          </button>
        </div>

        <div className="px-2 pt-2 pb-3">
          <h2 className="text-lg font-semibold truncate text-slate-900">{course.title}</h2>
          <p className="mt-0.5 truncate text-sm text-slate-500">ជំនាញបច្ចេកវិទ្យាព័ត៌មាន</p>

          <div className="mt-2 flex items-center gap-2 text-sm text-[#60738d]">
            <span className="flex items-center gap-1"><BookOpen className="h-3.5 w-3.5" />{course.lessons} lessons</span>
            <span>•</span>
            <span className="flex items-center gap-1"><CheckSquare className="h-3.5 w-3.5" />{course.tasks} tasks</span>
            <span className="flex ml-auto -space-x-2">
              {visibleInstructors.map((instructor) => (
                instructor.avatarUrl ? (
                  <img key={instructor.id} src={instructor.avatarUrl} alt={instructor.name} className="object-cover w-6 h-6 border-2 border-white rounded-full" />
                ) : (
                  <span key={instructor.id} title={instructor.name} className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-white bg-[#60738d] text-[8px] font-bold text-white">
                    {instructor.name.slice(0, 1).toUpperCase()}
                  </span>
                )
              ))}
              {additionalInstructors > 0 && (
                <span className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-white bg-[#60738d] text-[9px] font-bold text-white">+{additionalInstructors}</span>
              )}
            </span>
          </div>

          <div className="flex items-center gap-1 mt-3 text-sm">
            <span className="font-medium text-amber-500">{course.rating.toFixed(1)}</span>
            <span className="flex">
              {Array.from({ length: 5 }, (_, index) => (
                <Star
                  key={index}
                  className={index < filledStars ? "h-4 w-4 text-amber-500" : "h-4 w-4 text-slate-300"}
                  fill={index < filledStars ? "currentColor" : "none"}
                />
              ))}
            </span>
            <span className="text-[#60738d]">({course.reviewCount})</span>
            <span className="ml-1 flex items-center gap-1 text-[#60738d]"><Clock3 className="w-4 h-4" />{course.duration}</span>
          </div>
          {/* <p className="mt-1 text-xs text-slate-400">Added {getTimeAgo(course.createdAt)}</p> */}
        </div>
      </div>
    </article>
  );
}
