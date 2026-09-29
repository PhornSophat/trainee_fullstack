import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import type { Chapter, Lesson } from "@/types/course";
import { getCourseDetails } from "@/services/courseService";
import { apiClient } from "@/services/apiClient";
import { ErrorDisplay } from "@/components/error-display/ErrorDisplay";
import { useCoursesStore } from "@/store/courseStore";
import MuxPlayer from "@mux/mux-player-react";
import { getMuxPlaybackId, getYouTubeEmbedUrl } from "@/lib/videoUtils";
import { formatKhmerLessonTitle, formatKhmerChapterTitle } from "@/lib/khmerUtils";
import {
  ArrowLeft,
  ChevronDown,
  ChevronRight,
  Check,
  Play,
  X,
  PanelRight,
  Search,
  MessageSquare,
  FileText,
  BookOpen,
  Bell,
  Plus,
  Trash2,
  Download,
  ThumbsUp,
  Lock,
  CheckCircle2,
} from "lucide-react";

type UdemyTab = "overview" | "qna" | "notes" | "announcements" | "resources";

interface CourseNote {
  id: string;
  lessonId: string | number;
  lessonTitle: string;
  timestamp: number; // in seconds
  timestampFormatted: string;
  text: string;
  createdAt: string;
}

interface QnAQuestion {
  id: string;
  author: string;
  authorRole?: string;
  avatarLetter: string;
  title: string;
  description: string;
  lessonTitle: string;
  answersCount: number;
  likesCount: number;
  timeAgo: string;
}

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

function parseDurationToSeconds(duration?: string): number {
  if (!duration) return 0;
  const trimmed = duration.trim();
  if (trimmed.includes(":")) {
    const parts = trimmed.split(":").map(Number);
    if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
      return parts[0] * 60 + parts[1];
    } else if (parts.length === 3 && !isNaN(parts[0]) && !isNaN(parts[1]) && !isNaN(parts[2])) {
      return parts[0] * 3600 + parts[1] * 60 + parts[2];
    }
  }
  const minMatch = trimmed.match(/^(\d+)\s*m/i);
  if (minMatch) return parseInt(minMatch[1], 10) * 60;
  const secMatch = trimmed.match(/^(\d+)\s*s/i);
  if (secMatch) return parseInt(secMatch[1], 10);
  const num = Number(trimmed);
  if (!isNaN(num)) return num;
  return 0;
}

function getStoredLessonPosition(lesson: Lesson): number {
  let localPos = 0;
  try {
    const raw = localStorage.getItem(`lesson_pos_${lesson.id}`);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (typeof parsed?.currentTime === "number" && !isNaN(parsed.currentTime)) {
        localPos = parsed.currentTime;
      }
    }
  } catch (e) {
    console.warn("Failed to read lesson position from localStorage:", e);
  }

  const backendPos = lesson.lastPositionSeconds || 0;

  let estimatedPos = 0;
  if (localPos === 0 && backendPos === 0 && (lesson.progressPercentage || 0) > 0 && (lesson.progressPercentage || 0) < 100) {
    const totalSec = parseDurationToSeconds(lesson.duration);
    if (totalSec > 0) {
      estimatedPos = Math.round(((lesson.progressPercentage || 0) / 100) * totalSec);
    }
  }

  const chosenPos = Math.max(localPos, backendPos, estimatedPos);
  const totalSec = parseDurationToSeconds(lesson.duration);

  // If already 100% completed, restart at 0 unless user was actively rewatching (< totalSec - 5)
  if ((lesson.progressPercentage || 0) >= 100) {
    if (totalSec > 0 && localPos > 5 && localPos < totalSec - 5) {
      return localPos;
    }
    return 0;
  }

  if (totalSec > 0 && chosenPos >= totalSec - 3) {
    return 0;
  }

  return chosenPos;
}

export function CourseVideoLearning() {
  // ── Refs ──────────────────────────────────────────────────────────────
  const muxPlayerRef = useRef<any>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const lastSavedProgressRef = useRef<number>(0);
  const maxWatchedTimeRef = useRef<number>(0);
  const lastLocalSaveRef = useRef<number>(0);
  const lastApiSaveTimeRef = useRef<number>(0);
  const lastSavedPosRef = useRef<number>(0);

  // ── Navigation & Params ──────────────────────────────────────────────
  const navigate = useNavigate();
  const { courseId } = useParams<{ courseId: string }>();
  const location = useLocation();

  // ── Course Store ──────────────────────────────────────────────────────
  const courses = useCoursesStore((s) => s.courses);
  const fetchCourses = useCoursesStore((s) => s.fetchCourses);
  const loaded = useCoursesStore((s) => s.loaded);

  useEffect(() => {
    if (!loaded) fetchCourses();
  }, [loaded, fetchCourses]);

  const currentCourse = courses.find((c) => String(c.id) === String(courseId));

  // ── State ─────────────────────────────────────────────────────────────
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);
  const [activeTab, setActiveTab] = useState<UdemyTab>("overview");
  const [expandedChapterIds, setExpandedChapterIds] = useState<(string | number)[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentVideoTime, setCurrentVideoTime] = useState<number>(0);
  const [skipWarningToast, setSkipWarningToast] = useState(false);
  const [completedToast, setCompletedToast] = useState(false);
  const [resumedToast, setResumedToast] = useState<{
    show: boolean;
    timeFormatted: string;
    seconds: number;
  }>({
    show: false,
    timeFormatted: "",
    seconds: 0,
  });

  // ── Notes State ───────────────────────────────────────────────────────
  const [notes, setNotes] = useState<CourseNote[]>(() => {
    try {
      const saved = localStorage.getItem(`course_notes_${courseId}`);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [newNoteText, setNewNoteText] = useState("");
  const [isAddingNote, setIsAddingNote] = useState(false);

  // ── Q&A State ─────────────────────────────────────────────────────────
  const [searchQuery, setSearchQuery] = useState("");
  const [qnaQuestions, setQnaQuestions] = useState<QnAQuestion[]>([
    {
      id: "q1",
      author: "Vireak Roth",
      authorRole: "Student",
      avatarLetter: "V",
      title: "How to properly normalize relational tables up to 3NF?",
      description:
        "Could you clarify the difference between 2NF and 3NF when handling transitive dependencies with foreign keys?",
      lessonTitle: "1. Course Overview & Setup",
      answersCount: 2,
      likesCount: 5,
      timeAgo: "2 days ago",
    },
    {
      id: "q2",
      author: "Chantrea Meng",
      authorRole: "Student",
      avatarLetter: "C",
      title: "Index optimization in PostgreSQL vs MySQL",
      description:
        "When should we choose B-Tree indexes versus GIN or BRIN indexes for large query tables?",
      lessonTitle: "១. ការយល់ដឹងអំពី State & Props",
      answersCount: 1,
      likesCount: 3,
      timeAgo: "4 days ago",
    },
  ]);
  const [newQuestionTitle, setNewQuestionTitle] = useState("");
  const [newQuestionDesc, setNewQuestionDesc] = useState("");
  const [isAskingQuestion, setIsAskingQuestion] = useState(false);

  // ── 1. Fetch Curriculum ───────────────────────────────────────────────
  useEffect(() => {
    if (!courseId) return;
    setLoading(true);
    let isMounted = true;
    getCourseDetails(courseId)
      .then((data) => {
        if (!isMounted) return;
        setChapters(data);

        // Match lesson from URL query or default to first
        const allLessons = data.flatMap((c) => c.lessons || []);
        const lessonIdFromQuery = location.search
          ? new URLSearchParams(location.search).get("lessonId")
          : undefined;

        const matchedLesson = lessonIdFromQuery
          ? allLessons.find((l) => String(l.id) === String(lessonIdFromQuery))
          : null;

        const firstIncompleteLesson = allLessons.find(
          (l) => (l.progressPercentage || 0) < 100
        );
        const targetLesson =
          matchedLesson || firstIncompleteLesson || allLessons[0] || null;
        if (targetLesson) {
          setActiveLesson(targetLesson);
        }
      })
      .catch((err) => {
        if (!isMounted) return;
        console.error("Failed to load curriculum:", err);
        setError("Failed to load course curriculum.");
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [courseId, location.search]);

  // ── 2. Auto-expand chapter for active lesson ──────────────────────────
  useEffect(() => {
    if (!activeLesson) return;
    chapters.forEach((ch) => {
      if (ch.lessons.some((l) => String(l.id) === String(activeLesson.id))) {
        setExpandedChapterIds((prev) =>
          prev.includes(ch.id) ? prev : [...prev, ch.id]
        );
      }
    });
  }, [activeLesson, chapters]);

  // ── 3. Toggle chapter accordion ───────────────────────────────────────
  const toggleChapter = useCallback((id: string | number) => {
    setExpandedChapterIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  }, []);

  const resumeTime = useMemo(() => {
    return activeLesson ? getStoredLessonPosition(activeLesson) : 0;
  }, [activeLesson?.id, activeLesson?.lastPositionSeconds, activeLesson?.progressPercentage]);

  // Reset progress refs and initialize maxWatchedTimeRef when active lesson changes
  useEffect(() => {
    if (!activeLesson) return;

    const initialPos = getStoredLessonPosition(activeLesson);
    lastSavedProgressRef.current = activeLesson.progressPercentage || 0;
    maxWatchedTimeRef.current = Math.max(initialPos, 0);
    lastSavedPosRef.current = initialPos;

    if (initialPos >= 3) {
      setResumedToast({
        show: true,
        timeFormatted: formatDuration(initialPos),
        seconds: initialPos,
      });
      const timer = setTimeout(() => {
        setResumedToast((prev) => ({ ...prev, show: false }));
      }, 5000);
      return () => clearTimeout(timer);
    } else {
      setResumedToast({ show: false, timeFormatted: "", seconds: 0 });
    }
  }, [activeLesson?.id]);

  // Handle onLoadedMetadata for native <video> or MuxPlayer
  const handleLoadedMetadata = useCallback(() => {
    if (!activeLesson) return;
    const targetPos = getStoredLessonPosition(activeLesson);
    if (targetPos <= 0) return;

    if (videoRef.current) {
      if (targetPos < (videoRef.current.duration || 99999) - 2) {
        videoRef.current.currentTime = targetPos;
      }
    } else if (muxPlayerRef.current) {
      if (targetPos < (muxPlayerRef.current.duration || 99999) - 2) {
        muxPlayerRef.current.currentTime = targetPos;
      }
    }
    maxWatchedTimeRef.current = Math.max(maxWatchedTimeRef.current, targetPos);
  }, [activeLesson]);

  // Enforce resume position when player is ready
  useEffect(() => {
    if (!activeLesson) return;
    const targetPos = getStoredLessonPosition(activeLesson);
    if (targetPos <= 0) return;

    const checkAndSeek = () => {
      const v = videoRef.current || muxPlayerRef.current;
      if (v && v.readyState >= 1) {
        if (Math.abs(v.currentTime - targetPos) > 1.5 && targetPos < (v.duration || 99999) - 2) {
          v.currentTime = targetPos;
          maxWatchedTimeRef.current = Math.max(maxWatchedTimeRef.current, targetPos);
        }
      }
    };

    checkAndSeek();
    const t = setTimeout(checkAndSeek, 350);
    return () => clearTimeout(t);
  }, [activeLesson?.id]);

  // Save playback position on unmount or lesson change
  useEffect(() => {
    return () => {
      const video = videoRef.current || muxPlayerRef.current;
      if (video && activeLesson?.id && video.currentTime > 0) {
        const cTime = video.currentTime;
        const dur = video.duration || 1;
        const pct = Math.min(100, Math.round((cTime / dur) * 100));
        try {
          localStorage.setItem(
            `lesson_pos_${activeLesson.id}`,
            JSON.stringify({
              currentTime: cTime,
              duration: dur,
              progressPercentage: pct,
              updatedAt: Date.now(),
            })
          );
        } catch {}
        apiClient
          .patch(`/courses/lessons/${activeLesson.id}/progress`, {
            progressPercentage: pct,
            lastPositionSeconds: Math.round(cTime),
          })
          .catch(() => {});
      }
    };
  }, [activeLesson?.id]);

  // ── 4. Save Progress (Real API & Optimistic) ──────────────────────────
  const saveProgress = useCallback(
    async (lessonId: string | number, percentage: number, force = false, positionSeconds?: number) => {
      if (!force && percentage <= lastSavedProgressRef.current && percentage < 100) return;
      lastSavedProgressRef.current = percentage;

      const posSec = positionSeconds !== undefined ? Math.round(positionSeconds) : undefined;

      // Optimistic update
      setChapters((prev) =>
        prev.map((ch) => ({
          ...ch,
          lessons: ch.lessons.map((l) =>
            String(l.id) === String(lessonId)
              ? {
                  ...l,
                  progressPercentage: percentage,
                  ...(posSec !== undefined && { lastPositionSeconds: posSec }),
                }
              : l
          ),
        }))
      );
      setActiveLesson((prev) =>
        prev && String(prev.id) === String(lessonId)
          ? {
              ...prev,
              progressPercentage: percentage,
              ...(posSec !== undefined && { lastPositionSeconds: posSec }),
            }
          : prev
      );

      try {
        await apiClient.patch(`/courses/lessons/${lessonId}/progress`, {
          progressPercentage: percentage,
          ...(posSec !== undefined && { lastPositionSeconds: posSec }),
        });
      } catch (err) {
        console.error("Progress save failed:", err);
      }
    },
    []
  );

  // ── 5. Video Event Handlers (Strict Verification Mode) ─────────────────
  const handleTimeUpdate = useCallback(() => {
    const video = videoRef.current || muxPlayerRef.current;
    if (!video || !video.duration) return;
    const currentTime = video.currentTime;
    const duration = video.duration;
    setCurrentVideoTime(currentTime);

    // Save to localStorage (throttled every 1s)
    const now = Date.now();
    if (now - lastLocalSaveRef.current > 1000 && activeLesson?.id) {
      lastLocalSaveRef.current = now;
      try {
        localStorage.setItem(
          `lesson_pos_${activeLesson.id}`,
          JSON.stringify({
            currentTime,
            duration,
            progressPercentage: Math.min(100, Math.round((currentTime / duration) * 100)),
            updatedAt: now,
          })
        );
      } catch (e) {
        console.warn("Failed to save lesson position to localStorage:", e);
      }
    }

    const isAlreadyComplete = (activeLesson?.progressPercentage || 0) === 100;

    // Strict Mode: Prevent seeking ahead past unwatched content
    if (!isAlreadyComplete) {
      if (currentTime > maxWatchedTimeRef.current + 2.5) {
        video.currentTime = maxWatchedTimeRef.current;
        setSkipWarningToast(true);
        setTimeout(() => setSkipWarningToast(false), 3000);
        return;
      }
      if (currentTime > maxWatchedTimeRef.current) {
        maxWatchedTimeRef.current = currentTime;
      }
    }

    const percent = Math.min(100, Math.round((currentTime / duration) * 100));
    if (!activeLesson?.id) return;

    // Auto-complete when >= 90% watched
    if (percent >= 90 && !isAlreadyComplete) {
      saveProgress(activeLesson.id, 100, true, currentTime);
      setCompletedToast(true);
      setTimeout(() => setCompletedToast(false), 4000);
      return;
    }

    // Save to backend every 5% progress or if more than 15s elapsed with position advance
    const timeSinceLastApi = now - lastApiSaveTimeRef.current;
    const shouldSavePercent =
      percent % 5 === 0 && percent > lastSavedProgressRef.current && !isAlreadyComplete;
    const shouldSaveInterval =
      timeSinceLastApi > 15000 &&
      Math.abs(currentTime - lastSavedPosRef.current) >= 5 &&
      !isAlreadyComplete;

    if (shouldSavePercent || shouldSaveInterval) {
      lastApiSaveTimeRef.current = now;
      lastSavedPosRef.current = currentTime;
      saveProgress(activeLesson.id, percent, false, currentTime);
    }
  }, [activeLesson?.id, activeLesson?.progressPercentage, saveProgress]);

  const handleVideoEnded = useCallback(() => {
    if (activeLesson?.id) {
      const v = videoRef.current || muxPlayerRef.current;
      const dur = v?.duration || 0;
      saveProgress(activeLesson.id, 100, true, dur);
      setCompletedToast(true);
      setTimeout(() => setCompletedToast(false), 4000);
    }
  }, [activeLesson?.id, saveProgress]);

  const unmuteOnGesture = useCallback(() => {
    const p = muxPlayerRef.current;
    if (p) p.muted = false;
  }, []);

  // Jump video to specific timestamp (Udemy notes jump)
  const seekToTime = (seconds: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = seconds;
      videoRef.current.play?.();
    } else if (muxPlayerRef.current) {
      muxPlayerRef.current.currentTime = seconds;
      muxPlayerRef.current.play?.();
    }
  };

  // ── 7. Navigation Helpers ─────────────────────────────────────────────
  const allLessons = useMemo(
    () => chapters.flatMap((c) => c.lessons || []),
    [chapters]
  );
  const currentIndex = activeLesson
    ? allLessons.findIndex((l) => String(l.id) === String(activeLesson.id))
    : -1;
  const prevLesson = currentIndex > 0 ? allLessons[currentIndex - 1] : null;
  const nextLesson =
    currentIndex >= 0 && currentIndex < allLessons.length - 1
      ? allLessons[currentIndex + 1]
      : null;



  // ── 10. Notes Handlers ────────────────────────────────────────────────
  const handleAddNote = () => {
    if (!newNoteText.trim() || !activeLesson) return;
    const newNote: CourseNote = {
      id: Date.now().toString(),
      lessonId: activeLesson.id,
      lessonTitle: activeLesson.title,
      timestamp: currentVideoTime,
      timestampFormatted: formatDuration(currentVideoTime),
      text: newNoteText.trim(),
      createdAt: new Date().toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
    };
    const updated = [newNote, ...notes];
    setNotes(updated);
    try {
      localStorage.setItem(`course_notes_${courseId}`, JSON.stringify(updated));
    } catch (e) {
      console.warn("Failed to persist notes to localStorage:", e);
    }
    setNewNoteText("");
    setIsAddingNote(false);
  };

  const handleDeleteNote = (noteId: string) => {
    const updated = notes.filter((n) => n.id !== noteId);
    setNotes(updated);
    try {
      localStorage.setItem(`course_notes_${courseId}`, JSON.stringify(updated));
    } catch (e) {
      console.warn("Failed to update notes in localStorage:", e);
    }
  };

  // ── 11. Q&A Handlers ──────────────────────────────────────────────────
  const handleAddQuestion = () => {
    if (!newQuestionTitle.trim() || !activeLesson) return;
    const newQ: QnAQuestion = {
      id: `q-${Date.now()}`,
      author: "You",
      authorRole: "Student",
      avatarLetter: "Y",
      title: newQuestionTitle.trim(),
      description: newQuestionDesc.trim(),
      lessonTitle: activeLesson.title,
      answersCount: 0,
      likesCount: 0,
      timeAgo: "Just now",
    };
    setQnaQuestions([newQ, ...qnaQuestions]);
    setNewQuestionTitle("");
    setNewQuestionDesc("");
    setIsAskingQuestion(false);
  };

  // ── Loading & Error States ────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#1c1d1f] text-white">
        <div className="w-12 h-12 border-4 rounded-full border-purple-500/20 border-t-purple-500 animate-spin" />
        <p className="mt-4 text-sm font-medium text-slate-300">Loading course player...</p>
      </div>
    );
  }

  if (error) {
    return (
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
  }

  if (!activeLesson) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#1c1d1f] text-white p-6">
        <p className="text-lg font-semibold">No lesson selected.</p>
        <button
          onClick={() => navigate(`/trainee/programs/${courseId}`)}
          className="mt-4 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded font-medium text-sm transition-colors"
        >
          Return to Course
        </button>
      </div>
    );
  }

  const isCurrentLessonComplete = (activeLesson.progressPercentage || 0) === 100;

  return (
    <div className="flex flex-col w-full h-screen overflow-hidden font-sans bg-slate-100 text-slate-900 select-none">
      {/* ========================================================================= */}
      {/* ── 1. UDEMY TOP NAVIGATION BAR ── */}
      {/* ========================================================================= */}
      <header className="z-30 flex items-center justify-between px-4 bg-[#1c1d1f] text-white border-b border-[#2d2f31] h-14 shrink-0 shadow-md">
        {/* Left: Back Arrow + Course Title */}
        <div className="flex items-center gap-3 min-w-0">
          <button
            type="button"
            onClick={() => navigate(`/trainee/programs/${courseId}`)}
            className="p-2 text-slate-300 transition-colors rounded-full hover:bg-white/10 hover:text-white cursor-pointer shrink-0"
            title="Back to course page"
            aria-label="Back to course page"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <div className="hidden h-5 w-[1px] bg-slate-700 sm:block shrink-0" />

          <button
            type="button"
            onClick={() => navigate(`/trainee/programs/${courseId}`)}
            className="text-base font-normal truncate hover:text-purple-300 transition-colors cursor-pointer text-left font-kantumruy max-w-[220px] sm:max-w-xs md:max-w-md lg:max-w-lg"
          >
            {currentCourse?.title || "Course"}
          </button>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Collapsed Sidebar Toggle (Shows when right sidebar is closed) */}
          {!isSidebarOpen && (
            <button
              type="button"
              onClick={() => setIsSidebarOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-purple-600 hover:bg-purple-700 transition-colors rounded cursor-pointer shadow-sm"
              title="Open course content"
            >
              <PanelRight className="w-4 h-4" />
              <span className="hidden md:inline">Course content</span>
            </button>
          )}
        </div>
      </header>

      {/* Strict Mode Notice Toasts */}
      {skipWarningToast && (
        <div className="fixed top-16 right-6 z-50 flex items-center gap-2.5 px-4 py-2.5 text-xs font-medium text-white bg-amber-600 rounded-xl shadow-2xl animate-in fade-in slide-in-from-top-2 border border-amber-400/30">
          <Lock className="w-4 h-4 shrink-0" />
          <span>Strict Mode: Fast-forwarding is disabled. Please watch the video to complete.</span>
        </div>
      )}

      {completedToast && (
        <div className="fixed top-16 right-6 z-50 flex items-center gap-2.5 px-4 py-2.5 text-xs font-semibold text-white bg-emerald-600 rounded-xl shadow-2xl animate-in fade-in slide-in-from-top-2 border border-emerald-400/30">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>Lecture verified & completed! Progress saved.</span>
        </div>
      )}

      {resumedToast.show && (
        <div className="fixed top-16 right-6 z-50 flex items-center gap-3 px-4 py-2.5 text-xs font-medium text-white bg-slate-900/95 backdrop-blur-md rounded-xl shadow-2xl animate-in fade-in slide-in-from-top-2 border border-slate-700">
          <Play className="w-3.5 h-3.5 text-purple-400 fill-purple-400 shrink-0" />
          <span>
            Resumed at <strong className="text-purple-300 font-mono">{resumedToast.timeFormatted}</strong>
          </span>
          <button
            type="button"
            onClick={() => {
              seekToTime(0);
              maxWatchedTimeRef.current = 0;
              setResumedToast((prev) => ({ ...prev, show: false }));
            }}
            className="ml-1 px-2.5 py-1 text-[11px] font-semibold text-purple-200 hover:text-white bg-purple-600/70 hover:bg-purple-600 rounded transition-colors cursor-pointer"
          >
            Restart from 0:00
          </button>
          <button
            type="button"
            onClick={() => setResumedToast((prev) => ({ ...prev, show: false }))}
            className="p-1 text-slate-400 hover:text-white transition-colors cursor-pointer"
            title="Dismiss"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* ========================================================================= */}
      {/* ── 2. MAIN LAYOUT (STAGE + RIGHT SIDEBAR) ── */}
      {/* ========================================================================= */}
      <div className="flex flex-1 w-full min-h-0 overflow-hidden bg-slate-900">
        {/* LEFT / CENTER: VIDEO PLAYER & TABS AREA */}
        <div className="flex flex-col flex-1 h-full min-w-0 overflow-y-auto bg-white">
          {/* ── VIDEO PLAYER THEATER STAGE ── */}
          <div className="relative flex items-center justify-center w-full bg-black shrink-0 aspect-video max-h-[64vh] shadow-lg">
            {(() => {
              const muxPlaybackId = getMuxPlaybackId(activeLesson.playbackId, activeLesson.videoUrl);
              const youtubeEmbedUrl = getYouTubeEmbedUrl(activeLesson.videoUrl);

              if (muxPlaybackId) {
                return (
                  <div onClickCapture={unmuteOnGesture} className="w-full h-full">
                    <MuxPlayer
                      key={`${activeLesson.id}-${muxPlaybackId}`}
                      ref={muxPlayerRef}
                      playbackId={muxPlaybackId}
                      streamType="on-demand"
                      startTime={resumeTime > 0 ? resumeTime : undefined}
                      onLoadedMetadata={handleLoadedMetadata}
                      onTimeUpdate={handleTimeUpdate}
                      onEnded={handleVideoEnded}
                      style={{ width: "100%", height: "100%" }}
                    />
                  </div>
                );
              }

              if (youtubeEmbedUrl) {
                return (
                  <div className="w-full h-full bg-slate-950">
                    <iframe
                      key={`${activeLesson.id}-yt`}
                      src={youtubeEmbedUrl}
                      title={activeLesson.title}
                      className="w-full h-full border-0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                    />
                  </div>
                );
              }

              if (activeLesson.videoUrl) {
                return (
                  <video
                    key={`${activeLesson.id}-${activeLesson.videoUrl}`}
                    ref={videoRef}
                    className="object-contain w-full h-full"
                    src={activeLesson.videoUrl}
                    controls
                    autoPlay
                    onLoadedMetadata={handleLoadedMetadata}
                    onTimeUpdate={handleTimeUpdate}
                    onEnded={handleVideoEnded}
                  />
                );
              }

              return (
                <div className="flex flex-col items-center justify-center w-full h-full p-6 text-center text-slate-400 bg-slate-900 font-kantumruy">
                  <Play className="w-12 h-12 mb-3 text-slate-600 opacity-60" />
                  <p className="text-sm font-semibold text-slate-300">មិនទាន់មានវីដេអូមេរៀននេះនៅឡើយទេ</p>
                  <p className="mt-1 text-xs text-slate-500">Video link has not been added yet by instructor.</p>
                </div>
              );
            })()}
          </div>

          {/* ── LECTURE BAR UNDER VIDEO: TITLE & NEXT/PREV CONTROLS ── */}
          <div className="px-6 py-4 bg-white border-b border-slate-200 shrink-0">
            <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-normal uppercase tracking-wider text-purple-600">
                    Lecture {currentIndex + 1}
                  </span>
                  <span className="text-slate-300">•</span>
                  <span className="text-xs text-slate-500 font-mono">
                    {activeLesson.duration || "Video"}
                  </span>
                </div>
                <h1 className="mt-1 text-2xl font-normal text-slate-900 font-kantumruy">
                  {(() => {
                    const ch = chapters.find((c) => c.lessons?.some((l) => String(l.id) === String(activeLesson.id)));
                    const idx = ch?.lessons?.findIndex((l) => String(l.id) === String(activeLesson.id)) ?? 0;
                    return formatKhmerLessonTitle(activeLesson.title, idx >= 0 ? idx : 0);
                  })()}
                </h1>
              </div>

              {/* Prev / Next Buttons & Strict Verification Badge */}
              <div className="flex items-center gap-2 shrink-0">
                {isCurrentLessonComplete ? (
                  <div
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border bg-emerald-50 text-emerald-700 border-emerald-300 shadow-2xs"
                    title="Verified completion: watched > 90%"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Verified Complete</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    {getYouTubeEmbedUrl(activeLesson.videoUrl) && (
                      <button
                        type="button"
                        onClick={() => saveProgress(activeLesson.id, 100, true)}
                        className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white transition-colors font-kantumruy cursor-pointer shadow-xs"
                        title="សម្គាល់ថាបានរៀនចប់"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>សម្គាល់ថាបានរៀនចប់</span>
                      </button>
                    )}
                    <div
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border bg-slate-50 text-slate-600 border-slate-200 shadow-2xs cursor-help"
                      title="Strict verification: watch at least 90% of this video to complete"
                    >
                      <Lock className="w-3.5 h-3.5 text-amber-500" />
                      <span>
                        {(activeLesson.progressPercentage || 0) > 0
                          ? `In Progress (${activeLesson.progressPercentage}%)`
                          : "Watch to Complete"}
                      </span>
                    </div>
                  </div>
                )}

                <button
                  disabled={!prevLesson}
                  onClick={() => prevLesson && setActiveLesson(prevLesson)}
                  className="px-3 py-1.5 text-xs font-medium rounded-lg bg-white hover:bg-slate-100 disabled:opacity-40 border border-slate-300 text-slate-700 transition-colors font-kantumruy cursor-pointer disabled:cursor-not-allowed"
                >
                  ← មុន
                </button>
                <button
                  disabled={!nextLesson}
                  onClick={() => nextLesson && setActiveLesson(nextLesson)}
                  className="px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-purple-600 hover:bg-purple-700 disabled:opacity-40 text-white transition-colors font-kantumruy cursor-pointer disabled:cursor-not-allowed shadow-xs"
                >
                  ក្រោយ →
                </button>
              </div>
            </div>
          </div>

          {/* ── UDEMY NAVIGATION TABS ── */}
          <div className="flex gap-8 px-6 bg-white border-b border-slate-200 shrink-0 text-sm font-semibold text-slate-600">
            {(
              [
                { id: "overview", label: "Overview", icon: BookOpen },
                { id: "qna", label: "Q&A", icon: MessageSquare },
                { id: "notes", label: "Notes", icon: FileText },
                { id: "announcements", label: "Announcements", icon: Bell },
                { id: "resources", label: "Resources", icon: Download },
              ] as const
            ).map((tab) => {
              const isActive = activeTab === tab.id;
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 py-3.5 border-b-2 transition-all cursor-pointer ${
                    isActive
                      ? "border-purple-600 text-purple-600 font-bold"
                      : "border-transparent hover:text-slate-900 hover:border-slate-300"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* ── TAB CONTENT BODY ── */}
          <div className="flex-1 p-6 max-w-5xl bg-white">
            {/* OVERVIEW TAB */}
            {activeTab === "overview" && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">About this lecture</h2>
                  <p className="mt-2 text-sm text-slate-600 leading-relaxed font-kantumruy">
                    {activeLesson.description ||
                      "In this lecture, you will explore the essential concepts and best practices necessary to master this topic. Watch attentively and test the concepts in your local environment."}
                  </p>
                </div>

                <div className="pt-6 border-t border-slate-200">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500">
                    Course Description
                  </h3>
                  <p className="mt-2 text-sm text-slate-700 leading-relaxed font-kantumruy">
                    {currentCourse?.description ||
                      "A comprehensive hands-on training curriculum crafted by industry professionals."}
                  </p>
                </div>

                {/* Skills / What you will learn */}
                {currentCourse?.skills && currentCourse.skills.length > 0 && (
                  <div className="pt-6 border-t border-slate-200">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-3">
                      Skills covered in this course
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                      {currentCourse.skills.map((skill, idx) => (
                        <div key={idx} className="flex items-start gap-2 text-xs text-slate-700 font-kantumruy">
                          <Check className="w-4 h-4 text-purple-600 mt-0.5 shrink-0" />
                          <span>{skill}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Instructor Bio */}
                {currentCourse?.instructors && currentCourse.instructors.length > 0 && (
                  <div className="pt-6 border-t border-slate-200">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-3">
                      Instructor
                    </h3>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-12 h-12 text-base font-bold text-white bg-purple-700 rounded-full">
                        {currentCourse.instructors[0].name.charAt(0)}
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-900">
                          {currentCourse.instructors[0].name}
                        </h4>
                        <p className="text-xs text-slate-500">Course Instructor & Technical Mentor</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Q&A TAB */}
            {activeTab === "qna" && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pb-4 border-b border-slate-200">
                  {/* Search Input */}
                  <div className="relative flex-1">
                    <Search className="absolute w-4 h-4 text-slate-400 left-3 top-2.5" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search all course questions..."
                      className="w-full pl-9 pr-4 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:border-purple-600"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsAskingQuestion(!isAskingQuestion)}
                    className="px-4 py-2 text-xs font-semibold text-white bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors cursor-pointer shrink-0 flex items-center justify-center gap-1.5"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Ask a new question</span>
                  </button>
                </div>

                {/* Ask Question Box */}
                {isAskingQuestion && (
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                    <h4 className="text-xs font-bold uppercase text-slate-700">New Question</h4>
                    <input
                      type="text"
                      value={newQuestionTitle}
                      onChange={(e) => setNewQuestionTitle(e.target.value)}
                      placeholder="Title or summary of question..."
                      className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-purple-600"
                    />
                    <textarea
                      value={newQuestionDesc}
                      onChange={(e) => setNewQuestionDesc(e.target.value)}
                      placeholder="Provide details about what you tried or what you are curious about..."
                      className="w-full h-24 p-3 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-purple-600"
                    />
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setIsAskingQuestion(false)}
                        className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-200 rounded"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={handleAddQuestion}
                        disabled={!newQuestionTitle.trim()}
                        className="px-4 py-1.5 text-xs font-semibold text-white bg-purple-600 hover:bg-purple-700 rounded disabled:opacity-40"
                      >
                        Post Question
                      </button>
                    </div>
                  </div>
                )}

                {/* Questions List */}
                <div className="divide-y divide-slate-100">
                  {qnaQuestions
                    .filter(
                      (q) =>
                        q.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        q.description.toLowerCase().includes(searchQuery.toLowerCase())
                    )
                    .map((q) => (
                      <div key={q.id} className="py-4 space-y-2">
                        <div className="flex items-start gap-3">
                          <div className="flex items-center justify-center w-8 h-8 text-xs font-bold text-white bg-indigo-600 rounded-full shrink-0">
                            {q.avatarLetter}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-bold text-slate-900 hover:text-purple-600 cursor-pointer">
                              {q.title}
                            </h4>
                            <p className="mt-1 text-xs text-slate-600 line-clamp-2">
                              {q.description}
                            </p>
                            <div className="flex items-center gap-3 mt-2 text-[11px] text-slate-400">
                              <span className="font-semibold text-slate-700">{q.author}</span>
                              <span>•</span>
                              <span>{q.lessonTitle}</span>
                              <span>•</span>
                              <span>{q.timeAgo}</span>
                              <span>•</span>
                              <span className="flex items-center gap-1 text-slate-500">
                                <MessageSquare className="w-3 h-3" /> {q.answersCount} answers
                              </span>
                              <span className="flex items-center gap-1 text-slate-500">
                                <ThumbsUp className="w-3 h-3" /> {q.likesCount}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* NOTES TAB (Udemy Signature feature with timestamp) */}
            {activeTab === "notes" && (
              <div className="space-y-6">
                {/* Note creation input */}
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
                  {!isAddingNote ? (
                    <button
                      type="button"
                      onClick={() => setIsAddingNote(true)}
                      className="w-full flex items-center justify-between p-3 text-xs text-slate-500 bg-white border border-slate-200 rounded-lg hover:border-purple-300 hover:text-purple-600 transition-colors cursor-pointer"
                    >
                      <span>Create a new note at {formatDuration(currentVideoTime)}...</span>
                      <Plus className="w-4 h-4" />
                    </button>
                  ) : (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 text-xs font-mono font-bold text-purple-700 bg-purple-100 rounded">
                          {formatDuration(currentVideoTime)}
                        </span>
                        <span className="text-xs text-slate-500 truncate">
                          {activeLesson.title}
                        </span>
                      </div>
                      <textarea
                        value={newNoteText}
                        onChange={(e) => setNewNoteText(e.target.value)}
                        placeholder="Write your note here..."
                        autoFocus
                        className="w-full h-24 p-3 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-purple-600 font-kantumruy"
                      />
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setIsAddingNote(false);
                            setNewNoteText("");
                          }}
                          className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-200 rounded"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={handleAddNote}
                          disabled={!newNoteText.trim()}
                          className="px-4 py-1.5 text-xs font-semibold text-white bg-purple-600 hover:bg-purple-700 rounded disabled:opacity-40 cursor-pointer"
                        >
                          Save note
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Notes List */}
                <div className="space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Saved Notes ({notes.length})
                  </h3>
                  {notes.length === 0 ? (
                    <p className="p-8 text-xs text-center text-slate-400">
                      Click "Create a new note" to take notes tied to specific timestamps in the video.
                    </p>
                  ) : (
                    notes.map((note) => (
                      <div
                        key={note.id}
                        className="flex items-start justify-between gap-4 p-3.5 bg-white border border-slate-200 rounded-xl hover:shadow-xs transition-shadow"
                      >
                        <div className="flex items-start gap-3">
                          {/* Clickable timestamp badge */}
                          <button
                            type="button"
                            onClick={() => seekToTime(note.timestamp)}
                            className="flex items-center gap-1 px-2.5 py-1 text-xs font-mono font-bold text-white bg-purple-600 rounded-md hover:bg-purple-700 transition-colors cursor-pointer shrink-0"
                            title="Jump video to this timestamp"
                          >
                            <Play className="w-3 h-3 fill-current" />
                            <span>{note.timestampFormatted}</span>
                          </button>
                          <div>
                            <p className="text-xs font-semibold text-slate-500">
                              {note.lessonTitle}
                            </p>
                            <p className="mt-1 text-xs text-slate-800 font-kantumruy whitespace-pre-wrap">
                              {note.text}
                            </p>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleDeleteNote(note.id)}
                          className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors"
                          title="Delete note"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* ANNOUNCEMENTS TAB */}
            {activeTab === "announcements" && (
              <div className="space-y-4">
                <h3 className="text-base font-bold text-slate-900">Instructor Announcements</h3>
                <div className="p-5 border border-slate-200 rounded-xl bg-slate-50/50 space-y-2">
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span className="font-semibold text-slate-800">
                      {currentCourse?.instructors?.[0]?.name || "Course Mentor"}
                    </span>
                    <span>Posted 1 week ago</span>
                  </div>
                  <h4 className="text-sm font-bold text-slate-900">
                    Welcome to the Course!
                  </h4>
                  <p className="text-xs text-slate-600 leading-relaxed font-kantumruy">
                    Welcome everyone to this training program. Make sure to download the required tools and check out the curriculum tasks. If you have questions, post them in the Q&A tab!
                  </p>
                </div>
              </div>
            )}

            {/* RESOURCES TAB */}
            {activeTab === "resources" && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-base font-bold text-slate-900">Lecture Attachments & Documents</h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Download documents and learning materials attached specifically to this lecture.
                  </p>
                </div>

                {/* Lecture Documents List */}
                {activeLesson.documents && activeLesson.documents.length > 0 ? (
                  <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden shadow-2xs bg-white">
                    {activeLesson.documents.map((doc) => {
                      const isPdf =
                        doc.fileType?.toLowerCase() === "pdf" ||
                        doc.title.toLowerCase().endsWith(".pdf");

                      return (
                        <div
                          key={doc.id}
                          className="flex items-center justify-between p-4 bg-white hover:bg-slate-50/80 transition-colors"
                        >
                          <div className="flex items-center gap-3 min-w-0 pr-4">
                            <div
                              className={`p-2 rounded-lg shrink-0 ${
                                isPdf
                                  ? "bg-rose-100 text-rose-600"
                                  : "bg-purple-100 text-purple-600"
                              }`}
                            >
                              <FileText className="w-5 h-5" />
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs font-semibold text-slate-800 truncate" title={doc.title}>
                                {doc.title}
                              </p>
                              {doc.fileSize && (
                                <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                                  {doc.fileSize}
                                </p>
                              )}
                            </div>
                          </div>
                          <a
                            href={doc.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            download={doc.title}
                            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-purple-700 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors cursor-pointer shrink-0"
                            title="Download or view document"
                          >
                            <Download className="w-3.5 h-3.5" />
                            <span>Download</span>
                          </a>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="p-8 text-center border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/50">
                    <FileText className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <p className="text-sm font-medium text-slate-600">No attachments for this lecture</p>
                    <p className="text-xs text-slate-400 mt-1">
                      Check back later if the instructor adds supplemental notes or slides.
                    </p>
                  </div>
                )}

                {/* Supplementary Course-level Resources */}
                {currentCourse?.learningResources && currentCourse.learningResources.length > 0 && (
                  <div className="pt-4 border-t border-slate-200 space-y-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      Course Reference Links
                    </h4>
                    <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden bg-white">
                      {currentCourse.learningResources.map((res, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between p-3.5 bg-white hover:bg-slate-50 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <BookOpen className="w-4 h-4 text-indigo-600" />
                            <p className="text-xs font-medium text-slate-800">{res.title}</p>
                          </div>
                          {res.url && (
                            <a
                              href={res.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-2.5 py-1 text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded transition-colors"
                            >
                              Open Link
                            </a>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* ========================================================================= */}
        {/* ── 3. UDEMY RIGHT SIDEBAR (COURSE CONTENT PLAYLIST) ── */}
        {/* ========================================================================= */}
        {isSidebarOpen && (
          <aside className="flex flex-col h-full bg-white border-l border-slate-200 w-80 md:w-96 lg:w-[400px] shrink-0 overflow-hidden shadow-sm transition-all duration-300">
            {/* Sidebar Header */}
            <div className="flex items-center justify-between px-4 py-3.5 bg-white border-b border-slate-200 shrink-0">
              <h3 className="text-base font-normal text-slate-900 font-kantumruy">
                Course content
              </h3>
              <button
                type="button"
                onClick={() => setIsSidebarOpen(false)}
                className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors cursor-pointer"
                title="Close course content"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Course Content Accordions List */}
            <div className="flex-1 overflow-y-auto divide-y divide-slate-200 bg-white">
              {chapters.map((chapter, chIdx) => {
                const isExpanded = expandedChapterIds.includes(chapter.id);
                const chLessons = chapter.lessons || [];
                const chCompletedCount = chLessons.filter(
                  (l) => (l.progressPercentage || 0) === 100
                ).length;

                return (
                  <div key={chapter.id} className="bg-white">
                    {/* Chapter Header Accordion Button */}
                    <button
                      type="button"
                      onClick={() => toggleChapter(chapter.id)}
                      className="flex items-start justify-between w-full p-4 text-left transition-colors bg-slate-50/80 hover:bg-slate-100/80 border-b border-slate-200/60 cursor-pointer"
                    >
                      <div className="flex-1 pr-3">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-normal text-slate-900 font-kantumruy">
                            {formatKhmerChapterTitle(chapter.title, chIdx)}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-500 font-mono">
                          <span>
                            {chCompletedCount} / {chLessons.length}
                          </span>
                          <span>•</span>
                          <span>{chLessons.length} lectures</span>
                        </div>
                      </div>

                      <div className="mt-0.5 text-slate-400">
                        {isExpanded ? (
                          <ChevronDown className="w-4 h-4" />
                        ) : (
                          <ChevronRight className="w-4 h-4" />
                        )}
                      </div>
                    </button>

                    {/* Chapter Lessons List */}
                    {isExpanded && (
                      <div className="divide-y divide-slate-100">
                        {chLessons.map((lesson, lIdx) => {
                          const isActive = String(lesson.id) === String(activeLesson?.id);
                          const isCompleted = (lesson.progressPercentage || 0) === 100;

                          return (
                            <div
                              key={lesson.id}
                              onClick={() => setActiveLesson(lesson)}
                              className={`flex items-start gap-3 p-3.5 transition-all cursor-pointer ${
                                isActive
                                  ? "bg-purple-50/80 border-l-4 border-purple-700"
                                  : "hover:bg-slate-50 border-l-4 border-transparent"
                              }`}
                            >
                              {/* Strict Verification Status Indicator */}
                              <div
                                className={`mt-0.5 w-4 h-4 rounded flex items-center justify-center transition-all shrink-0 ${
                                  isCompleted
                                    ? "bg-emerald-600 text-white shadow-xs"
                                    : (lesson.progressPercentage || 0) > 0
                                    ? "border-2 border-amber-500 bg-amber-50/60 text-amber-600"
                                    : "border border-slate-300 bg-white text-slate-400"
                                }`}
                                title={
                                  isCompleted
                                    ? "Verified Complete (100%)"
                                    : (lesson.progressPercentage || 0) > 0
                                    ? `In Progress (${lesson.progressPercentage}%) - Watch to 90% to complete`
                                    : "Strict Verification: Watch video to complete"
                                }
                              >
                                {isCompleted ? (
                                  <Check className="w-3 h-3 stroke-[3]" />
                                ) : (lesson.progressPercentage || 0) > 0 ? (
                                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                                ) : (
                                  <Lock className="w-2.5 h-2.5 text-slate-400" />
                                )}
                              </div>

                              {/* Lesson Content Info */}
                              <div className="flex-1 min-w-0">
                                <p
                                  className={`text-sm leading-snug font-kantumruy font-normal ${
                                    isActive
                                      ? "text-purple-950"
                                      : "text-slate-800"
                                  }`}
                                >
                                  {formatKhmerLessonTitle(lesson.title, lIdx)}
                                </p>

                                <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-500 font-mono">
                                  <span className="flex items-center gap-1">
                                    <Play className="w-2.5 h-2.5 text-slate-400 fill-slate-400" />
                                    {lesson.duration || "N/A"}
                                  </span>
                                  {lesson.progressPercentage !== undefined && lesson.progressPercentage > 0 && lesson.progressPercentage < 100 && (
                                    <span className="text-amber-600 font-semibold">
                                      ({lesson.progressPercentage}%)
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}
