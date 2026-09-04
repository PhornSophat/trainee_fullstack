import { useEffect, useState, type JSX } from "react";
import { useNavigate, useParams } from "react-router-dom";
import type { Homework, HomeworkTask, Chapter, TabType } from "@/types/course";
import { CurriculumTable } from "@/components/courses/CurriculumTable";
import { getCourseDetails } from "@/services/courseService";
import { mockCourseData } from "@/data/courses.mock";
import { getHomeworks } from "@/services/homeworkService";
import { HomeworkTable } from "@/components/courses/HomeworkTable";
import { HomeworkTaskDialog } from "@/components/courses/HomeworkTaskDialog";

type CourseLearningProps = {
  courseId?: string | number;
};

export function CourseLearning({ courseId: propCourseId }: CourseLearningProps) {
  const navigate = useNavigate();
  const { courseId: paramCourseId } = useParams();

  // Resolve effective course ID from props or URL params
  const activeCourseId = propCourseId || paramCourseId || "1";

  const [activeTab, setActiveTab] = useState<TabType>("Curriculum");
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [chaptersLoading, setChaptersLoading] = useState(true);

  useEffect(() => {
    setChaptersLoading(true);
    getCourseDetails(activeCourseId)
      .then((data) => setChapters(data))
      .catch(() => setChapters([]))
      .finally(() => setChaptersLoading(false));
  }, [activeCourseId]);

  // Handler for navigating to video learning view
  const handleStartLearning = (lessonId?: string | number) => {
    const query = lessonId ? `?lessonId=${lessonId}` : "";
    navigate(`/trainee/programs/${activeCourseId}/learning${query}`);
  };

  const [ homeworks, setHomeworks ] = useState<Homework[]>([]);
  const [ isHomeworkLoading, setIsHomeworkLoading ] = useState(true);
  const [ selectedTask, setSelectedTask ] = useState<HomeworkTask | null>(null);
  const courses = mockCourseData;
  const instructorName = courses.find(
    (course) => String(course.id) === String(activeCourseId)
  )?.instructors[0]?.name;

  useEffect(() => {
    if( activeTab !== "Homework" ) return;

    let isMounted = true;

    getHomeworks(activeCourseId)
      .then((data) => {
      if( isMounted ) setHomeworks(data);
    })
      .finally(() => {
        if( isMounted ) setIsHomeworkLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [activeTab, activeCourseId])
  
  const sidebarItems: { id: TabType; label: string; icon: JSX.Element }[] = [
    {
      id: "General",
      label: "General",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      id: "Curriculum",
      label: "Curriculum",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      ),
    },
    {
      id: "Session",
      label: "Session",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
    },
    {
      id: "Homework",
      label: "Homework",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
        </svg>
      ),
    },
    {
      id: "Technical Support",
      label: "Technical Support",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ),
    },
  ];

  return (
    <div className="p-4 h-[calc(100vh-64px)] w-full overflow-hidden font-sans box-border">
      <div className="flex flex-col h-full overflow-hidden bg-white border shadow-xs border-slate-200 rounded-xl">

        {/* Course Header */}
        <header className="z-10 flex items-center justify-between px-4 bg-white border-b h-14 border-slate-200 shrink-0">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="p-1.5 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </button>
            <h1 className="text-base font-semibold truncate text-slate-900">
              API/Backend Developer
            </h1>
          </div>

          <div className="flex items-center gap-2">
            {/* Quick action button to enter Video Player mode */}
            <button
              type="button"
              onClick={() => handleStartLearning()}
              className="px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-500 transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
              </svg>
              <span>Continue Watching</span>
            </button>

            <button type="button" className="p-1.5 text-slate-500 hover:text-slate-800 rounded-lg hover:bg-slate-100 cursor-pointer">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
              </svg>
            </button>
          </div>
        </header>

        {/* Body Container */}
        <div className="flex flex-1 min-h-0">

          {/* Sidebar Navigation */}
          <aside className="flex flex-col h-full gap-1 p-3 overflow-y-auto bg-white border-r w-60 border-slate-200 shrink-0">
            {sidebarItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer ${isActive
                      ? "bg-slate-100 text-slate-900 font-semibold"
                      : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
                    }`}
                >
                  <span className={isActive ? "text-slate-900" : "text-slate-400"}>
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </button>
              );
            })}
          </aside>

          {/* Main Content Area */}
          <main className="flex-1 h-full p-2 overflow-y-auto md:p-4 bg-slate-50/50">
            <div className="max-w-full mx-auto overflow-hidden bg-white border border-slate-200/80 rounded-xl shadow-2xs">

              {/* Inner Breadcrumb */}
              <div className="sticky top-0 z-10 flex items-center justify-between p-4 bg-white border-b border-slate-200">
                <div className="flex items-center gap-2 text-sm font-medium text-slate-600">
                  <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                  <span>/</span>
                  <span>{activeTab}</span>
                </div>
              </div>

              { activeTab === "Homework" ? (
                  <HomeworkTable 
                    homeworks={homeworks}
                    isLoading={isHomeworkLoading}
                    onTaskClick={setSelectedTask}
                  />
                   
                ) : (
                  <CurriculumTable
                    activeTab={activeTab}
                    chapters={chapters}
                    isLoading={chaptersLoading}
                    onLessonClick={(lessonId) => handleStartLearning(lessonId)}
                  />
                )
              }

              {
                selectedTask && (
                  <HomeworkTaskDialog
                    task={selectedTask}
                    instructorName={instructorName}
                    onClose={() => setSelectedTask(null)}
                  />
                )
              }


            </div>
          </main>
        </div>
      </div>
    </div>
  );
}