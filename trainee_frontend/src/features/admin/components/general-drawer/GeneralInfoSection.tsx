import { useState, useEffect } from "react";
import { Pencil, Layers, BarChart3, AlignLeft } from "lucide-react";
import { InfoRow } from "./InfoRow";
import type { CourseCardItem } from "@/types/course";
import { getCategories } from "@/services/categoryService";
import type { CategoryNavigationItem } from "@/types/categories";

export function GeneralInfoSection({ course, onEdit }: { course: CourseCardItem; onEdit: () => void }) {
  const [categories, setCategories] = useState<CategoryNavigationItem[]>([]);

  useEffect(() => {
    if (!course.categoryName && course.categoryId) {
      getCategories().then(setCategories);
    }
  }, [course.categoryName, course.categoryId]);

  const majorName =
    course.categoryName ||
    categories.find((c) => Number(c.id) === Number(course.categoryId))?.name ||
    "Not assigned";

  return (
    <section className="px-5 py-4 border-b border-slate-100 font-kantumruy">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-bold text-[#60738d]">General information</h3>
        <button type="button" className="p-1 text-slate-400 hover:text-slate-600" onClick={onEdit}>
          <Pencil className="w-4 h-4" />
        </button>
      </div>
      <div className="space-y-3">
        <InfoRow
          icon={Pencil}
          label="Name in Khmer"
          value={course.khmerTitle || "អ្នកអភិវឌ្ឍកម្មវិធីសហប្រតិបត្តិការ"}
        />
        <InfoRow
          icon={Pencil}
          label="Name in English"
          value={course.title || "API/Backend Developer"}
        />
        <InfoRow icon={Layers} label="Major" value={majorName} />
        <InfoRow
          icon={BarChart3}
          label="Level"
          value={
            course.level === "ADVANCED"
              ? "កម្រិតខ្ពស់"
              : course.level === "INTERMEDIATE"
              ? "កម្រិតមធ្យម"
              : "កម្រិតដំបូង"
          }
        />
        <InfoRow
          icon={AlignLeft}
          label="Description"
          value={
            course.description ||
            "API/Backend Developer is a practical program with guided lessons, hands-on homework, and support from mentors."
          }
        />
      </div>
    </section>
  );
}

