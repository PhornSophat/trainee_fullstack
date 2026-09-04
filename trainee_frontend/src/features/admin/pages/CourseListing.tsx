import { useEffect, useMemo, useState } from "react";
import {
    BookOpen,
    BarChart3,
    CheckSquare,
    ChevronDown,
    ChevronRight,
    Grid2X2,
    List,
    Plus,
    Search,
    SlidersHorizontal,
    Star,
    ArrowUpDown,
    Code2,
} from "lucide-react";
import { useCoursesStore } from "@/store/courseStore";
import { CourseDetailDrawer } from "@/features/admin/components/CourseDetailDrawer";
import type {
    CourseCardItem,
    CourseLevel,
} from "@/types/course";

const levelLabels: Record<CourseLevel, string> = {
    BASIC: "Beginner",
    INTERMEDIATE: "Intermediate",
    ADVANCED: "Advanced",
};

const levelStyles: Record<CourseLevel, string> = {
    BASIC: "bg-emerald-100 text-emerald-600",
    INTERMEDIATE: "bg-amber-100 text-amber-600",
    ADVANCED: "bg-rose-100 text-rose-500",
};

export function CourseListing() {
    const courses = useCoursesStore((state) => state.courses);
    const loading = useCoursesStore((state) => state.loading);
    const fetchCourses = useCoursesStore((state) => state.fetchCourses);

    const [search, setSearch] = useState("");
    const [level, setLevel] = useState<CourseLevel | "ALL">("ALL");
    const [category, setCategory] = useState("ALL");
    const [categorySearch, setCategorySearch] = useState("");
    const [view, setView] = useState<"list" | "grid">("list");
    const [openFilter, setOpenFilter] = useState<"level" | "category" | null>(null);
    const [showFilters, setShowFilters] = useState(false);
    const [selectedCourse, setSelectedCourse] = useState<CourseCardItem | null>(null);

    const categoryOptions = ["Web", "Mobile", "DevOps", "Cyber", "UX/UI"];

    useEffect(() => {
        fetchCourses();
    }, [fetchCourses]);

    const filteredCourses = useMemo(() => {
        const keyword = search.trim().toLowerCase();

        return courses.filter((course) => {
            const searchableText = `
        ${course.title}
        ${course.khmerTitle ?? ""}
      `.toLowerCase();

            const matchesSearch = searchableText.includes(keyword);
            const matchesLevel =
                level === "ALL" || course.level === level;

            return matchesSearch && matchesLevel;
        });
    }, [courses, search, level]);

    if (loading && courses.length === 0) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-slate-100 font-kantumruy text-slate-500">
                កំពុងផ្ទុកវគ្គសិក្សា...
            </div>
        );
    }

    return (
        <div className="h-[calc(100dvh-3.5rem)] overflow-hidden bg-[#eef5fb] p-3 font-kantumruy">
            <div className="h-full max-w-full mx-auto">
                <section className="flex flex-col h-full overflow-hidden bg-white border rounded-lg shadow-sm border-slate-200">
                    <div className="grid min-h-[72px] grid-cols-1 items-center gap-3 border-b border-slate-200 px-4 py-3 md:grid-cols-3 md:px-5">
                        <div className="flex items-center gap-3 text-sm text-[#60738d]">
                            <Code2 className="h-[24px] w-[24px]" aria-hidden="true" />
                            <ChevronRight className="w-6 h-6 text-slate-600" aria-hidden="true" />
                            <span className="font-bold">Courses</span>
                        </div>

                        <div className="flex justify-start md:justify-center">
                            <div className="flex rounded-lg bg-[#edf3f9] p-1">
                                <button
                                    type="button"
                                    title="List view"
                                    aria-label="List view"
                                    onClick={() => setView("list")}
                                    className={`rounded-md px-4 py-2 ${view === "list" ? "bg-white text-cyan-600 shadow-sm" : "text-[#60738d]"}`}
                                >
                                    <List className="w-5 h-5" />
                                </button>

                                <button
                                    type="button"
                                    title="Grid view"
                                    aria-label="Grid view"
                                    onClick={() => setView("grid")}
                                    className={`rounded-md px-4 py-2 ${view === "grid" ? "bg-white text-cyan-600 shadow-sm" : "text-[#60738d]"}`}
                                >
                                    <Grid2X2 className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        <div className="flex items-center justify-start gap-2 md:justify-end">
                            <div className="flex items-center h-10 px-3 border rounded-lg border-slate-200 focus-within:border-cyan-500">
                                <Search className="h-5 w-5 text-[#60738d]" />

                                <input
                                    value={search}
                                    onChange={(event) => setSearch(event.target.value)}
                                    placeholder="Name..."
                                    className="w-32 px-2 text-sm bg-transparent outline-none placeholder:text-slate-400 sm:w-44"
                                />
                            </div>

                            <button
                                type="button"
                                title="Filter courses"
                                aria-label="Filter courses"
                                aria-expanded={showFilters}
                                onClick={() => {
                                    setShowFilters((isVisible) => !isVisible);
                                    setOpenFilter(null);
                                }}
                                className={`rounded-lg border p-2.5 transition-colors ${showFilters
                                    ? "border-cyan-200 bg-cyan-50 text-cyan-600"
                                    : "border-slate-200 text-[#60738d] hover:bg-slate-50"
                                    }`}
                            >
                                <SlidersHorizontal className="w-5 h-5" />
                            </button>

                            <button
                                type="button"
                                title="Create course"
                                aria-label="Create course"
                                className="rounded-lg border border-slate-200 p-2.5 text-[#60738d] hover:bg-slate-50"
                            >
                                <Plus className="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                    {showFilters && (
                        <div className="flex flex-wrap items-center justify-end gap-2 border-b border-slate-200 px-4 py-2.5">
                            <button
                                type="button"
                                title="Sort courses"
                                aria-label="Sort courses"
                                className="flex h-10 items-center justify-center rounded-lg border border-slate-200 px-3 text-[#60738d] hover:bg-slate-50"
                            >
                                <ArrowUpDown className="w-5 h-5" />
                            </button>

                            <div className="relative">
                                <button
                                    type="button"
                                    onClick={() => setOpenFilter(openFilter === "level" ? null : "level")}
                                    aria-expanded={openFilter === "level"}
                                    className={`flex h-10 items-center gap-2 rounded-lg border px-3 text-sm transition-colors ${openFilter === "level"
                                        ? "border-cyan-500 bg-cyan-50 text-cyan-600"
                                        : "border-slate-200 text-[#60738d] hover:bg-slate-50"
                                        }`}
                                >
                                    <BarChart3 className="w-5 h-5" />
                                    <span>{level === "ALL" ? "Level" : levelLabels[level]}</span>
                                    <ChevronDown className={`h-4 w-4 transition-transform ${openFilter === "level" ? "rotate-180" : ""}`} />
                                </button>

                                {openFilter === "level" && (
                                    <div className="absolute right-0 z-30 w-40 py-2 mt-2 overflow-hidden bg-white border rounded-md shadow-lg border-slate-100">
                                        {(["BASIC", "INTERMEDIATE", "ADVANCED"] as CourseLevel[]).map((option) => (
                                            <button
                                                key={option}
                                                type="button"
                                                onClick={() => {
                                                    setLevel(option);
                                                    setOpenFilter(null);
                                                }}
                                                className={`block w-full px-4 py-2 text-left text-sm hover:bg-slate-50 ${option === "BASIC"
                                                    ? "text-emerald-500"
                                                    : option === "INTERMEDIATE"
                                                        ? "text-amber-500"
                                                        : "text-rose-500"
                                                    }`}
                                            >
                                                {levelLabels[option]}
                                            </button>
                                        ))}
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setLevel("ALL");
                                                setOpenFilter(null);
                                            }}
                                            className="block w-full px-4 py-2 text-sm text-left text-slate-500 hover:bg-slate-50"
                                        >
                                            All levels
                                        </button>
                                    </div>
                                )}
                            </div>

                            <div className="relative">
                                <button
                                    type="button"
                                    onClick={() => setOpenFilter(openFilter === "category" ? null : "category")}
                                    aria-expanded={openFilter === "category"}
                                    className={`flex h-10 items-center gap-2 rounded-lg border px-3 text-sm transition-colors ${openFilter === "category"
                                        ? "border-cyan-500 bg-cyan-50 text-cyan-600"
                                        : "border-slate-200 text-[#60738d] hover:bg-slate-50"
                                        }`}
                                >
                                    <BarChart3 className="w-5 h-5" />
                                    <span>{category === "ALL" ? "Category" : category}</span>
                                    <ChevronDown className={`h-4 w-4 transition-transform ${openFilter === "category" ? "rotate-180" : ""}`} />
                                </button>

                                {openFilter === "category" && (
                                    <div className="absolute right-0 z-30 mt-2 w-[190px] overflow-hidden rounded-md border border-slate-200 bg-white shadow-[0_12px_30px_rgba(15,23,42,0.14)]">
                                        <div className="px-3 py-2 border-b border-slate-100">
                                            <div className="flex items-center gap-2 px-2 bg-white border rounded-md h-9 border-slate-200 text-slate-400 focus-within:border-cyan-500">
                                                <Search className="w-4 h-4" />
                                                <input
                                                    value={categorySearch}
                                                    onChange={(event) => setCategorySearch(event.target.value)}
                                                    placeholder="Search..."
                                                    className="w-full text-sm bg-transparent outline-none placeholder:text-slate-400"
                                                />
                                            </div>
                                        </div>

                                        <div className="py-1 overflow-y-auto max-h-64">
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setCategory("ALL");
                                                    setOpenFilter(null);
                                                }}
                                                className="block w-full px-4 py-3 text-sm text-left transition-colors text-slate-600 hover:bg-slate-50"
                                            >
                                                All categories
                                            </button>

                                            {categoryOptions
                                                .filter((option) =>
                                                    option.toLowerCase().includes(categorySearch.trim().toLowerCase())
                                                )
                                                .map((option) => (
                                                    <button
                                                        key={option}
                                                        type="button"
                                                        onClick={() => {
                                                            setCategory(option);
                                                            setOpenFilter(null);
                                                        }}
                                                        className="block w-full px-4 py-3 text-sm text-left transition-colors text-slate-700 hover:bg-slate-50"
                                                    >
                                                        {option}
                                                    </button>
                                                ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Course table or grid */}
                    <div className="flex flex-col flex-1 min-h-0 overflow-hidden">
                        {view === "list" ? (
                            <CourseTable courses={filteredCourses} onSelect={setSelectedCourse} />
                        ) : (
                            <CourseGrid courses={filteredCourses} onSelect={setSelectedCourse} />
                        )}
                    </div>

                    <footer className="px-4 py-3 text-xs text-right border-t border-slate-200 text-slate-500">
                        បង្ហាញ {filteredCourses.length} ក្នុងចំណោម{" "}
                        {courses.length} វគ្គសិក្សា
                    </footer>
                </section>
                <CourseDetailDrawer
                    course={selectedCourse}
                    isOpen={selectedCourse !== null}
                    onClose={() => setSelectedCourse(null)}
                />
            </div>
        </div>
    );
}

function CourseTable({
    courses,
    onSelect,
}: {
    courses: CourseCardItem[];
    onSelect: (course: CourseCardItem) => void;
}) {
    if (courses.length === 0) {
        return (
            <div className="p-12 text-sm text-center text-slate-500">
                រកមិនឃើញវគ្គសិក្សាទេ
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full min-h-0 overflow-x-auto">
            <table className="w-full min-w-[1150px] table-fixed">
                <colgroup>
                    <col className="w-14" />
                    <col className="w-[330px]" />
                    <col />
                    <col />
                    <col />
                    <col />
                    <col />
                    <col />
                </colgroup>
                <thead>
                    <tr className="text-xs text-left uppercase border-b border-slate-200 text-slate-500">
                        <th className="px-4 py-3 bg-white border-b border-slate-200">No.</th>
                        <th className="px-4 py-3 bg-white border-b border-slate-200">Name</th>
                        <th className="px-4 py-3 bg-white border-b border-slate-200">Level</th>
                        <th className="px-4 py-3 bg-white border-b border-slate-200">Lessons</th>
                        <th className="px-4 py-3 bg-white border-b border-slate-200">Tasks</th>
                        <th className="px-4 py-3 bg-white border-b border-slate-200">Rating</th>
                        <th className="px-4 py-3 bg-white border-b border-slate-200">Instructors</th>
                        <th className="px-4 py-3 bg-white border-b border-slate-200">Duration</th>
                    </tr>
                </thead>
            </table>

            <div className="flex-1 min-h-0 overflow-y-auto">
                <table className="w-full min-w-[1150px] table-fixed">
                    <colgroup>
                        <col className="w-14" />
                        <col className="w-[330px]" />
                        <col />
                        <col />
                        <col />
                        <col />
                        <col />
                        <col />
                    </colgroup>
                    <tbody>
                        {courses.map((course, index) => (
                            <CourseRow
                                key={course.id}
                                course={course}
                                index={index}
                                onSelect={onSelect}
                            />
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

function CourseRow({
    course,
    index,
    onSelect,
}: {
    course: CourseCardItem;
    index: number;
    onSelect: (course: CourseCardItem) => void;
}) {
    const filledStars = Math.round(course.rating);

    return (
        <tr
            className="cursor-pointer text-sm border-b border-slate-100 hover:bg-slate-50"
            onClick={() => onSelect(course)}
            tabIndex={0}
            onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    onSelect(course);
                }
            }}
        >
            <td className="px-4 py-3 text-slate-400">
                {index + 1}
            </td>

            <td className="px-4 py-3">
                <div className="flex items-center gap-3">
                    <img
                        src={course.imageUrl}
                        alt=""
                        className="object-cover w-10 h-10 rounded-md"
                    />

                    <div className="min-w-0">
                        <p className="font-medium truncate text-slate-800">
                            {course.title}
                        </p>

                        <p className="text-xs truncate text-slate-400">
                            {course.khmerTitle ||
                                "ជំនាញបច្ចេកវិទ្យាព័ត៌មាន"}
                        </p>
                    </div>
                </div>
            </td>

            <td className="px-4 py-3">
                <span
                    className={`rounded-full px-3 py-1 text-xs font-medium ${levelStyles[course.level]}`}
                >
                    {levelLabels[course.level]}
                </span>
            </td>

            <td className="px-4 py-3 text-slate-500">
                <span className="flex items-center gap-1">
                    <BookOpen className="w-4 h-4" />
                    {course.lessons}
                </span>
            </td>

            <td className="px-4 py-3 text-slate-500">
                <span className="flex items-center gap-1">
                    <CheckSquare className="w-4 h-4" />
                    {course.tasks}
                </span>
            </td>

            <td className="px-4 py-3">
                <div className="flex items-center gap-1 whitespace-nowrap">
                    <span className="text-amber-500">
                        {course.rating.toFixed(1)}
                    </span>

                    <span className="flex">
                        {Array.from({ length: 5 }, (_, starIndex) => (
                            <Star
                                key={starIndex}
                                className={`h-4 w-4 ${starIndex < filledStars
                                    ? "text-amber-500"
                                    : "text-slate-300"
                                    }`}
                                fill={
                                    starIndex < filledStars
                                        ? "currentColor"
                                        : "none"
                                }
                            />
                        ))}
                    </span>

                    <span className="text-xs text-slate-400">
                        ({course.reviewCount})
                    </span>
                </div>
            </td>

            <td className="px-4 py-3">
                <div className="flex -space-x-2">
                    {course.instructors.slice(0, 4).map((instructor) =>
                        instructor.avatarUrl ? (
                            <img
                                key={instructor.id}
                                src={instructor.avatarUrl}
                                alt={instructor.name}
                                title={instructor.name}
                                className="object-cover border-2 border-white rounded-full h-7 w-7"
                            />
                        ) : (
                            <span
                                key={instructor.id}
                                title={instructor.name}
                                className="flex items-center justify-center text-xs text-white border-2 border-white rounded-full h-7 w-7 bg-slate-500"
                            >
                                {instructor.name.charAt(0)}
                            </span>
                        ),
                    )}
                </div>
            </td>

            <td className="px-4 py-3 text-slate-500">
                {course.duration}
            </td>
        </tr>
    );
}

function CourseGrid({
    courses,
    onSelect,
}: {
    courses: CourseCardItem[];
    onSelect: (course: CourseCardItem) => void;
}) {
    if (courses.length === 0) {
        return (
            <div className="p-12 text-sm text-center text-slate-500">
                រកមិនឃើញវគ្គសិក្សាទេ
            </div>
        );
    }

    return (
        <div className="grid h-full min-h-0 gap-4 p-4 overflow-y-auto sm:grid-cols-2 xl:grid-cols-3">
            {courses.map((course) => (
                <article
                    key={course.id}
                    className="cursor-pointer border border-slate-200 p-4 hover:border-cyan-200 hover:shadow-sm"
                    onClick={() => onSelect(course)}
                    tabIndex={0}
                    onKeyDown={(event) => {
                        if (event.key === "Enter" || event.key === " ") {
                            event.preventDefault();
                            onSelect(course);
                        }
                    }}
                >
                    <div className="flex gap-3">
                        <img
                            src={course.imageUrl}
                            alt=""
                            className="object-cover w-16 h-16 rounded-md"
                        />

                        <div className="min-w-0">
                            <h2 className="font-semibold truncate text-slate-800">
                                {course.title}
                            </h2>

                            <p className="mt-1 text-xs text-slate-400">
                                {course.khmerTitle ||
                                    "ជំនាញបច្ចេកវិទ្យាព័ត៌មាន"}
                            </p>

                            <span
                                className={`mt-2 inline-block rounded-full px-2 py-1 text-xs ${levelStyles[course.level]}`}
                            >
                                {levelLabels[course.level]}
                            </span>
                        </div>
                    </div>

                    <div className="flex justify-between mt-4 text-xs text-slate-500">
                        <span>{course.lessons} lessons</span>
                        <span>{course.tasks} tasks</span>
                        <span>{course.duration}</span>
                    </div>
                </article>
            ))}
        </div>
    );
}