import { Pencil, Layers, BarChart3, AlignLeft } from "lucide-react";
import { InfoRow } from "./InfoRow";
import type { CourseCardItem } from "@/types/course";

export function GeneralInfoSection({ course }: { course: CourseCardItem }) {
  return (
    <section className="px-5 py-4 border-b border-slate-100 font-kantumruy">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-bold text-[#60738d]">General information</h3>
        <button type="button" className="p-1 text-slate-400 hover:text-slate-600">
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
        <InfoRow icon={Layers} label="Major" value="API" />
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
