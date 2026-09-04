import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import type { Chapter, Lesson } from "@/types/course";
import { getCourseDetails } from "@/services/courseService";
import { apiClient } from "@/services/apiClient";
import { ErrorDisplay } from "@/components/error-display/ErrorDisplay";
import MuxPlayer from "@mux/mux-player-react";

type DetailTab = "overview" | "resources" | "notes";

export function CourseVideoLearning() {
  // ── Refs ──────────────────────────────────────────────────────────────
  const muxPlayerRef = useRef<any>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  // ── Navigation & Params ──────────────────────────────────────────────
  const navigate = useNavigate();
  const { courseId } = useParams<{ courseId: string }>();
  const location = useLocation();

  // ── State ─────────────────────────────────────────────────────────────
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);
  const [activeTab, setActiveTab] = useState<DetailTab>("overview");
  const [expandedChapterIds, setExpandedChapterIds] = useState<(string | number)[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Progress tracking refs (to avoid stale closures)
  const lastSavedProgressRef = useRef<number>(0);

  // ── 1. FETCH CURRICULUM (WHAT/WHY/HOW) ────────────────────────────────
  // WHAT: Fetch chapters + lessons for this course
  // WHY: Replace MOCK_COURSE_DETAILS with real backend data
  // HOW: useEffect with courseId dep; calls getCourseDetails (GET /courses/:id/details)
  useEffect(() => {
    if (!courseId) return;
    setLoading(true);
    getCourseDetails(courseId)
      .then((data) => {
        setChapters(data);
        // Auto-select first lesson if none selected
        const firstLesson = data[0]?.lessons?.[0];
        if (firstLesson && !activeLesson) setActiveLesson(firstLesson);
        // Also check for lessonId from URL query param
        const lessonIdFromQuery = location.search ? new URLSearchParams(location.search).get('lessonId') : undefined;
        if (lessonIdFromQuery) {
          const foundLesson = data[0]?.lessons?.find((l) => l.id === lessonIdFromQuery);
          if (foundLesson && !activeLesson?.id) {
            setActiveLesson(foundLesson);
          }
        }
      })
      .catch((err) => {
        console.error("Failed to load curriculum:", err);
        setError("Failed to load course curriculum.");
      })
      .finally(() => setLoading(false));
  }, [courseId, location]);

  // ── 2. AUTO-EXPAND CHAPTER CONTAINING ACTIVE LESSON ──────────────────
  useEffect(() => {
    if (!activeLesson) return;
    chapters.forEach((ch) => {
      if (ch.lessons.some((l) => l.id === activeLesson.id)) {
        setExpandedChapterIds((prev) =>
          prev.includes(ch.id) ? prev : [...prev, ch.id]
        );
      }
    });
  }, [activeLesson, chapters]);

  // ── 3. AUTO-EXPAND ON FIRST LOAD ──────────────────────────────────────
  useEffect(() => {
    if (chapters.length && !expandedChapterIds.length) {
      const firstCh = chapters[0];
      setExpandedChapterIds([firstCh.id]);
    }
  }, [chapters, expandedChapterIds]);

  // ── 4. TOGGLE CHAPTER ACCORDION ──────────────────────────────────────
  const toggleChapter = useCallback((id: string | number) => {
    setExpandedChapterIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  }, []);

  // ── 5. PROGRESS SAVING (REAL API) ────────────────────────────────────
  // WHAT: Send progress to backend
  // WHY: Persist watch progress to database (lesson_progress table)
  // HOW: PATCH /lessons/:lessonId/progress with { progressPercentage }
  const saveProgress = useCallback(async (lessonId: string | number, percentage: number) => {
    // Throttle: only save if progress increased meaningfully
    if (percentage <= lastSavedProgressRef.current && percentage < 100) return;
    lastSavedProgressRef.current = percentage;

    // Optimistic UI update
    setChapters((prev) =>
      prev.map((ch) => ({
        ...ch,
        lessons: ch.lessons.map((l) =>
          l.id === lessonId ? { ...l, progressPercentage: percentage } : l
        ),
      }))
    );
    setActiveLesson((prev) =>
      prev?.id === lessonId ? { ...prev, progressPercentage: percentage } : prev
    );

    // Real API call via apiClient (uses your baseURL, timeout, mock fallback)
    try {
      await apiClient.patch(`/lessons/${lessonId}/progress`, {
        progressPercentage: percentage,
      });
    } catch (err) {
      console.error("Progress save failed:", err);
    }
  }, []);

  // ── 6. VIDEO EVENT HANDLERS ──────────────────────────────────────────
  const handleTimeUpdate = useCallback(() => {
    const video = videoRef.current;
    if (!video || !video.duration) return;
    const percent = Math.round((video.currentTime / video.duration) * 100);
    // Throttle: save every 5%
    if (percent % 5 === 0 && percent > lastSavedProgressRef.current && activeLesson?.id) {
      saveProgress(activeLesson.id, percent);
    }
  }, [activeLesson?.id, saveProgress]);

  const handleVideoEnded = useCallback(() => {
    if (activeLesson?.id) saveProgress(activeLesson.id, 100);
  }, [activeLesson?.id, saveProgress]);

  // Mux auto-unmute on user gesture
  const unmuteOnGesture = useCallback(() => {
    const p = muxPlayerRef.current;
    if (p) p.muted = false;
  }, []);

  // ── 7. NAVIGATION HELPERS ────────────────────────────────────────────
  const allLessons = chapters.flatMap((c) => c.lessons);
  const currentIndex = activeLesson ? allLessons.findIndex((l) => l.id === activeLesson.id) : -1;
  const prevLesson = currentIndex > 0 ? allLessons[currentIndex - 1] : null;
  const nextLesson = currentIndex >= 0 && currentIndex < allLessons.length - 1 ? allLessons[currentIndex + 1] : null;

  // ── 8. OVERALL PROGRESS ──────────────────────────────────────────────
  const overallCourseProgress = allLessons.length
    ? Math.round(allLessons.reduce((acc, l) => acc + (l.progressPercentage || 0), 0) / allLessons.length)
    : 0;

  // ── 9. LOADING / ERROR STATES ────────────────────────────────────────
  if (loading) return <div className="flex items-center justify-center h-screen text-slate-500">Loading…</div>;
  if (error) return (
    <ErrorDisplay
      message={error}
      onRetry={() => {
        setError(null);
        setLoading(true);
        getCourseDetails(courseId!)
          .then((data) => {
            setChapters(data);
            const firstLesson = data[0]?.lessons?.[0];
            if (firstLesson) setActiveLesson(firstLesson);
          })
          .catch((err) => {
            setError("Failed to reload course curriculum. Please try again.");
            console.error("Failed to reload curriculum:", err);
          })
          .finally(() => setLoading(false));
      }}
      fullHeight
    />
  );
  if (!activeLesson) return <div className="p-8 text-center">No lesson selected</div>;

  // ── 10. RENDER ────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col w-full h-screen overflow-hidden font-sans bg-slate-50 text-slate-900">
      {/* ── HEADER ── */}
      <header className="z-20 flex items-center justify-between px-4 bg-white border-b h-14 border-slate-200 shrink-0">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="p-1.5 text-slate-500 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-colors"
            aria-label="Back"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>
          <h1 className="text-sm font-semibold truncate text-slate-900 font-kantumruy">
            {activeLesson.title}
          </h1>
        </div>
        <div className="items-center hidden gap-3 font-mono text-xs sm:flex text-slate-500 font-kantumruy">
          <span>សរុប: {overallCourseProgress}%</span>
          <div className="w-28 bg-slate-200 rounded-full h-1.5 overflow-hidden">
            <div
              className="h-full transition-all duration-300 bg-emerald-500"
              style={{ width: `${overallCourseProgress}%` }}
            />
          </div>
        </div>
      </header>

      {/* ── MAIN LAYOUT ── */}
      <div className="flex flex-col w-full h-screen overflow-hidden">
        {/* LEFT: VIDEO + TABS */}
        <main className="flex flex-col flex-1 h-full overflow-y-auto">
          {/* VIDEO PLAYER */}
          <div className="w-full bg-black aspect-video max-h-[520px] shadow-lg relative rounded-xl overflow-hidden">
            {activeLesson.playbackId ? (
              <div onClickCapture={unmuteOnGesture} className="w-full h-full">
                <MuxPlayer
                  ref={muxPlayerRef}
                  playbackId={activeLesson.playbackId}
                  streamType="on-demand"
                  onTimeUpdate={handleTimeUpdate}
                  onEnded={handleVideoEnded}
                  style={{ width: "100%", height: "100%" }}
                />
              </div>
            ) : (
              <video
                key={activeLesson.id}
                ref={videoRef}
                className="object-contain w-full h-full"
                src={activeLesson.videoUrl}
                controls
                autoPlay
                onTimeUpdate={handleTimeUpdate}
                onEnded={handleVideoEnded}
              />
            )}
          </div>

          {/* VIDEO TITLE & CONTROLS */}
          <div className="p-6 bg-white border-b border-slate-200">
            <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
              <div>
                <h2 className="text-xl font-bold text-slate-900 font-kantumruy">{activeLesson.title}</h2>
                <div className="flex items-center gap-3 mt-1 font-mono text-xs text-slate-500 font-kantumruy">
                  <span>រយៈពេល: {activeLesson.duration || "N/A"}</span>
                  <span>•</span>
                  <span className="font-semibold text-indigo-600">
                    ឃើញប្រើ: {activeLesson.progressPercentage || 0}%
                  </span>
                </div>
              </div>

              {/* Prev / Next Buttons */}
              <div className="flex items-center gap-2">
                <button
                  disabled={!prevLesson}
                  onClick={() => prevLesson && setActiveLesson(prevLesson)}
                  className="px-3 py-1.5 text-xs font-medium rounded-lg bg-white hover:bg-slate-100 disabled:opacity-40 border border-slate-300 text-slate-700 transition-colors font-kantumruy"
                >
                  ← មុន
                </button>
                <button
                  disabled={!nextLesson}
                  onClick={() => nextLesson && setActiveLesson(nextLesson)}
                  className="px-3 py-1.5 text-xs font-medium rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white transition-colors font-kantumruy"
                >
                  ក្រោយ →
                </button>
              </div>
            </div>
          </div>

          {/* TABS */}
          <div className="flex-1 p-6 bg-white">
            <div className="flex gap-6 pb-3 text-sm font-medium border-b border-slate-200">
              {(["overview", "resources", "notes"] as const).map((tab) => {
                const tabLabels = {
                  overview: "ទិដ្ឋភាព",
                  resources: "ធនធាន",
                  notes: "ចំណាំ"
                };
                return (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`pb-1 border-b-2 cursor-pointer transition-colors font-kantumruy ${activeTab === tab
                      ? "border-indigo-600 text-indigo-600 font-semibold"
                      : "border-transparent text-slate-500 hover:text-slate-900"
                      }`}
                  >
                    {tabLabels[tab]}
                  </button>
                );
              })}
            </div>
            <div className="mt-4 text-sm leading-relaxed text-slate-700 font-kantumruy">
              {activeTab === "overview" && (
                <p className="space-y-3">
                  មើលវីដេអូដើម្បីរៀន។ ឯកសារលម្អិតរបស់អ្នកត្រូវបានរក្សាទុកដោយស្វ័យប្រវត្តិរៀងរាល់ 5%។
                </p>
              )}
              {activeTab === "resources" && (
                <p className="text-slate-500">គ្មានធនធានបន្ថែមសម្រាប់មេរៀននេះនៅឡើយទេ។</p>
              )}
              {activeTab === "notes" && (
                <textarea
                  placeholder="សរសេរចំណាំ…"
                  className="w-full h-32 p-3 text-xs border rounded-lg border-slate-300 focus:outline-none focus:border-indigo-500 font-kantumruy"
                />
              )}
            </div>
          </div>
        </main>

        {/* RIGHT: PLAYLIST SIDEBAR */}
        <aside className="flex flex-col h-full overflow-hidden border-l w-80 md:w-96 bg-slate-50 border-slate-200 shrink-0">
          <div className="flex items-center justify-between p-4 bg-white border-b border-slate-200">
            <h3 className="text-sm font-bold uppercase text-slate-900 font-kantumruy">ខ្លឹមសារវគ្គសិក្សា</h3>
            <span className="font-mono text-xs text-slate-500 font-kantumruy">
              {currentIndex + 1} / {allLessons.length} មេរៀន
            </span>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
            {chapters.map((chapter) => {
              const isExpanded = expandedChapterIds.includes(chapter.id);
              const chProgress = chapter.lessons.length
                ? Math.round(chapter.lessons.reduce((a, b) => a + (b.progressPercentage || 0), 0) / chapter.lessons.length)
                : 0;

              return (
                <div key={chapter.id} className="bg-white/60">
                  <button
                    type="button"
                    onClick={() => toggleChapter(chapter.id)}
                    className="w-full p-3.5 flex items-center justify-between text-left hover:bg-slate-100 transition-colors"
                  >
                    <div className="flex items-center gap-2 pr-2">
                      <svg
                        className={`w-4 h-4 text-slate-400 transition-transform ${isExpanded ? "rotate-90 text-indigo-600" : ""}`}
                        fill="none" stroke="currentColor" viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                      <span className="text-xs font-semibold truncate text-slate-800 font-kantumruy">{chapter.title}</span>
                    </div>
                    <span className="text-[11px] font-mono text-slate-500">{chProgress}%</span>
                  </button>

                  {isExpanded && (
                    <div className="py-1 divide-y bg-slate-50/50">
                      {chapter.lessons.map((lesson) => {
                        const isActive = lesson.id === activeLesson?.id;
                        const lessonProgress = lesson.progressPercentage || 0;
                        const isCompleted = lessonProgress === 100;

                        return (
                          <button
                            key={lesson.id}
                            type="button"
                            onClick={() => setActiveLesson(lesson)}
                            className={`w-full p-3 flex items-start gap-3 text-left transition-all ${isActive
                              ? "bg-indigo-50 border-l-4 border-indigo-500"
                              : "hover:bg-slate-100 border-l-4 border-transparent"
                              }`}
                          >
                            <div className="mt-0.5 shrink-0">
                              {isCompleted ? (
                                <svg className="w-4 h-4 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                              ) : isActive ? (
                                <svg className="w-4 h-4 text-indigo-500 animate-pulse" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                                </svg>
                              ) : (
                                <div className="w-4 h-4 border rounded-full border-slate-300" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className={`text-xs font-kantumruy ${isActive ? "font-bold text-indigo-600" : "text-slate-700"}`}>
                                {lesson.title}
                              </p>
                              <div className="flex items-center gap-1.5 mt-1.5">
                                <span className="text-[10px] text-slate-500 font-mono">{lesson.duration}</span>
                                <div className="flex items-center gap-1.5">
                                  <div className="w-12 h-1 overflow-hidden rounded-full bg-slate-200">
                                    <div
                                      className={`h-full transition-all duration-300 ${isCompleted ? "bg-emerald-500" : "bg-amber-500"}`}
                                      style={{ width: `${lessonProgress}%` }}
                                    />
                                  </div>
                                  <span className="text-[10px] text-slate-500 font-mono">{lessonProgress}%</span>
                                </div>
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </aside>
      </div>
    </div>
  );
}
