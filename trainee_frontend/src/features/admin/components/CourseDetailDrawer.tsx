import { useEffect, useState } from "react";
import {
    ArrowLeft,
    BookOpen,
    ClipboardList,
    Code2,
    Info,
    X,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useCoursesStore } from "@/store/courseStore";
import type { CourseCardItem } from "@/types/course";

import { CourseCoverBanner } from "./CourseCoverBanner";
import { GeneralDrawerContent } from "./general-drawer/GeneralDrawerContent";

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
    const [activeView, setActiveView] = useState<'main' | 'general'>('main');

    // Subscribe to store so updates (like cover image changes) are reflected immediately in real time across all views!
    const storeCourses = useCoursesStore((s) => s.courses);
    const activeCourse = storeCourses.find((c) => c.id === course?.id) || course;

    useEffect(() => {
        if (!isOpen) {
            setActiveView('main');
            return;
        }

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
            className={`fixed inset-0 z-50 overflow-hidden transition ${
                isOpen && activeCourse ? "pointer-events-auto" : "pointer-events-none"
            }`}
            aria-hidden={!isOpen || !activeCourse}
        >
            <button
                type="button"
                aria-label="Close course details"
                onClick={onClose}
                className={`absolute inset-0 bg-slate-900/35 transition-opacity duration-300 ${
                    isOpen && activeCourse ? "opacity-100" : "opacity-0"
                }`}
            />

            <aside
                role="dialog"
                aria-modal="true"
                aria-label={activeCourse ? `${activeCourse.title} details` : "Course details"}
                className={`absolute inset-y-0 right-0 flex w-full max-w-[600px] flex-col bg-white shadow-2xl transition-transform duration-300 ease-out ${
                    isOpen && activeCourse ? "translate-x-0" : "translate-x-full"
                }`}
            >
                {activeView === 'main' ? (
                    <>
                        <DrawerHeader isOpen={isOpen} onClose={onClose} title="Programs" />
                        {activeCourse && <CourseDrawerContent course={activeCourse} onOpenGeneral={() => setActiveView('general')} />}
                    </>
                ) : (
                    <>
                        <DrawerHeader isOpen={isOpen} onClose={() => setActiveView('main')} title="General" isBack />
                        {activeCourse && <GeneralDrawerContent course={activeCourse} />}
                    </>
                )}
            </aside>
        </div>
    );
}

function DrawerHeader({
    isOpen,
    onClose,
    title,
    isBack = false,
}: {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    isBack?: boolean;
}) {
    return (
        <header className="relative flex items-center justify-center h-16 p-4 border-b shrink-0 border-slate-300">
            {isOpen && (
                <button
                    type="button"
                    onClick={onClose}
                    aria-label={isBack ? "Back to programs" : "Close course details"}
                    className="absolute -left-4 top-3.5 flex h-9 w-9 -translate-x-1/2 items-center justify-center rounded-full bg-white text-[#60738d] shadow-md hover:text-slate-900 border border-slate-200 z-10"
                >
                    {isBack ? <ArrowLeft className="w-5 h-5 text-slate-600" /> : <X className="w-5 h-5" />}
                </button>
            )}
            <h2 className="font-kantumruy text-lg font-semibold text-[#60738d]">
                {title}
            </h2>
        </header>
    );
}

function CourseDrawerContent({
    course,
    onOpenGeneral,
}: {
    course: CourseCardItem;
    onOpenGeneral: () => void;
}) {
    return (
        <div className="flex-1 min-h-0 overflow-y-auto font-kantumruy">
            <CourseSummary course={course} />

            <section className="px-4 pb-5">
                <h3 className="mb-3 font-kantumruy text-sm font-semibold text-[#60738d]">
                    Manage
                </h3>
                <div className="flex gap-2">
                    <ManageTile icon={Info} label="General" onClick={onOpenGeneral} />
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

function ManageTile({
    icon: Icon,
    label,
    onClick,
}: {
    icon: LucideIcon;
    label: string;
    onClick?: () => void;
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            className="flex flex-col items-center gap-2 px-4 py-3 text-center transition-colors rounded-lg hover:bg-slate-50"
        >
            <span className="flex items-center justify-center rounded-lg h-14 w-14 bg-slate-200/50 text-cyan-600">
                <Icon className="w-10 h-10" />
            </span>
            <span className="text-xs font-kantumruy text-slate-600">{label}</span>
        </button>
    );
}

function CourseSummary({ course }: { course: CourseCardItem }) {
    return (
        <section className="px-4 pt-5 pb-6">
            <CourseCoverBanner course={course} className="mb-5" />

            <div className="flex items-start gap-4">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white text-[#60738d] shadow-sm">
                    <Code2 className="w-8 h-8" />
                </div>
                <div className="min-w-0 pt-1">
                    <h3 className="text-xl font-semibold truncate text-slate-800">
                        {course.title}
                    </h3>
                    <p className="mt-1 text-base truncate font-kantumruy text-slate-500">
                        {course.khmerTitle || "ជំនាញបច្ចេកវិទ្យាព័ត៌មាន"}
                    </p>
                </div>
            </div>
        </section>
    );
}
