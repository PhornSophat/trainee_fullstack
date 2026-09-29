import { useState, useEffect, useRef } from "react";
import {
    GripVertical,
    FileText,
    MoreVertical,
    Trash2,
    Edit2,
    Plus,
    Loader2,
    AlertTriangle,
    SquarePen,
    Upload,
    Play,
    Eye,
    Download,
} from "lucide-react";
import type { CourseCardItem, Chapter, Lesson, LessonDocument } from "@/types/course";
import {
    getCourseDetails,
    createChapterApi,
    updateChapterApi,
    deleteChapterApi,
    createLessonApi,
    deleteLessonApi,
    updateLessonApi,
    addLessonDocumentApi,
    deleteLessonDocumentApi,
} from "@/services/courseService";
import { supabase } from "@/lib/supabaseClient";
import MuxPlayer from "@mux/mux-player-react";
import { EditLessonDrawerContent } from "./EditLessonDrawerContent";
import { EditChapterDrawerContent } from "./EditChapterDrawerContent";
import { DocumentCard } from "./DocumentCard";
import { useToastStore } from "@/store/useToastStore";
import { getMuxPlaybackId, getYouTubeEmbedUrl } from "@/lib/videoUtils";
import { formatKhmerLessonTitle, formatKhmerChapterTitle } from "@/lib/khmerUtils";

function formatBytes(bytes: number, decimals = 1): string {
    if (!bytes || bytes === 0) return "0 B";
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

interface CurriculumDrawerContentProps {
    course: CourseCardItem;
    selectedChapter: Chapter | null;
    onSelectChapter: (chapter: Chapter | null) => void;
    selectedLesson: Lesson | null;
    onSelectLesson: (lesson: Lesson | null) => void;
    isAddChapterOpen: boolean;
    setIsAddChapterOpen: (open: boolean) => void;
    isAddLessonOpen: boolean;
    setIsAddLessonOpen: (open: boolean) => void;
    editingChapter?: Chapter | null;
    setEditingChapter?: (chapter: Chapter | null) => void;
    editingLesson?: Lesson | null;
    setEditingLesson?: (lesson: Lesson | null) => void;
}

export function CurriculumDrawerContent({
    course,
    selectedChapter,
    onSelectChapter,
    selectedLesson,
    onSelectLesson,
    isAddChapterOpen,
    setIsAddChapterOpen,
    isAddLessonOpen,
    setIsAddLessonOpen,
    editingChapter,
    setEditingChapter,
    editingLesson,
    setEditingLesson,
}: CurriculumDrawerContentProps) {
    const showToast = useToastStore((s) => s.showToast);
    const [chapters, setChapters] = useState<Chapter[]>([]);
    const [loading, setLoading] = useState(true);

    // Chapter 3-dot dropdown menu
    const [activeChapterMenuId, setActiveChapterMenuId] = useState<string | number | null>(null);
    const chapterMenuRef = useRef<HTMLDivElement>(null);

    // Lesson 3-dot dropdown menu
    const [activeLessonMenuId, setActiveLessonMenuId] = useState<string | number | null>(null);
    const lessonMenuRef = useRef<HTMLDivElement>(null);

    // Editing state (passed from CourseDetailDrawer to sync with header or local fallback)
    const [internalEditingChapter, setInternalEditingChapter] = useState<Chapter | null>(null);
    const [chapterToDelete, setChapterToDelete] = useState<Chapter | null>(null);
    const [isDeletingChapter, setIsDeletingChapter] = useState(false);

    const [internalEditingLesson, setInternalEditingLesson] = useState<Lesson | null>(null);
    const [lessonToDelete, setLessonToDelete] = useState<{ chapterId: string | number; lesson: Lesson } | null>(null);
    const [isDeletingLesson, setIsDeletingLesson] = useState(false);

    const activeEditingChapter = editingChapter !== undefined ? editingChapter : internalEditingChapter;
    const setActiveEditingChapter = setEditingChapter || setInternalEditingChapter;

    const activeEditingLesson = editingLesson !== undefined ? editingLesson : internalEditingLesson;
    const setActiveEditingLesson = setEditingLesson || setInternalEditingLesson;

    // Modals in Lesson Detail View
    const [isEditObjectiveOpen, setIsEditObjectiveOpen] = useState(false);
    const [isEditVideoOpen, setIsEditVideoOpen] = useState(false);

    // Document upload state
    const [isUploadingDoc, setIsUploadingDoc] = useState(false);
    const [docUploadProgress, setDocUploadProgress] = useState(0);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [documentToDelete, setDocumentToDelete] = useState<LessonDocument | null>(null);
    const [isDeletingDoc, setIsDeletingDoc] = useState(false);

    // Click outside listener for dropdown menus
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (chapterMenuRef.current && !chapterMenuRef.current.contains(e.target as Node)) {
                setActiveChapterMenuId(null);
            }
            if (lessonMenuRef.current && !lessonMenuRef.current.contains(e.target as Node)) {
                setActiveLessonMenuId(null);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Load curriculum data from API
    const loadCurriculum = async () => {
        try {
            setLoading(true);
            const data = await getCourseDetails(course.id);
            setChapters(data);
        } catch (err) {
            console.error("Failed to load curriculum:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadCurriculum();
    }, [course.id]);

    // Current active chapter
    const currentChapter = selectedChapter
        ? chapters.find((c) => String(c.id) === String(selectedChapter.id)) || selectedChapter
        : null;

    // Current active lesson
    const currentLesson = selectedLesson && currentChapter
        ? currentChapter.lessons?.find((l) => String(l.id) === String(selectedLesson.id)) || selectedLesson
        : selectedLesson;

    // Handler to create a new chapter
    const handleCreateChapter = async (title: string) => {
        const formattedTitle = formatKhmerChapterTitle(title, chapters.length);
        const created = await createChapterApi(course.id, formattedTitle);
        setChapters((prev) => [...prev, created]);
        setIsAddChapterOpen(false);
    };

    // Handler to update an existing chapter
    const handleUpdateChapter = async (title: string) => {
        if (!activeEditingChapter) return;
        try {
            const chIdx = chapters.findIndex((c) => c.id === activeEditingChapter.id);
            const formattedTitle = formatKhmerChapterTitle(title, chIdx >= 0 ? chIdx : 0);
            const updated = await updateChapterApi(activeEditingChapter.id, formattedTitle);
            setChapters((prev) =>
                prev.map((c) => (c.id === activeEditingChapter.id ? { ...c, title: updated.title } : c))
            );
            if (selectedChapter && selectedChapter.id === activeEditingChapter.id) {
                onSelectChapter({ ...selectedChapter, title: updated.title });
            }
            showToast("កែប្រែជំពូកជោគជ័យ!", "success");
        } catch (err) {
            console.error("Failed to update chapter:", err);
            showToast("បរាជ័យក្នុងការកែប្រែជំពូក", "error");
        } finally {
            setActiveEditingChapter(null);
        }
    };

    // Handler to delete a chapter
    const handleDeleteChapter = async () => {
        if (!chapterToDelete) return;
        try {
            setIsDeletingChapter(true);
            await deleteChapterApi(chapterToDelete.id);
            setChapters((prev) => prev.filter((c) => c.id !== chapterToDelete.id));
            if (selectedChapter && selectedChapter.id === chapterToDelete.id) {
                onSelectChapter(null);
                onSelectLesson(null);
            }
            setChapterToDelete(null);
        } catch (err) {
            console.error("Failed to delete chapter:", err);
            alert("បរាជ័យក្នុងការលុបជំពូក");
        } finally {
            setIsDeletingChapter(false);
        }
    };

    // Handler to create a lesson
    const handleCreateLesson = async (data: {
        title: string;
        description?: string;
        duration?: string;
        videoUrl: string;
        playbackId?: string;
    }) => {
        if (!currentChapter) return;
        try {
            const currentLessonsCount = currentChapter.lessons?.length || 0;
            const formattedTitle = formatKhmerLessonTitle(data.title, currentLessonsCount);
            const extractedMux = getMuxPlaybackId(data.playbackId?.trim(), data.videoUrl?.trim());
            const newLesson = await createLessonApi(currentChapter.id, {
                title: formattedTitle,
                description: data.description,
                duration: data.duration || '',
                type: "video",
                videoUrl: data.videoUrl,
                playbackId: extractedMux || data.playbackId,
            });

            setChapters((prev) =>
                prev.map((ch) => {
                    if (String(ch.id) === String(currentChapter.id)) {
                        const updatedLessons = [...(ch.lessons || []), newLesson];
                        return { ...ch, lessons: updatedLessons };
                    }
                    return ch;
                })
            );
            showToast("បានបន្ថែមមេរៀនជោគជ័យ!", "success");
        } catch (err) {
            console.error("Failed to create lesson:", err);
            showToast("បរាជ័យក្នុងការបន្ថែមមេរៀន", "error");
        } finally {
            setIsAddLessonOpen(false);
        }
    };

    // Handler to update a lesson
    const handleUpdateLessonData = async (lessonId: string | number, data: Partial<Lesson>) => {
        try {
            const lIdx = currentChapter?.lessons?.findIndex((l) => String(l.id) === String(lessonId)) ?? 0;
            const formattedTitle = data.title !== undefined ? formatKhmerLessonTitle(data.title, lIdx >= 0 ? lIdx : 0) : undefined;
            const updated = await updateLessonApi(lessonId, {
                title: formattedTitle !== undefined ? formattedTitle : data.title,
                description: data.description,
                duration: data.duration,
                videoUrl: data.videoUrl,
                playbackId: data.playbackId,
            });

            setChapters((prev) =>
                prev.map((ch) => ({
                    ...ch,
                    lessons: (ch.lessons || []).map((l) =>
                        String(l.id) === String(lessonId) ? { ...l, ...updated } : l
                    ),
                }))
            );

            if (selectedLesson && String(selectedLesson.id) === String(lessonId)) {
                onSelectLesson({ ...selectedLesson, ...updated });
            }
            showToast("កែប្រែមេរៀនជោគជ័យ!", "success");
        } catch (err) {
            console.error("Failed to update lesson:", err);
            showToast("បរាជ័យក្នុងការកែប្រែមេរៀន", "error");
        } finally {
            setActiveEditingLesson(null);
        }
    };

    // Handler to delete a lesson
    const handleDeleteLesson = async () => {
        if (!lessonToDelete) return;
        try {
            setIsDeletingLesson(true);
            await deleteLessonApi(lessonToDelete.lesson.id);
            setChapters((prev) =>
                prev.map((ch) => {
                    if (String(ch.id) === String(lessonToDelete.chapterId)) {
                        return {
                            ...ch,
                            lessons: ch.lessons.filter((l) => l.id !== lessonToDelete.lesson.id),
                        };
                    }
                    return ch;
                })
            );
            if (selectedLesson && selectedLesson.id === lessonToDelete.lesson.id) {
                onSelectLesson(null);
            }
            setLessonToDelete(null);
        } catch (err) {
            console.error("Failed to delete lesson:", err);
            alert("បរាជ័យក្នុងការលុបមេរៀន");
        } finally {
            setIsDeletingLesson(false);
        }
    };

    // Handler to upload document file to Supabase and save to lesson
    const handleDocumentFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !currentLesson) return;

        // Reset file input so user can re-upload if needed
        e.target.value = "";

        if (file.size > 50 * 1024 * 1024) {
            showToast("ទំហំឯកសារមិនត្រូវលើសពី 50MB ទេ", "error");
            return;
        }

        let progressTimer: ReturnType<typeof setInterval> | null = null;
        try {
            setIsUploadingDoc(true);
            setDocUploadProgress(15);

            progressTimer = setInterval(() => {
                setDocUploadProgress((prev) => {
                    if (prev < 75) return prev + Math.floor(Math.random() * 10 + 5);
                    if (prev < 90) return prev + 2;
                    return prev;
                });
            }, 120);

            const ext = file.name.split(".").pop()?.toLowerCase() || "file";
            const sanitizedTitle = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
            const filePath = `lesson-documents/lesson-${currentLesson.id}-${Date.now()}-${sanitizedTitle}`;

            const { error: uploadError } = await supabase.storage
                .from("images of TMS")
                .upload(filePath, file, { upsert: true });

            if (uploadError) throw uploadError;

            const { data: publicUrlData } = supabase.storage
                .from("images of TMS")
                .getPublicUrl(filePath);

            const publicUrl = publicUrlData.publicUrl;

            // Save document record in PostgreSQL via NestJS backend
            const createdDoc = await addLessonDocumentApi(currentLesson.id, {
                title: file.name,
                fileUrl: publicUrl,
                fileType: ext,
                fileSize: formatBytes(file.size),
            });

            // Update local curriculum chapters state
            setChapters((prev) =>
                prev.map((ch) => ({
                    ...ch,
                    lessons: (ch.lessons || []).map((l) =>
                        String(l.id) === String(currentLesson.id)
                            ? {
                                  ...l,
                                  documents: [...(l.documents || []), createdDoc],
                              }
                            : l
                    ),
                }))
            );

            // Also update selectedLesson state so detail drawer reflects it immediately
            if (selectedLesson && String(selectedLesson.id) === String(currentLesson.id)) {
                onSelectLesson({
                    ...selectedLesson,
                    documents: [...(selectedLesson.documents || []), createdDoc],
                });
            }

            if (progressTimer) clearInterval(progressTimer);
            setDocUploadProgress(100);
            showToast("បានបញ្ចូលឯកសារជោគជ័យ!", "success");
        } catch (err: any) {
            if (progressTimer) clearInterval(progressTimer);
            console.error("Failed to upload document:", err);
            showToast(err.message || "បរាជ័យក្នុងការបញ្ចូលឯកសារ", "error");
        } finally {
            setTimeout(() => {
                setIsUploadingDoc(false);
                setDocUploadProgress(0);
            }, 300);
        }
    };

    // Handler to delete a lesson document with verification modal
    const handleConfirmDeleteDocument = async () => {
        if (!documentToDelete) return;
        try {
            setIsDeletingDoc(true);
            await deleteLessonDocumentApi(documentToDelete.id);

            // Update chapters state
            setChapters((prev) =>
                prev.map((ch) => ({
                    ...ch,
                    lessons: (ch.lessons || []).map((l) =>
                        String(l.id) === String(currentLesson?.id)
                            ? {
                                  ...l,
                                  documents: (l.documents || []).filter(
                                      (d) => String(d.id) !== String(documentToDelete.id)
                                  ),
                              }
                            : l
                    ),
                }))
            );

            // Also update selectedLesson state
            if (selectedLesson && String(selectedLesson.id) === String(currentLesson?.id)) {
                onSelectLesson({
                    ...selectedLesson,
                    documents: (selectedLesson.documents || []).filter(
                        (d) => String(d.id) !== String(documentToDelete.id)
                    ),
                });
            }

            showToast("បានលុបឯកសារជោគជ័យ!", "success");
            setDocumentToDelete(null);
        } catch (err: any) {
            console.error("Failed to delete document:", err);
            showToast("បរាជ័យក្នុងការលុបឯកសារ", "error");
        } finally {
            setIsDeletingDoc(false);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center flex-1 h-64 text-slate-400 font-kantumruy">
                <Loader2 className="w-7 h-7 animate-spin text-cyan-600 mb-2" />
                <span className="text-sm">កំពុងផ្ទុកមេរៀន (Loading Curriculum)...</span>
            </div>
        );
    }

    // =========================================================================
    // ADD LESSON DRAWER VIEW (Matching edit style)
    // =========================================================================
    if (isAddLessonOpen && currentChapter) {
        return (
            <EditLessonDrawerContent
                onSave={async (data) => {
                    await handleCreateLesson(data);
                }}
                onCancel={() => setIsAddLessonOpen(false)}
            />
        );
    }

    // =========================================================================
    // EDIT LESSON DRAWER VIEW (Matching mockup style)
    // =========================================================================
    if (activeEditingLesson) {
        return (
            <EditLessonDrawerContent
                lesson={activeEditingLesson}
                onSave={async (data) => {
                    await handleUpdateLessonData(activeEditingLesson.id, data);
                    setActiveEditingLesson(null);
                }}
                onCancel={() => setActiveEditingLesson(null)}
            />
        );
    }

    // =========================================================================
    // EDIT CHAPTER DRAWER VIEW (Matching mockup style)
    // =========================================================================
    if (activeEditingChapter) {
        return (
            <EditChapterDrawerContent
                chapter={activeEditingChapter}
                onSave={async (title) => {
                    await handleUpdateChapter(title);
                    setActiveEditingChapter(null);
                }}
                onCancel={() => setActiveEditingChapter(null)}
            />
        );
    }

    // =========================================================================
    // LEVEL 3: LESSON DETAIL VIEW (Objective, Documents, Video)
    // =========================================================================
    if (currentLesson) {
        const muxPlaybackId = getMuxPlaybackId(currentLesson.playbackId, currentLesson.videoUrl);
        const youtubeEmbedUrl = getYouTubeEmbedUrl(currentLesson.videoUrl);

        return (
            <div className="flex-1 min-h-0 overflow-y-auto font-kantumruy">
                {/* SECTION 1: OBJECTIVE (គោលបំណង) */}
                <section className="px-6 py-5 border-b border-slate-100">
                    <div className="flex items-center justify-between mb-2.5">
                        <h3 className="text-sm font-bold text-[#60738d]">
                            គោលបំណង
                        </h3>
                        <button
                            type="button"
                            onClick={() => setActiveEditingLesson(currentLesson)}
                            className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded transition-colors cursor-pointer"
                            title="កែប្រែមេរៀន"
                        >
                            <SquarePen className="w-4 h-4" />
                        </button>
                    </div>
                    <p className="text-sm text-slate-600 leading-relaxed">
                        {currentLesson.description ||
                            "Understand the program structure, expected outcomes, project workflow, and how each lesson connects to the final practical assignment."}
                    </p>
                </section>

                {/* SECTION 2: DOCUMENTS (ឯកសារ) */}
                <section className="px-6 py-5 border-b border-slate-100">
                    <div className="flex items-center justify-between mb-3.5">
                        <div className="flex items-center gap-2">
                            <h3 className="text-sm font-bold text-[#60738d]">
                                ឯកសារ ({(currentLesson.documents || []).length})
                            </h3>
                            <span className="text-xs text-slate-400">
                                • PDF, Docx, Slides, etc.
                            </span>
                        </div>
                    </div>

                    {/* Hidden file input for document selection */}
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleDocumentFileSelect}
                        className="hidden"
                        accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt,.zip"
                    />

                    <div className="flex items-start gap-4 flex-wrap">
                        {/* Upload / Add Card */}
                        <button
                            type="button"
                            disabled={isUploadingDoc}
                            onClick={() => fileInputRef.current?.click()}
                            className="flex flex-col items-center justify-center w-28 h-36 border-2 border-dashed border-slate-200 rounded-xl hover:border-cyan-500 hover:bg-cyan-50/20 cursor-pointer transition-all bg-white group disabled:opacity-50 shrink-0"
                            title="ចុចដើម្បីបន្ថែមឯកសារថ្មី (Upload document)"
                        >
                            {isUploadingDoc ? (
                                <div className="flex flex-col items-center gap-1.5 p-2">
                                    <Loader2 className="w-6 h-6 text-cyan-600 animate-spin" />
                                    <span className="text-[11px] font-medium text-cyan-600 text-center leading-tight">
                                        {docUploadProgress > 0 ? `${docUploadProgress}%` : "កំពុងបញ្ចូល..."}
                                    </span>
                                </div>
                            ) : (
                                <>
                                    <Upload className="w-6 h-6 text-slate-400 group-hover:text-cyan-600 transition-colors mb-2" />
                                    <span className="text-xs font-semibold text-slate-600 group-hover:text-cyan-700">
                                        បន្ថែម
                                    </span>
                                </>
                            )}
                        </button>

                        {/* Uploaded Documents Cards with First Page Preview */}
                        {(currentLesson.documents || []).map((doc) => (
                            <DocumentCard
                                key={doc.id}
                                doc={doc}
                                onDelete={(d) => setDocumentToDelete(d)}
                            />
                        ))}
                    </div>
                </section>

                {/* SECTION 3: VIDEO (វីដេអូ) */}
                <section className="px-6 py-5">
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                            <h3 className="text-sm font-bold text-[#60738d]">
                                វីដេអូ
                            </h3>
                        </div>
                        <button
                            type="button"
                            onClick={() => setActiveEditingLesson(currentLesson)}
                            className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded transition-colors cursor-pointer"
                            title="កែប្រែមេរៀន"
                        >
                            <SquarePen className="w-4 h-4" />
                        </button>
                    </div>

                    {/* Responsive Video Player (Mux Player / YouTube / HTML5 / Preview) */}
                    {muxPlaybackId ? (
                        <div className="w-full aspect-video rounded-2xl overflow-hidden shadow-sm border border-slate-200 bg-black">
                            <MuxPlayer
                                playbackId={muxPlaybackId}
                                streamType="on-demand"
                                metadata={{
                                    video_id: String(currentLesson.id),
                                    video_title: currentLesson.title,
                                }}
                                style={{ width: "100%", height: "100%" }}
                            />
                        </div>
                    ) : youtubeEmbedUrl ? (
                        <div className="w-full aspect-video rounded-2xl overflow-hidden shadow-sm border border-slate-200 bg-slate-950">
                            <iframe
                                src={youtubeEmbedUrl}
                                title={currentLesson.title}
                                className="w-full h-full"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                            />
                        </div>
                    ) : currentLesson.videoUrl ? (
                        <div className="w-full aspect-video rounded-2xl overflow-hidden shadow-sm border border-slate-200 bg-black">
                            <video
                                src={currentLesson.videoUrl}
                                controls
                                className="w-full h-full object-contain"
                            />
                        </div>
                    ) : (
                        <div
                            onClick={() => setActiveEditingLesson(currentLesson)}
                            className="relative w-full aspect-video rounded-2xl overflow-hidden shadow-sm border border-slate-200 bg-slate-900 group cursor-pointer"
                        >
                            <img
                                src="https://img.youtube.com/vi/mjXLt97_Cr8/maxresdefault.jpg"
                                alt="Guitar Theory Course for Beginners"
                                className="w-full h-full object-cover group-hover:scale-[1.01] transition-transform duration-300"
                                onError={(e) => {
                                    (e.target as HTMLImageElement).src =
                                        "https://img.youtube.com/vi/mjXLt97_Cr8/hqdefault.jpg";
                                }}
                            />
                            {/* Video Title Header Overlay matching YouTube */}
                            <div className="absolute inset-x-0 top-0 p-3 bg-gradient-to-b from-black/80 via-black/30 to-transparent flex items-start gap-2.5">
                                <div className="w-7 h-7 rounded-full bg-slate-900 border border-slate-700 overflow-hidden flex items-center justify-center shrink-0">
                                    <span className="text-[10px] font-bold text-white font-mono">(A)</span>
                                </div>
                                <div className="min-w-0 flex-1">
                                    <h4 className="text-xs font-semibold text-white truncate drop-shadow-xs">
                                        Guitar Theory Course for Beginners – Learn Fretbo...
                                    </h4>
                                    <p className="text-[10px] text-slate-300">
                                        freeCodeCamp.org
                                    </p>
                                </div>
                            </div>

                            {/* Center Red YouTube Play Button */}
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                <div className="w-16 h-11 bg-red-600 group-hover:bg-red-700 rounded-2xl flex items-center justify-center shadow-lg transition-transform group-hover:scale-110">
                                    <Play className="w-5 h-5 text-white fill-white ml-0.5" />
                                </div>
                            </div>

                            {/* Watch on YouTube button on bottom-right */}
                            <div className="absolute bottom-3 right-3 bg-black/60 hover:bg-black/80 backdrop-blur-xs px-3 py-1.5 rounded-lg flex items-center gap-1.5 text-xs font-medium text-white shadow-sm border border-white/10 transition-colors">
                                <span>Watch on</span>
                                <span className="font-bold tracking-tight text-white">YouTube</span>
                            </div>
                        </div>
                    )}
                </section>

                {/* EDIT OBJECTIVE MODAL */}
                <EditObjectiveModal
                    isOpen={isEditObjectiveOpen}
                    initialDescription={currentLesson.description || ""}
                    onClose={() => setIsEditObjectiveOpen(false)}
                    onSave={(desc) => handleUpdateLessonData(currentLesson.id, { description: desc })}
                />

                {/* EDIT VIDEO / MUX MODAL */}
                <EditVideoModal
                    isOpen={isEditVideoOpen}
                    initialPlaybackId={currentLesson.playbackId || ""}
                    initialUrl={currentLesson.videoUrl || ""}
                    onClose={() => setIsEditVideoOpen(false)}
                    onSave={(data) => handleUpdateLessonData(currentLesson.id, data)}
                />

                {/* DELETE DOCUMENT CONFIRMATION */}
                {documentToDelete && (
                    <DeleteConfirmationModal
                        isOpen={documentToDelete !== null}
                        title="លុបឯកសារ? (Delete File)"
                        description={`តើអ្នកពិតជាចង់លុបឯកសារ "${documentToDelete.title}" នេះចេញពីមេរៀនមែនទេ?`}
                        isDeleting={isDeletingDoc}
                        onClose={() => setDocumentToDelete(null)}
                        onConfirm={handleConfirmDeleteDocument}
                    />
                )}
            </div>
        );
    }

    // =========================================================================
    // LEVEL 2: CHAPTER LESSONS LIST
    // =========================================================================
    if (currentChapter) {
        const lessons = currentChapter.lessons || [];

        return (
            <div className="flex-1 min-h-0 overflow-y-auto px-6 py-5 font-kantumruy">
                {/* Heading */}
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-bold text-[#60738d]">
                        Lessons
                    </h3>
                    <span className="text-xs text-slate-400 font-medium">
                        {lessons.length} lessons
                    </span>
                </div>

                {/* Lessons List */}
                {lessons.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16">
                        <div className="flex items-center justify-center w-12 h-12 text-cyan-600 mb-3">
                            <FileText className="w-6 h-6" />
                        </div>
                        <p className="text-sm font-semibold text-slate-700 mb-1">
                            មិនទាន់មានមេរៀនក្នុងជំពូកនេះទេ
                        </p>
                        <p className="text-xs text-slate-400 mb-4 text-center max-w-xs">
                            No lessons yet in this chapter. Click below to add the first lesson.
                        </p>
                        <button
                            type="button"
                            onClick={() => setIsAddLessonOpen(true)}
                            className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white rounded-lg bg-cyan-600 hover:bg-cyan-700 shadow-sm transition-colors"
                        >
                            <Plus className="w-4 h-4" />
                            <span>បន្ថែមមេរៀន (Add Lesson)</span>
                        </button>
                    </div>
                ) : (
                    <div className="flex flex-col divide-y divide-slate-100 border-t border-b border-slate-100">
                        {lessons.map((lesson, lIdx) => (
                            <div
                                key={lesson.id}
                                onClick={() => onSelectLesson(lesson)}
                                className={`group flex items-center justify-between py-3.5 px-2 hover:bg-slate-50 transition-colors rounded-lg cursor-pointer relative ${
                                    activeLessonMenuId === lesson.id ? "bg-slate-50" : ""
                                }`}
                            >
                                {/* Left Side: Drag Grip + Lesson Title */}
                                <div className="flex items-center gap-3 min-w-0 pr-4">
                                    <GripVertical className="w-4 h-4 text-slate-300 group-hover:text-slate-400 shrink-0 cursor-grab" />
                                    <span className="text-sm font-medium text-slate-700 truncate">
                                        {formatKhmerLessonTitle(lesson.title, lIdx)}
                                    </span>
                                </div>

                                {/* Right Side: Duration & 3-Dots Action Button */}
                                <div className="flex items-center gap-5 shrink-0 text-xs text-slate-400">
                                    <span>{lesson.duration || "00:00"}</span>
                                    <div
                                        className="relative"
                                        ref={activeLessonMenuId === lesson.id ? lessonMenuRef : null}
                                    >
                                        <button
                                            type="button"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setActiveLessonMenuId(
                                                    activeLessonMenuId === lesson.id ? null : lesson.id
                                                );
                                            }}
                                            className="p-1 rounded text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition-colors"
                                            title="Actions"
                                        >
                                            <MoreVertical className="w-4 h-4" />
                                        </button>

                                        {/* Action Dropdown Popup */}
                                        {activeLessonMenuId === lesson.id && (
                                            <div
                                                onClick={(e) => e.stopPropagation()}
                                                className="absolute right-0 top-7 z-30 w-36 py-1.5 bg-white rounded-xl shadow-xl border border-slate-100 flex flex-col font-kantumruy animate-in fade-in zoom-in-95 duration-100"
                                            >
                                                {/* មើល */}
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setActiveLessonMenuId(null);
                                                        onSelectLesson(lesson);
                                                    }}
                                                    className="flex items-center gap-3 px-3.5 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors w-full text-left"
                                                >
                                                    <Eye className="w-4 h-4 text-slate-500 shrink-0" />
                                                    <span>មើល</span>
                                                </button>

                                                {/* កែប្រែ */}
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setActiveLessonMenuId(null);
                                                        setActiveEditingLesson(lesson);
                                                    }}
                                                    className="flex items-center gap-3 px-3.5 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors w-full text-left"
                                                >
                                                    <SquarePen className="w-4 h-4 text-slate-500 shrink-0" />
                                                    <span>កែប្រែ</span>
                                                </button>

                                                <div className="border-t border-slate-100 my-1" />

                                                {/* មេរៀន */}
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setActiveLessonMenuId(null);
                                                        if (lesson.videoUrl) {
                                                            window.open(lesson.videoUrl, "_blank");
                                                        } else {
                                                            onSelectLesson(lesson);
                                                        }
                                                    }}
                                                    className="flex items-center gap-3 px-3.5 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors w-full text-left"
                                                >
                                                    <Download className="w-4 h-4 text-slate-500 shrink-0" />
                                                    <span>មេរៀន</span>
                                                </button>

                                                <div className="border-t border-slate-100 my-1" />

                                                {/* លុប */}
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setActiveLessonMenuId(null);
                                                        setLessonToDelete({
                                                            chapterId: currentChapter.id,
                                                            lesson,
                                                        });
                                                    }}
                                                    className="flex items-center gap-3 px-3.5 py-2 text-sm text-red-500 hover:bg-red-50 transition-colors w-full text-left"
                                                >
                                                    <Trash2 className="w-4 h-4 text-red-500 shrink-0" />
                                                    <span>លុប</span>
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* DELETE LESSON CONFIRMATION */}
                {lessonToDelete && (
                    <DeleteConfirmationModal
                        isOpen={lessonToDelete !== null}
                        title="លុបមេរៀន? (Delete Lesson)"
                        description={`តើអ្នកពិតជាចង់លុបមេរៀន "${lessonToDelete.lesson.title}" មែនទេ?`}
                        isDeleting={isDeletingLesson}
                        onClose={() => setLessonToDelete(null)}
                        onConfirm={handleDeleteLesson}
                    />
                )}
            </div>
        );
    }

    // =========================================================================
    // LEVEL 1: CHAPTERS LIST
    // =========================================================================
    return (
        <div className="flex-1 min-h-0 overflow-y-auto px-6 py-5 font-kantumruy">
            {/* Heading */}
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-[#60738d]">
                    Chapters
                </h3>
                <span className="text-xs text-slate-400 font-medium">
                    {chapters.length} chapters
                </span>
            </div>

            {/* Chapters List */}
            {chapters.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
                    <div className="flex items-center justify-center w-12 h-12 rounded-full bg-cyan-50 text-cyan-600 mb-3">
                        <Plus className="w-6 h-6" />
                    </div>
                    <p className="text-sm font-semibold text-slate-700 mb-1">
                        មិនទាន់មានជំពូកនៅឡើយទេ
                    </p>
                    <p className="text-xs text-slate-400 mb-4 text-center max-w-xs">
                        No chapters yet. Click below to add the first chapter.
                    </p>
                    <button
                        type="button"
                        onClick={() => setIsAddChapterOpen(true)}
                        className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white rounded-lg bg-cyan-600 hover:bg-cyan-700 shadow-sm transition-colors"
                    >
                        <Plus className="w-4 h-4" />
                        <span>បន្ថែមជំពូកថ្មី (Add Chapter)</span>
                    </button>
                </div>
            ) : (
                <div className="flex flex-col divide-y divide-slate-100 border-t border-b border-slate-100">
                    {chapters.map((chapter, chIdx) => (
                        <div
                            key={chapter.id}
                            onClick={() => onSelectChapter(chapter)}
                            className={`group flex items-center justify-between py-3.5 px-2 hover:bg-slate-50 transition-colors rounded-lg cursor-pointer relative ${
                                activeChapterMenuId === chapter.id ? "bg-slate-50" : ""
                            }`}
                        >
                            {/* Left Side: Drag Grip + Chapter Title */}
                            <div className="flex items-center gap-3 min-w-0 pr-4">
                                <GripVertical className="w-4 h-4 text-slate-300 group-hover:text-slate-400 shrink-0 cursor-grab" />
                                <span className="text-sm font-medium text-slate-700 truncate font-kantumruy">
                                    {formatKhmerChapterTitle(chapter.title, chIdx)}
                                </span>
                            </div>

                            {/* Right Side: Lesson count, duration, 3 dots */}
                            <div className="flex items-center gap-5 shrink-0 text-xs text-slate-400">
                                {/* Lessons Count */}
                                <div className="flex items-center gap-1.5 text-slate-500">
                                    <FileText className="w-4 h-4 text-slate-400" />
                                    <span>{chapter.lessons?.length || 0} lessons</span>
                                </div>

                                {/* Duration Tag (matches 1d in screenshot) */}
                                <span className="w-6 text-right font-medium text-slate-400">
                                    1d
                                </span>

                                {/* 3-Dots Action Button */}
                                <div
                                    className="relative"
                                    ref={activeChapterMenuId === chapter.id ? chapterMenuRef : null}
                                >
                                    <button
                                        type="button"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setActiveChapterMenuId(
                                                activeChapterMenuId === chapter.id ? null : chapter.id
                                            );
                                        }}
                                        className="p-1 rounded text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition-colors"
                                        title="Actions"
                                    >
                                        <MoreVertical className="w-4 h-4" />
                                    </button>

                                    {/* Action Dropdown Popup */}
                                    {activeChapterMenuId === chapter.id && (
                                        <div
                                            onClick={(e) => e.stopPropagation()}
                                            className="absolute right-0 top-7 z-30 w-32 py-1.5 bg-white rounded-xl shadow-xl border border-slate-100 flex flex-col animate-in fade-in zoom-in-95 duration-100"
                                        >
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setActiveChapterMenuId(null);
                                                    setActiveEditingChapter(chapter);
                                                }}
                                                className="flex items-center gap-2.5 px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 transition-colors w-full text-left"
                                            >
                                                <Edit2 className="w-3.5 h-3.5 text-slate-500" />
                                                <span>កែប្រែ (Edit)</span>
                                            </button>

                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setActiveChapterMenuId(null);
                                                    setChapterToDelete(chapter);
                                                }}
                                                className="flex items-center gap-2.5 px-3 py-2 text-xs text-rose-500 hover:bg-rose-50 transition-colors w-full text-left"
                                            >
                                                <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                                                <span>លុប (Delete)</span>
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* ADD CHAPTER MODAL */}
            <ChapterModal
                isOpen={isAddChapterOpen}
                title="បន្ថែមជំពូកថ្មី (New Chapter)"
                onClose={() => setIsAddChapterOpen(false)}
                onSave={handleCreateChapter}
            />

            {/* DELETE CHAPTER CONFIRMATION */}
            {chapterToDelete && (
                <DeleteConfirmationModal
                    isOpen={chapterToDelete !== null}
                    title="លុបជំពូក? (Delete Chapter)"
                    description={`តើអ្នកពិតជាចង់លុបជំពូក "${chapterToDelete.title}" និងមេរៀនទាំងអស់ក្នុងជំពូកនេះមែនទេ?`}
                    isDeleting={isDeletingChapter}
                    onClose={() => setChapterToDelete(null)}
                    onConfirm={handleDeleteChapter}
                />
            )}
        </div>
    );
}

// ── Modals ─────────────────────────────────────────────────────────────

function EditObjectiveModal({
    isOpen,
    initialDescription,
    onClose,
    onSave,
}: {
    isOpen: boolean;
    initialDescription: string;
    onClose: () => void;
    onSave: (desc: string) => Promise<void>;
}) {
    const [desc, setDesc] = useState(initialDescription);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        setDesc(initialDescription);
    }, [initialDescription, isOpen]);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setSaving(true);
            await onSave(desc.trim());
            onClose();
        } finally {
            setSaving(false);
        }
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs font-kantumruy animate-in fade-in duration-150"
            onClick={onClose}
        >
            <form
                onSubmit={handleSubmit}
                onClick={(e) => e.stopPropagation()}
                className="w-full max-w-md p-6 bg-white rounded-2xl shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-150"
            >
                <h3 className="text-base font-semibold text-[#60738d] mb-4">
                    កែប្រែគោលបំណង (Edit Objective)
                </h3>

                <textarea
                    rows={4}
                    value={desc}
                    onChange={(e) => setDesc(e.target.value)}
                    placeholder="បញ្ចូលគោលបំណងមេរៀន..."
                    className="w-full p-3 text-sm border rounded-lg border-slate-300 focus:outline-none focus:border-cyan-600 text-slate-800 placeholder:text-slate-400 font-kantumruy mb-5 resize-none leading-relaxed"
                />

                <div className="flex justify-end gap-2.5">
                    <button
                        type="button"
                        disabled={saving}
                        onClick={onClose}
                        className="px-3.5 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                    >
                        បោះបង់ (Cancel)
                    </button>
                    <button
                        type="submit"
                        disabled={saving}
                        className="px-4 py-2 text-xs font-medium text-white bg-cyan-600 hover:bg-cyan-700 rounded-lg shadow-sm transition-colors flex items-center gap-1.5 disabled:opacity-50"
                    >
                        {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                        <span>រក្សាទុក (Save)</span>
                    </button>
                </div>
            </form>
        </div>
    );
}

function EditVideoModal({
    isOpen,
    initialPlaybackId = "",
    initialUrl = "",
    onClose,
    onSave,
}: {
    isOpen: boolean;
    initialPlaybackId?: string;
    initialUrl?: string;
    onClose: () => void;
    onSave: (data: { playbackId: string; videoUrl: string }) => Promise<void>;
}) {
    const [playbackId, setPlaybackId] = useState(initialPlaybackId);
    const [url, setUrl] = useState(initialUrl);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        setPlaybackId(initialPlaybackId);
        setUrl(initialUrl);
    }, [initialPlaybackId, initialUrl, isOpen]);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setSaving(true);
            const trimmedUrl = url.trim();
            const trimmedPlayback = playbackId.trim();
            const extractedMux = getMuxPlaybackId(trimmedPlayback, trimmedUrl);
            const isYouTube = getYouTubeEmbedUrl(trimmedUrl);

            const finalPlaybackId = isYouTube ? "" : (extractedMux || trimmedPlayback);
            await onSave({
                playbackId: finalPlaybackId,
                videoUrl: trimmedUrl,
            });
            onClose();
        } finally {
            setSaving(false);
        }
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs font-kantumruy animate-in fade-in duration-150"
            onClick={onClose}
        >
            <form
                onSubmit={handleSubmit}
                onClick={(e) => e.stopPropagation()}
                className="w-full max-w-md p-6 bg-white rounded-2xl shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-150"
            >
                <div className="flex items-center justify-between mb-3">
                    <h3 className="text-base font-semibold text-[#60738d]">
                        កែប្រែវីដេអូមេរៀន (Video Settings)
                    </h3>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-200">
                        Mux & URL
                    </span>
                </div>

                <div className="p-3 mb-4 rounded-xl bg-cyan-50/60 border border-cyan-100 text-xs text-cyan-900 leading-relaxed">
                    💡 <strong>Mux Video:</strong> បញ្ចូល <strong>Mux Playback ID</strong> ដើម្បីចាក់វីដេអូកម្រិតខ្ពស់តាម Mux Player (ឧ. <code className="px-1 bg-white/70 rounded">EcHgOK9coz5K4rjSwOkoE7Y7O01201SnJL</code> ឬ <code className="px-1 bg-white/70 rounded">stream.mux.com/...</code>)។
                </div>

                <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Mux Playback ID (អាទិភាពខ្ពស់)
                </label>
                <input
                    type="text"
                    value={playbackId}
                    onChange={(e) => setPlaybackId(e.target.value)}
                    placeholder="បញ្ចូល Mux Playback ID (ឧ. EcHgOK9coz5K4rj...)"
                    className="w-full px-3 py-2 text-xs border rounded-lg border-slate-300 focus:outline-none focus:border-cyan-600 text-slate-800 placeholder:text-slate-400 font-mono mb-3.5"
                />

                <label className="block text-xs font-semibold text-slate-700 mb-1">
                    YouTube URL ឬ External Video Link (ជម្រើសបន្ទាប់បន្សំ)
                </label>
                <input
                    type="url"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://www.youtube.com/watch?v=... ឬ .mp4"
                    className="w-full px-3 py-2 text-xs border rounded-lg border-slate-300 focus:outline-none focus:border-cyan-600 text-slate-800 placeholder:text-slate-400 font-kantumruy mb-5"
                />

                <div className="flex justify-end gap-2.5">
                    <button
                        type="button"
                        disabled={saving}
                        onClick={onClose}
                        className="px-3.5 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                    >
                        បោះបង់ (Cancel)
                    </button>
                    <button
                        type="submit"
                        disabled={saving}
                        className="px-4 py-2 text-xs font-medium text-white bg-cyan-600 hover:bg-cyan-700 rounded-lg shadow-sm transition-colors flex items-center gap-1.5 disabled:opacity-50"
                    >
                        {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                        <span>រក្សាទុក (Save)</span>
                    </button>
                </div>
            </form>
        </div>
    );
}

export function AddLessonModal({
    isOpen,
    chapterTitle,
    onClose,
    onSave,
}: {
    isOpen: boolean;
    chapterTitle: string;
    onClose: () => void;
    onSave: (data: { title: string; duration: string; videoUrl: string; playbackId?: string }) => Promise<void>;
}) {
    const [title, setTitle] = useState("");
    const [duration, setDuration] = useState("");
    const [playbackId, setPlaybackId] = useState("");
    const [videoUrl, setVideoUrl] = useState("");
    const [saving, setSaving] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim()) return;
        try {
            setSaving(true);
            const trimmedVideo = videoUrl.trim();
            const trimmedPlayback = playbackId.trim();
            const extractedMux = getMuxPlaybackId(trimmedPlayback, trimmedVideo);
            const isYouTube = getYouTubeEmbedUrl(trimmedVideo);
            await onSave({
                title: title.trim(),
                duration: duration.trim(),
                videoUrl: trimmedVideo,
                playbackId: isYouTube ? "" : (extractedMux || trimmedPlayback),
            });
            setTitle("");
            setDuration("");
            setPlaybackId("");
            setVideoUrl("");
            onClose();
        } finally {
            setSaving(false);
        }
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs font-kantumruy animate-in fade-in duration-150"
            onClick={onClose}
        >
            <form
                onSubmit={handleSubmit}
                onClick={(e) => e.stopPropagation()}
                className="w-full max-w-md p-6 bg-white rounded-2xl shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-150"
            >
                <h3 className="text-base font-semibold text-[#60738d] mb-1">
                    បន្ថែមមេរៀនថ្មី (Add Lesson)
                </h3>
                <p className="text-xs text-slate-400 mb-4 truncate">
                    ជំពូក: {chapterTitle}
                </p>

                <label className="block text-xs font-medium text-slate-600 mb-1">
                    ចំណងជើងមេរៀន (Lesson Title) *
                </label>
                <input
                    type="text"
                    required
                    autoFocus
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. ១. ទិដ្ឋភាពទូទៅនៃវគ្គសិក្សា"
                    className="w-full px-3 py-2 text-sm border rounded-lg border-slate-300 focus:outline-none focus:border-cyan-600 text-slate-800 placeholder:text-slate-400 font-kantumruy mb-3"
                />

                <div className="grid grid-cols-2 gap-3 mb-3">
                    <div>
                        <label className="block text-xs font-medium text-slate-600 mb-1">
                            រយៈពេល (Duration)
                        </label>
                        <input
                            type="text"
                            value={duration}
                            onChange={(e) => setDuration(e.target.value)}
                            placeholder="05:20"
                            className="w-full px-3 py-2 text-sm border rounded-lg border-slate-300 focus:outline-none focus:border-cyan-600 text-slate-800 placeholder:text-slate-400 font-kantumruy"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-slate-600 mb-1">
                            Mux Playback ID
                        </label>
                        <input
                            type="text"
                            value={playbackId}
                            onChange={(e) => setPlaybackId(e.target.value)}
                            placeholder="EcHgOK9coz5K4..."
                            className="w-full px-3 py-2 text-xs font-mono border rounded-lg border-slate-300 focus:outline-none focus:border-cyan-600 text-slate-800 placeholder:text-slate-400"
                        />
                    </div>
                </div>

                <label className="block text-xs font-medium text-slate-600 mb-1">
                    តំណភ្ជាប់វីដេអូ ឬ External Video URL (Optional)
                </label>
                <input
                    type="url"
                    value={videoUrl}
                    onChange={(e) => setVideoUrl(e.target.value)}
                    placeholder="https://www.youtube.com/watch?v=..."
                    className="w-full px-3 py-2 text-sm border rounded-lg border-slate-300 focus:outline-none focus:border-cyan-600 text-slate-800 placeholder:text-slate-400 font-kantumruy mb-5"
                />

                <div className="flex justify-end gap-2.5">
                    <button
                        type="button"
                        disabled={saving}
                        onClick={onClose}
                        className="px-3.5 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                    >
                        បោះបង់ (Cancel)
                    </button>
                    <button
                        type="submit"
                        disabled={saving || !title.trim()}
                        className="px-4 py-2 text-xs font-medium text-white bg-cyan-600 hover:bg-cyan-700 rounded-lg shadow-sm transition-colors flex items-center gap-1.5 disabled:opacity-50"
                    >
                        {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                        <span>រក្សាទុក (Save)</span>
                    </button>
                </div>
            </form>
        </div>
    );
}

export function EditLessonModal({
    isOpen,
    initialTitle,
    initialDuration,
    initialVideoUrl,
    initialPlaybackId = "",
    onClose,
    onSave,
}: {
    isOpen: boolean;
    initialTitle: string;
    initialDuration: string;
    initialVideoUrl: string;
    initialPlaybackId?: string;
    onClose: () => void;
    onSave: (data: { title: string; duration: string; videoUrl: string; playbackId?: string }) => Promise<void>;
}) {
    const [title, setTitle] = useState(initialTitle);
    const [duration, setDuration] = useState(initialDuration);
    const [playbackId, setPlaybackId] = useState(initialPlaybackId);
    const [videoUrl, setVideoUrl] = useState(initialVideoUrl);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        setTitle(initialTitle);
        setDuration(initialDuration);
        setPlaybackId(initialPlaybackId || "");
        setVideoUrl(initialVideoUrl);
    }, [initialTitle, initialDuration, initialPlaybackId, initialVideoUrl, isOpen]);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim()) return;
        try {
            setSaving(true);
            const trimmedVideo = videoUrl.trim();
            const trimmedPlayback = playbackId.trim();
            const extractedMux = getMuxPlaybackId(trimmedPlayback, trimmedVideo);
            const isYouTube = getYouTubeEmbedUrl(trimmedVideo);
            await onSave({
                title: title.trim(),
                duration: duration.trim(),
                videoUrl: trimmedVideo,
                playbackId: isYouTube ? "" : (extractedMux || trimmedPlayback),
            });
            onClose();
        } finally {
            setSaving(false);
        }
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs font-kantumruy animate-in fade-in duration-150"
            onClick={onClose}
        >
            <form
                onSubmit={handleSubmit}
                onClick={(e) => e.stopPropagation()}
                className="w-full max-w-md p-6 bg-white rounded-2xl shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-150"
            >
                <h3 className="text-base font-semibold text-[#60738d] mb-4">
                    កែប្រែមេរៀន (Edit Lesson)
                </h3>

                <label className="block text-xs font-medium text-slate-600 mb-1">
                    ចំណងជើងមេរៀន (Lesson Title) *
                </label>
                <input
                    type="text"
                    required
                    autoFocus
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-3 py-2 text-sm border rounded-lg border-slate-300 focus:outline-none focus:border-cyan-600 text-slate-800 placeholder:text-slate-400 font-kantumruy mb-3"
                />

                <div className="grid grid-cols-2 gap-3 mb-3">
                    <div>
                        <label className="block text-xs font-medium text-slate-600 mb-1">
                            ថិរវេលា (Duration)
                        </label>
                        <input
                            type="text"
                            value={duration}
                            onChange={(e) => setDuration(e.target.value)}
                            className="w-full px-3 py-2 text-sm border rounded-lg border-slate-300 focus:outline-none focus:border-cyan-600 text-slate-800 placeholder:text-slate-400 font-kantumruy"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-slate-600 mb-1">
                            Mux Playback ID
                        </label>
                        <input
                            type="text"
                            value={playbackId}
                            onChange={(e) => setPlaybackId(e.target.value)}
                            placeholder="EcHgOK9coz5K4..."
                            className="w-full px-3 py-2 text-xs font-mono border rounded-lg border-slate-300 focus:outline-none focus:border-cyan-600 text-slate-800 placeholder:text-slate-400"
                        />
                    </div>
                </div>

                <label className="block text-xs font-medium text-slate-600 mb-1">
                    តំណភ្ជាប់វីដេអូ ឬ External Video URL
                </label>
                <input
                    type="url"
                    value={videoUrl}
                    onChange={(e) => setVideoUrl(e.target.value)}
                    className="w-full px-3 py-2 text-sm border rounded-lg border-slate-300 focus:outline-none focus:border-cyan-600 text-slate-800 placeholder:text-slate-400 font-kantumruy mb-5"
                />

                <div className="flex justify-end gap-2.5">
                    <button
                        type="button"
                        disabled={saving}
                        onClick={onClose}
                        className="px-3.5 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                    >
                        បោះបង់ (Cancel)
                    </button>
                    <button
                        type="submit"
                        disabled={saving || !title.trim()}
                        className="px-4 py-2 text-xs font-medium text-white bg-cyan-600 hover:bg-cyan-700 rounded-lg shadow-sm transition-colors flex items-center gap-1.5 disabled:opacity-50"
                    >
                        {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                        <span>រក្សាទុក (Save)</span>
                    </button>
                </div>
            </form>
        </div>
    );
}

function ChapterModal({
    isOpen,
    title,
    initialTitle = "",
    onClose,
    onSave,
}: {
    isOpen: boolean;
    title: string;
    initialTitle?: string;
    onClose: () => void;
    onSave: (title: string) => Promise<void>;
}) {
    const [name, setName] = useState(initialTitle);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        setName(initialTitle);
    }, [initialTitle, isOpen]);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const trimmed = name.trim();
        if (!trimmed) return;

        try {
            setSaving(true);
            await onSave(trimmed);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs font-kantumruy animate-in fade-in duration-150"
            onClick={onClose}
        >
            <form
                onSubmit={handleSubmit}
                onClick={(e) => e.stopPropagation()}
                className="w-full max-w-sm p-6 bg-white rounded-2xl shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-150"
            >
                <h3 className="text-base font-semibold text-[#60738d] mb-4">
                    {title}
                </h3>

                <label className="block text-xs font-medium text-slate-600 mb-1.5">
                    ចំណងជើងជំពូក (Chapter Title)
                </label>
                <input
                    type="text"
                    required
                    autoFocus
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. ការចាប់ផ្តើម ឬ test chapter"
                    className="w-full px-3 py-2 text-sm border rounded-lg border-slate-300 focus:outline-none focus:border-cyan-600 text-slate-800 placeholder:text-slate-400 font-kantumruy mb-5"
                />

                <div className="flex justify-end gap-2.5">
                    <button
                        type="button"
                        disabled={saving}
                        onClick={onClose}
                        className="px-3.5 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                    >
                        បោះបង់ (Cancel)
                    </button>
                    <button
                        type="submit"
                        disabled={saving || !name.trim()}
                        className="px-4 py-2 text-xs font-medium text-white bg-cyan-600 hover:bg-cyan-700 rounded-lg shadow-sm transition-colors flex items-center gap-1.5 disabled:opacity-50"
                    >
                        {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                        <span>រក្សាទុក (Save)</span>
                    </button>
                </div>
            </form>
        </div>
    );
}

function DeleteConfirmationModal({
    isOpen,
    title,
    description,
    isDeleting,
    onClose,
    onConfirm,
}: {
    isOpen: boolean;
    title: string;
    description: string;
    isDeleting: boolean;
    onClose: () => void;
    onConfirm: () => Promise<void>;
}) {
    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs font-kantumruy animate-in fade-in duration-150"
            onClick={onClose}
        >
            <div
                onClick={(e) => e.stopPropagation()}
                className="w-full max-w-sm p-6 text-center bg-white rounded-2xl shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-150"
            >
                <div className="flex items-center justify-center w-12 h-12 mx-auto mb-3 border rounded-full bg-rose-50 border-rose-100 text-rose-500">
                    <AlertTriangle className="w-6 h-6" />
                </div>

                <h3 className="text-base font-bold text-slate-800 mb-1.5">
                    {title}
                </h3>

                <p className="text-xs text-slate-500 leading-relaxed mb-5">
                    {description}
                </p>

                <div className="grid grid-cols-2 gap-2.5">
                    <button
                        type="button"
                        disabled={isDeleting}
                        onClick={onClose}
                        className="px-3 py-2 text-xs font-medium border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50"
                    >
                        បោះបង់ (Cancel)
                    </button>
                    <button
                        type="button"
                        disabled={isDeleting}
                        onClick={onConfirm}
                        className="px-3 py-2 text-xs font-medium text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-sm transition-colors flex items-center justify-center gap-1.5 disabled:opacity-75"
                    >
                        {isDeleting ? (
                            <>
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                <span>កំពុងលុប...</span>
                            </>
                        ) : (
                            <span>លុប (Delete)</span>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}