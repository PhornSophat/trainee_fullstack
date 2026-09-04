import { useNavigate } from "react-router-dom";
import { useState } from "react";
import type { CourseCardItem } from "@/types/course";
import { levelStyles } from "@/components/courses/CourseCard.styles";
import { CourseCard } from "@/components/courses/CourseCard";
import { requestCourseAccess } from "@/services/courseService";
import { useCoursesStore } from "@/store/courseStore";
import { useAuthStore } from "@/store/useAuthStore";
import { setCourseApproval } from "@/services/courseService";
import type { ApprovalStatus } from "@/types/course";

type CourseOverviewProps = {
    course: CourseCardItem;
};

export const CourseOverview = ({ course }: CourseOverviewProps) => {
    const courses = useCoursesStore((s) => s.courses);
    const navigate = useNavigate();
    const [isRequesting, setIsRequesting] = useState(false);

    const handleRequest = async () => {
        setIsRequesting(true);
        try {
            const res = await requestCourseAccess(String(course.id), 'mock-user');
            useCoursesStore.getState().setCourseStatus(course.id, res.status);
            navigate(`/trainee/programs/${course.id}/learning`);
        } catch (err) {
            console.error('Request access failed:', err);
            setIsRequesting(false);
        }
    };

    const handleFavoriteChange = (selectedCourse: CourseCardItem) => {
        useCoursesStore.getState().toggleFavorite(selectedCourse.id);
    };

    const currentLevelStyle = levelStyles[course.level] ?? "bg-slate-50 text-slate-500"

    //for admin role
    const role = useAuthStore((s) => s.role);

    const handleApprove = async ( status: string ) => {
        await setCourseApproval(String(course.id), status);
        useCoursesStore.getState().setCourseStatus(course.id, status as ApprovalStatus);
        navigate(`/trainee/programs/${course.id}/learning`);
    }

    return (
        <div className="min-h-screen bg-[#EEF2F6] text-slate-800 text-base font-sans">

            {/* ================= HEADER ================= */}
            <section className="bg-[#0B1320] text-white py-8 px-6 sm:px-12">
                <div className="max-w-[1400px] mx-auto">
                    {/* Back Button */}
                    <button
                        type="button"
                        onClick={() => navigate(-1)}
                        className="mb-6 transition-colors text-slate-400 hover:text-white"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                    </button>

                    <div className="grid items-center grid-cols-1 gap-8 lg:grid-cols-12">

                        {/* Left Content */}
                        <div className="space-y-3 lg:col-span-8">
                            {/* Title */}
                            <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
                                {course.title || "API/Backend Developer"}
                            </h1>

                            {/* Khmer Subtitle / Description */}
                            <p className="text-base font-medium md:text-lg text-slate-300">
                                {course.khmerTitle}
                            </p>

                            {/* English Description */}
                            <p className="text-sm md:text-base text-slate-400">
                                {course.description || "API/Backend Developer is a practical program with guided lessons, hands-on homework, and support from mentors."}
                            </p>

                            {/* Badge, Rating & Metrics */}
                            <div className="flex flex-wrap items-center gap-3 pt-3 text-sm">
                                <span className={`px-2.5 py-1 font-semibold rounded text-xs tracking-wide ${currentLevelStyle}`}>
                                    {course.level}
                                </span>

                                <span className="text-base font-bold text-amber-400">
                                    {course.rating ?? "4.3"}
                                </span>

                                {/* Star Rating */}
                                <div className="flex text-sm text-amber-400">
                                    ★★★★★
                                </div>

                                <span className="text-slate-400">
                                    ({course.reviewCount ?? 3} reviews)
                                </span>

                                <span className="text-slate-500">•</span>

                                <span className="flex items-center gap-1.5 text-slate-300">
                                    <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 100 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                    </svg>
                                    {course.totalEnrollments ?? 11} Students 
                                </span>
                            </div>
                        </div>

                        {/* Right Side: Course Image Banner */}
                        <div className="lg:col-span-4">
                            <div className="relative flex items-center justify-center overflow-hidden border rounded-lg shadow-lg aspect-video bg-slate-800/60 border-slate-700/60">
                                {course.imageUrl ? (
                                    <img src={course.imageUrl} alt={course.title} className="object-cover w-full h-full" />
                                ) : (
                                    <div className="p-4 text-center">
                                        <svg className="mx-auto mb-2 text-teal-400 w-14 h-14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                        </svg>
                                    </div>
                                )}
                            </div>
                        </div>

                    </div>
                </div>
            </section>

            {/* ================= MAIN CONTENT LAYOUT ================= */}
            <main className="max-w-[1500px] mx-auto px-6 sm:px-12 py-8">
                <div className="grid items-start grid-cols-1 gap-8 lg:grid-cols-12">

                    {/* ================= LEFT MAIN SECTION (8 cols) ================= */}
                    <div className="space-y-6 lg:col-span-8">

                        {/* What you will learn */}
                        <section className="p-6 bg-white border rounded-md shadow-sm border-slate-200/60">
                            <h2 className="mb-4 text-base font-semibold md:text-lg text-slate-900">
                                What you will learn
                            </h2>
                            <div className="space-y-3 text-sm md:text-base text-slate-600">
                                {(course.skills ?? [
                                    "យល់ដឹងពីសញ្ញាណ និង workflow សម្រាប់ API/Backend Developer",
                                    "REST API design, validation, authentication, and permissions",
                                    "Database modeling, queries, transactions, and caching",
                                    "Backend testing, documentation, deployment, and monitoring",
                                    "អនុវត្តគម្រោង និងរបៀបធ្វើការជាក្រុមសម្រាប់ API/Backend Developer",
                                ]).map((skill, index) => (
                                    <div key={index} className="flex items-start gap-3">
                                        <svg className="w-5 h-5 text-slate-400 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                        </svg>
                                        <span>{skill}</span>
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* Key Lessons */}
                        <section className="p-6 bg-white border rounded-md shadow-sm border-slate-200/60">
                            <h2 className="text-base font-semibold md:text-lg text-slate-900">Key Lessons</h2>
                            <p className="mb-5 text-sm text-slate-400">Define the core foundation of digital system and mobile application development.</p>

                            <div className="space-y-5 text-sm md:text-base">
                                {(course.keyLessons ?? []).map((lesson, index) => (
                                    <div key={index} className="flex gap-4">
                                        <div className="flex items-center justify-center w-10 h-10 text-xs font-bold rounded bg-slate-100 shrink-0 text-slate-500">
                                            {lesson.code ?? index + 1}
                                        </div>
                                        <div>
                                            <h3 className="text-base font-semibold text-slate-800">{lesson.title}</h3>
                                            <p className="text-slate-500 text-xs md:text-sm mt-0.5">{lesson.description}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* Learning Resources */}
                        <section className="p-6 bg-white border rounded-md shadow-sm border-slate-200/60">
                            <h2 className="text-base font-semibold md:text-lg text-slate-900">Learning Resources</h2>
                            <p className="mb-5 text-sm text-slate-400">
                                Used during training or can be used in actual work practice in the future.
                            </p>

                            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                                <div className="flex items-center gap-3.5 p-3.5 border border-slate-200/80 rounded-md bg-white">
                                    <div className="flex items-center justify-center w-8 h-8 text-xs font-bold rounded bg-slate-100 text-slate-500 shrink-0">
                                        API
                                    </div>
                                    <span className="text-sm font-medium text-slate-700">API contract examples</span>
                                </div>

                                <div className="flex items-center gap-3.5 p-3.5 border border-slate-200/80 rounded-md bg-white">
                                    <div className="flex items-center justify-center w-8 h-8 rounded bg-slate-100 text-slate-500 shrink-0">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
                                        </svg>
                                    </div>
                                    <span className="text-sm font-medium text-slate-700">Database schema guide</span>
                                </div>

                                <div className="flex items-center gap-3.5 p-3.5 border border-slate-200/80 rounded-md bg-white">
                                    <div className="flex items-center justify-center w-8 h-8 text-orange-600 bg-orange-100 rounded shrink-0">
                                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                                        </svg>
                                    </div>
                                    <span className="text-sm font-medium text-slate-700">Postman collection</span>
                                </div>

                                <div className="flex items-center gap-3.5 p-3.5 border border-slate-200/80 rounded-md bg-white">
                                    <div className="flex items-center justify-center w-8 h-8 rounded bg-slate-100 text-slate-500 shrink-0">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                        </svg>
                                    </div>
                                    <span className="text-sm font-medium text-slate-700">Backend deployment checklist</span>
                                </div>
                            </div>
                        </section>

                        {/* Technologies */}
                        <section className="p-6 bg-white border shadow-sm rounded-xl border-slate-200/70">
                            <div className="mb-5">
                                <h2 className="text-lg font-bold tracking-tight text-slate-900">Technologies</h2>
                                <p className="mt-1 text-sm text-slate-500">
                                    Languages, frameworks, and tools taught throughout this course.
                                </p>
                            </div>

                            <div className="flex flex-wrap items-center justify-center gap-3">
                                {(course.technologies || []).map((tech) => (
                                    <div key={tech.name} className="relative group">
                                        <div className="flex items-center justify-center w-[72px] h-[72px] p-2 rounded-xl bg-slate-50 border border-slate-200/70 shadow-2xs hover:bg-white hover:border-blue-500/40 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
                                            <img
                                                src={tech.icon}
                                                alt={tech.name}
                                                className="object-contain w-full h-full transition-transform duration-200 filter drop-shadow-xs group-hover:scale-105"
                                            />
                                        </div>

                                        {/* Tooltip */}
                                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2.5 py-1 bg-slate-900 text-white text-[11px] font-medium rounded-md shadow-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-all duration-150 pointer-events-none z-20 translate-y-1 group-hover:translate-y-0">
                                            {tech.name}
                                            <div className="absolute -translate-x-1/2 border-4 border-transparent top-full left-1/2 border-t-slate-900" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* Q&A Accordion Section */}
                        <section className="p-6 bg-white border rounded-md shadow-sm border-slate-200/60">
                            <h2 className="mb-4 text-base font-semibold md:text-lg text-slate-900">Q&A</h2>

                            <div className="space-y-3">
                                {(course.faqs ?? []).map((faq, i) => (
                                    <div key={i} className="flex items-center justify-between p-3.5 border border-slate-100 rounded bg-slate-50/50 hover:bg-slate-50 cursor-pointer">
                                        <span className="text-sm font-medium text-slate-700">{faq.question}</span>
                                        <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                                        </svg>
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* Other Courses Section */}
                        <section className="p-6 bg-white border rounded-md shadow-sm border-slate-200/60">
                            <h2 className="mb-5 text-base font-semibold md:text-lg text-slate-900">
                                Other Courses
                            </h2>

                            <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
                                {courses
                                    // 1. Exclude the course the user is currently looking at
                                    .filter((c) => String(c.id) !== String(course.id))
                                    // 2. Limit display to a few items (e.g., top 3)
                                    .slice(0, 3)
                                    .map((otherCourse) => (
                                        <CourseCard
                                            key={otherCourse.id}
                                            course={otherCourse}
                                            onClick={(selectedCourse) => {
                    navigate(`/trainee/programs/${selectedCourse.id}`);
                }}
                                            onFavoriteChange={handleFavoriteChange}
                                        />
                                    ))}
                            </div>
                        </section>

                        {/* Banner Section */}
                        <section className="flex items-center justify-between p-6 bg-white border rounded-md shadow-sm border-slate-200/60">
                            <div>
                                <h2 className="text-sm font-bold text-slate-800">Not enough information?</h2>
                                <p className="mt-1 text-xs md:text-sm text-slate-400">You can request more information from our team.</p>
                                <button
                                    type="button"
                                    className="flex items-center gap-2 px-4 py-2 mt-4 text-xs font-medium transition-colors border rounded border-slate-300 text-slate-700 md:text-sm hover:bg-slate-50"
                                >
                                    <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                    </svg>
                                    Chat with team
                                </button>
                            </div>
                            <div className="hidden text-5xl text-slate-300 sm:block">
                                ❓
                            </div>
                        </section>

                    </div>


                    {/* ================= RIGHT SIDEBAR (4 cols) ================= */}
                    <aside className="absolute space-y-6 lg:col-span-4 lg:sticky lg:top-16 ">

                        {/* Top Card: Course Specs & Actions */}
                        <div className="overflow-hidden bg-white border rounded-md shadow-sm border-slate-200/60">

                            <div className="p-5 space-y-5">
                                <h3 className="text-sm font-bold text-slate-800">
                                    This course includes:
                                </h3>

                                <div className="space-y-3 text-xs md:text-sm text-slate-600">
                                    <div className="flex items-center gap-3">
                                        <svg className="w-4 h-4 text-slate-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                        </svg>
                                        <span>{course.lessons ?? 6} Lessons</span>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <svg className="w-4 h-4 text-slate-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                        </svg>
                                        <span>6 Videos</span>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <svg className="w-4 h-4 text-slate-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                        </svg>
                                        <span>{course.quizzes ?? 9} Homeworks</span>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <svg className="w-4 h-4 text-slate-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                                        </svg>
                                        <span>4 Resources</span>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <svg className="w-4 h-4 text-slate-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                        </svg>
                                        <span>0 Support Mentors</span>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <svg className="w-4 h-4 text-slate-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                                        </svg>
                                        <span>Certificate of Completion</span>
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="space-y-2.5 pt-2">
                                    {role === 'admin' && course.approvalStatus === 'PENDING' && (
                                        <div className="flex gap-2">
                                            <button onClick={() => handleApprove('APPROVED')}
                                            className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded">
                                            Approve
                                            </button>
                                            <button onClick={() => handleApprove('REJECTED')}
                                            className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded">
                                            Reject
                                            </button>
                                        </div>
                                    )}
                                    {course.approvalStatus === 'PENDING' ? (
                                        <button
                                            type="button"
                                            disabled
                                            className="w-full py-2.5 bg-slate-300 text-slate-600 text-xs md:text-sm font-semibold rounded flex items-center justify-center gap-2 cursor-not-allowed"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            Waiting for approval…
                                        </button>  
                                    ) : (
                                        <button
                                            type="button"
                                            onClick={handleRequest}
                                            disabled={isRequesting}
                                            className="w-full py-2.5 bg-[#0088A8] hover:bg-[#007793] text-white text-xs md:text-sm font-semibold rounded transition-colors flex items-center justify-center gap-2 shadow-sm"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                            </svg>
                                            {isRequesting ? 'Sending request…' : 'Register course'}
                                        </button>
                                    )}

                                    <button
                                        type="button"
                                        className="w-full py-2.5 border border-slate-200 text-slate-700 text-xs md:text-sm font-medium rounded hover:bg-slate-50 transition-colors flex items-center justify-center gap-2"
                                    >
                                        <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                        </svg>
                                        Download Document
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Bottom Card: Consultation */}
                        <div className="p-5 space-y-4 text-center bg-white border rounded-md shadow-sm border-slate-200/60">
                            <h3 className="text-sm font-bold text-slate-800">
                                Should I study this course?
                            </h3>
                            <p className="text-xs md:text-sm text-slate-400">
                                If you are unsure, consult with us.
                            </p>

                            <div className="flex justify-center py-2">
                                <svg className="w-20 h-20 text-teal-600" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>

                            <button
                                type="button"
                                className="w-full py-2.5 border border-slate-200 text-slate-700 text-xs md:text-sm font-medium rounded hover:bg-slate-50 transition-colors flex items-center justify-center gap-2"
                            >
                                <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                                </svg>
                                Request consultation
                            </button>
                        </div>

                    </aside>

                </div>
            </main>

        </div>
    );
};