import { useState, useEffect } from "react";
import {
  Pencil,
  Layers,
  BarChart3,
  ChevronDown,
  Loader2,
} from "lucide-react";
import type { CourseCardItem, CourseLevel } from "@/types/course";
import type { CategoryNavigationItem } from "@/types/categories";
import { useCoursesStore } from "@/store/courseStore";
import { useToastStore } from "@/store/useToastStore";
import { getCategories } from "@/services/categoryService";

type EditGeneralDrawerContentProps = {
  course: CourseCardItem;
  onCancel: () => void;
};

export function EditGeneralDrawerContent({
  course,
  onCancel,
}: EditGeneralDrawerContentProps) {
  const updateCourse = useCoursesStore((s) => s.updateCourse);
  const showToast = useToastStore((s) => s.showToast);

  // Form states
  const [khmerTitle, setKhmerTitle] = useState(course.khmerTitle || "");
  const [title, setTitle] = useState(course.title || "");
  const [categoryId, setCategoryId] = useState<number | undefined>(
    course.categoryId ? Number(course.categoryId) : undefined
  );
  const [level, setLevel] = useState<CourseLevel>(course.level || "BASIC");
  const [description, setDescription] = useState(course.description || "");

  const [categories, setCategories] = useState<CategoryNavigationItem[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    getCategories().then(setCategories);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const selectedCat = categories.find((c) => Number(c.id) === Number(categoryId));
      await updateCourse(course.id, {
        title,
        khmerTitle,
        level,
        categoryId,
        categoryName: selectedCat?.name || course.categoryName,
        description,
      });

      showToast("វគ្គសិក្សាត្រូវបានកែប្រែដោយជោគជ័យ!", "success");
      onCancel();
    } catch (error) {
      console.error("Failed to update course:", error);
      showToast("មិនអាចកែប្រែទិន្នន័យបានទេ សូមព្យាយាមម្តងទៀត", "error");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col justify-between min-h-[calc(100vh-14rem)] font-kantumruy"
    >
      {/* Form Fields */}
      <div className="p-6 space-y-6">
        {/* 1. Name in Khmer* */}
        <div className="relative">
          <label className="absolute -top-2.5 left-3 bg-white px-1 text-xs font-medium text-slate-500">
            Name in Khmer*
          </label>
          <div className="flex items-center gap-3 px-3 py-3 border rounded-lg border-slate-300 focus-within:border-cyan-600">
            <Pencil className="w-4 h-4 text-slate-500 shrink-0" />
            <input
              type="text"
              value={khmerTitle}
              onChange={(e) => setKhmerTitle(e.target.value)}
              className="w-full text-sm outline-none bg-transparent text-slate-800"
              placeholder="បញ្ចូលឈ្មោះជាភាសាខ្មែរ"
            />
          </div>
        </div>

        {/* 2. Name in English* */}
        <div className="relative">
          <label className="absolute -top-2.5 left-3 bg-white px-1 text-xs font-medium text-slate-500">
            Name in English*
          </label>
          <div className="flex items-center gap-3 px-3 py-3 border rounded-lg border-slate-300 focus-within:border-cyan-600">
            <Pencil className="w-4 h-4 text-slate-500 shrink-0" />
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full text-sm outline-none bg-transparent text-slate-800"
              placeholder="Course title in English"
            />
          </div>
        </div>

        {/* 3. Major* (Category) */}
        <div className="relative">
          <label className="absolute -top-2.5 left-3 bg-white px-1 text-xs font-medium text-slate-500 z-10">
            Major*
          </label>
          <div className="relative flex items-center border rounded-lg border-slate-300 focus-within:border-cyan-600">
            <div className="absolute left-3 pointer-events-none text-slate-500">
              <Layers className="w-4 h-4" />
            </div>
            <select
              value={categoryId ?? ""}
              onChange={(e) =>
                setCategoryId(e.target.value ? Number(e.target.value) : undefined)
              }
              className="w-full py-3 pl-10 pr-10 text-sm outline-none bg-transparent appearance-none text-slate-800 cursor-pointer"
            >
              <option value="">Select Major</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
            <div className="absolute right-3 pointer-events-none text-slate-400">
              <ChevronDown className="w-4 h-4" />
            </div>
          </div>
        </div>

        {/* 4. Level* */}
        <div className="relative">
          <label className="absolute -top-2.5 left-3 bg-white px-1 text-xs font-medium text-slate-500 z-10">
            Level*
          </label>
          <div className="relative flex items-center border rounded-lg border-slate-300 focus-within:border-cyan-600">
            <div className="absolute left-3 pointer-events-none text-slate-500">
              <BarChart3 className="w-4 h-4" />
            </div>
            <select
              value={level}
              onChange={(e) => setLevel(e.target.value as CourseLevel)}
              className="w-full py-3 pl-10 pr-10 text-sm outline-none bg-transparent appearance-none text-slate-800 cursor-pointer"
            >
              <option value="BASIC">Beginner</option>
              <option value="INTERMEDIATE">Intermediate</option>
              <option value="ADVANCED">Advanced</option>
            </select>
            <div className="absolute right-3 pointer-events-none text-slate-400">
              <ChevronDown className="w-4 h-4" />
            </div>
          </div>
        </div>

        {/* 5. Description */}
        <div>
          <label className="block mb-2 text-sm font-semibold text-slate-600">
            Description
          </label>
          <textarea
            rows={5}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full p-4 text-sm leading-relaxed border rounded-lg outline-none border-slate-300 text-slate-800 focus:border-cyan-600 resize-none"
            placeholder="Course description..."
          />
        </div>
      </div>

      {/* Bottom Sticky Footer */}
      <div className="sticky bottom-0 flex items-center justify-end px-6 py-4 mt-8 bg-white border-t border-slate-200">
        <button
          type="submit"
          disabled={isSaving}
          className="flex items-center justify-center gap-2 rounded-lg bg-cyan-600 px-8 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-cyan-700 disabled:opacity-50"
        >
          {isSaving ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Updating...
            </>
          ) : (
            "Update"
          )}
        </button>
      </div>
    </form>
  );
}
