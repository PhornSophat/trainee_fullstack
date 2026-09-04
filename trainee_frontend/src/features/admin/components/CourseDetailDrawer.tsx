import { useEffect } from "react";
import {
    BookOpen,
    CheckSquare,
    ClipboardList,
    Code2,
    FileText,
    Info,
    X,
} from "lucide-react";
import type { CourseCardItem } from "@/types/course";
import type { LucideIcon } from "lucide-react";

type CourseDetailDrawerProps = {
    course: CourseCardItem | null;
    isOpen: boolean;
    onClose: () => void;
};

export function CourseDetailDrawer({
    course,
    isOpen,
    onClose,
}: CourseDetailDrawerProps) {
    useEffect(() => {
        if (!isOpen) return;

        const closeOnEscape = (event: KeyboardEvent) => {
            if (event.key === "Escape") onClose();
        };

        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        document.addEventListener("keydown", closeOnEscape);

        return () => {
            document.body.style.overflow = previousOverflow;
            document.removeEventListener("keydown", closeOnEscape);
        };
    }, [isOpen, onClose]);

    return (
        <div
            className={`fixed inset-0 z-50 overflow-hidden transition ${isOpen && course ? "pointer-events-auto" : "pointer-events-none"}`}
            aria-hidden={!isOpen || !course}
        >
            <button
                type="button"
                aria-label="Close course details"
                onClick={onClose}
                className={`absolute inset-0 bg-slate-900/35 transition-opacity duration-300 ${isOpen && course ? "opacity-100" : "opacity-0"}`}
            />

            <aside
                role="dialog"
                aria-modal="true"
                aria-label={course ? `${course.title} details` : "Course details"}
                className={`absolute inset-y-0 right-0 flex w-full max-w-[600px] flex-col bg-white shadow-2xl transition-transform duration-300 ease-out ${isOpen && course ? "translate-x-0" : "translate-x-full"}`}
            >
                <DrawerHeader isOpen={isOpen} onClose={onClose} />

                {course && <CourseDrawerContent course={course} />}
            </aside>
        </div>
    );
}

function DrawerHeader({
    isOpen,
    onClose,
}: {
    isOpen: boolean;
    onClose: () => void;
}) {
    return (
        <header className="flex items-center justify-center h-16 p-4 border-b shrink-0 border-slate-200">
            <h2 className="font-kantumruy text-lg font-semibold text-[#60738d]">
                Programs
            </h2>
            {isOpen && (
                <button
                    type="button"
                    onClick={onClose}
                    aria-label="Close course details"
                    className="absolute -left-4 top-7 flex h-9 w-9 -translate-x-1/2 items-center justify-center rounded-l-full bg-white text-[#60738d] shadow-md hover:text-slate-900"
                >
                    <X className="w-5 h-5" />
                </button>
            )}
        </header>
    );
}

function CourseDrawerContent({ course }: { course: CourseCardItem }) {
    return (
        <div className="flex-1 min-h-0 overflow-y-auto">
            <CourseSummary course={course} />

            <section className="px-4 pb-5">
                <h3 className="mb-3 font-kantumruy text-sm font-semibold text-[#60738d]">
                    Manage
                </h3>
                <div className="flex">
                    <ManageTile icon={Info} label="General" />
                    <ManageTile icon={BookOpen} label="Curriculum" />
                    <ManageTile icon={ClipboardList} label="Homework" />
                </div>
            </section>

            <section className="px-4 pb-5">
                <h3 className="mb-3 font-kantumruy text-sm font-semibold text-[#60738d]">
                    Courses
                </h3>
                <div className="flex min-h-[210px] flex-col items-center justify-center rounded-lg bg-[#f0f4f9] px-6 text-center">
                    <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-[#e3eaf2] text-[#60738d]">
                        <Code2 className="h-7 w-7" />
                    </div>
                    <h4 className="text-base font-semibold font-kantumruy text-slate-800">
                        No courses yet
                    </h4>
                    <p className="mt-1 font-kantumruy text-sm text-[#8092aa]">
                        Create the first course for this program
                    </p>
                    <button
                        type="button"
                        className="flex items-center gap-2 px-5 py-2 mt-5 text-sm font-semibold text-white rounded-md bg-cyan-600 hover:bg-cyan-700"
                    >
                        <span className="text-lg leading-none">+</span>
                        Add
                    </button>
                </div>
            </section>
        </div>
    );
}

function CourseSummary({ course }: { course: CourseCardItem }) {
    return (
        <section className="px-4 pt-5 pb-6">
            <div className="relative mb-5 h-48 overflow-hidden rounded-md bg-[#e7f3f7]">
                {course.imageUrl ? (
                    <img
                        src={course.imageUrl}
                        alt=""
                        className="object-contain w-full h-full opacity-90"
                    />
                ) : (
                    <Code2 className="w-10 h-10 mx-auto mt-7 text-cyan-600" />
                )}
            </div>

            <div className="flex items-start gap-4">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white text-[#60738d] shadow-sm">
                    <Code2 className="w-8 h-8" />
                </div>

                <div className="min-w-0 pt-1">
                    <h3 className="text-xl font-semibold truncate text-slate-800">
                        {course.title}
                    </h3>
                    <p className="mt-1 truncate text-md font-kantumruy text-slate-500 ">
                        {course.khmerTitle || "ជំនាញបច្ចេកវិទ្យាព័ត៌មាន"}
                    </p>
                    <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-[#60738d]">
                        <span className={`rounded-full px-2.5 py-1 font-semibold ${course.level === "BASIC" ? "bg-emerald-100 text-emerald-600" : course.level === "INTERMEDIATE" ? "bg-amber-100 text-amber-600" : "bg-rose-100 text-rose-500"}`}>
                            {course.level === "BASIC" ? "Beginner" : course.level === "INTERMEDIATE" ? "Intermediate" : "Advanced"}
                        </span>
                        <span><BookOpen className="mr-1 inline h-3.5 w-3.5" />{course.lessons} lessons</span>
                        <span><CheckSquare className="mr-1 inline h-3.5 w-3.5" />{course.tasks} tasks</span>
                        <span><FileText className="mr-1 inline h-3.5 w-3.5" />{course.duration}</span>
                    </div>
                </div>
            </div>
        </section>
    );
}

function ManageTile({
    icon: Icon,
    label,
}: {
    icon: LucideIcon;
    label: string;
}) {
    return (
        <button
            type="button"
            className="flex flex-col items-center gap-2 px-4 py-3 text-center rounded-lg"
        >
            <span className="flex items-center justify-center rounded-lg h-14 w-14 bg-slate-200/50 text-cyan-600">
                <Icon className="w-10 h-10" />
            </span>
            <span className="text-xs font-kantumruy text-slate-600">{label}</span>
        </button>
    );
}
