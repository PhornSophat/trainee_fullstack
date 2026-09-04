import type { CourseLevel } from "../../types/course";

export const levelStyles : Record<CourseLevel, string> = {
    BASIC: "bg-emerald-50 text-emerald-500",
    INTERMEDIATE: "bg-amber-50 text-amber-500",
    ADVANCED: "bg-rose-50 text-rose-500",
};