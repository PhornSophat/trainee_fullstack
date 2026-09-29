import { useState, useEffect } from "react";
import {
  BookMarked,
  Clock,
  Loader2,
  Video,
  Sparkles,
  PlayCircle,
  CheckCircle2,
  AlertCircle,
  ChevronDown,
} from "lucide-react";
import type { Lesson } from "@/types/course";
import { getMuxPlaybackId } from "@/lib/videoUtils";
import { formatDurationSeconds } from "@/lib/videoDuration";
import MuxPlayer from "@mux/mux-player-react";

type EditLessonDrawerContentProps = {
  lesson?: Lesson;
  onSave: (data: {
    title: string;
    description?: string;
    videoUrl: string;
    duration?: string;
    playbackId?: string;
  }) => Promise<void>;
  onCancel: () => void;
};

export function EditLessonDrawerContent({
  lesson,
  onSave,
  onCancel: _onCancel,
}: EditLessonDrawerContentProps) {
  const [title, setTitle] = useState(lesson?.title || "");
  const [description, setDescription] = useState(lesson?.description || "");
  const [duration, setDuration] = useState(lesson?.duration || "");
  const [playbackId, setPlaybackId] = useState(
    lesson?.playbackId || getMuxPlaybackId(lesson?.playbackId, lesson?.videoUrl) || ""
  );
  const [videoUrl, setVideoUrl] = useState(
    lesson?.videoUrl || (lesson?.playbackId ? `https://stream.mux.com/${lesson.playbackId}.m3u8` : "")
  );
  const [isSaving, setIsSaving] = useState(false);
  const [autoDetected, setAutoDetected] = useState(false);
  const [showPreview, setShowPreview] = useState(true);
  const [muxVideoStatus, setMuxVideoStatus] = useState<"idle" | "checking" | "valid" | "error">("idle");

  // Validate Mux Playback ID via lightweight thumbnail check
  useEffect(() => {
    const id = getMuxPlaybackId(playbackId, videoUrl);
    if (!id) {
      setMuxVideoStatus("idle");
      return;
    }

    setMuxVideoStatus("checking");

    let isCancelled = false;
    const timer = setTimeout(() => {
      const img = new Image();
      img.onload = () => {
        if (!isCancelled) setMuxVideoStatus("valid");
      };
      img.onerror = () => {
        if (!isCancelled) setMuxVideoStatus("error");
      };
      img.src = `https://image.mux.com/${id}/thumbnail.png?width=50`;
    }, 350);

    return () => {
      isCancelled = true;
      clearTimeout(timer);
    };
  }, [playbackId, videoUrl]);

  const handlePlaybackIdInput = (val: string) => {
    const raw = val.trim();
    const extracted = getMuxPlaybackId(raw, raw);
    const finalId = extracted || raw;
    setPlaybackId(finalId);
    if (finalId) {
      setVideoUrl(`https://stream.mux.com/${finalId}.m3u8`);
    } else {
      setVideoUrl("");
    }
  };

  const handleMuxLoadedMetadata = (e: any) => {
    setMuxVideoStatus("valid");
    const durSecs = e.target?.duration;
    if (durSecs && durSecs > 0 && (!duration || duration.trim() === "" || duration === "00:00")) {
      const formatted = formatDurationSeconds(durSecs);
      setDuration(formatted);
      setAutoDetected(true);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || muxVideoStatus === "error") return;

    try {
      setIsSaving(true);
      const extractedMux = getMuxPlaybackId(playbackId, videoUrl);
      const finalPlaybackId = extractedMux || playbackId.trim();
      const finalVideoUrl = finalPlaybackId
        ? `https://stream.mux.com/${finalPlaybackId}.m3u8`
        : videoUrl.trim();

      await onSave({
        title: title.trim(),
        description: description.trim(),
        videoUrl: finalVideoUrl,
        duration: duration.trim(),
        playbackId: finalPlaybackId,
      });
    } finally {
      setIsSaving(false);
    }
  };

  const currentMuxId = getMuxPlaybackId(playbackId, videoUrl);

  return (
    <form
      onSubmit={handleSubmit}
      className="flex-1 flex flex-col h-full min-h-0 overflow-hidden font-kantumruy bg-white"
    >
      {/* Scrollable Form Fields */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 min-h-0 pb-10">
        {/* 1. Lesson Title (ចំណងជើង*) */}
        <div className="relative">
          <label className="absolute -top-2.5 left-3 bg-white px-1 text-xs font-medium text-slate-500 z-10 select-none">
            ចំណងជើង*
          </label>
          <div className="flex items-center gap-3 px-3 py-3 border rounded-lg border-slate-300 focus-within:border-cyan-600 bg-white">
            <BookMarked className="w-5 h-5 text-slate-500 shrink-0" />
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              autoFocus
              className="w-full text-sm outline-none bg-transparent text-slate-800"
              placeholder="e.g. ការចាប់ផ្តើម"
            />
          </div>
        </div>

        {/* 2. Duration (រយៈពេល) with Auto-detect Badge */}
        <div className="relative">
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-medium text-slate-500 select-none">
              រយៈពេល (Duration)
            </label>
            {autoDetected && (
              <span className="inline-flex items-center gap-1 text-[11px] text-cyan-700 bg-cyan-50 border border-cyan-200 px-2 py-0.5 rounded-full">
                <Sparkles className="w-3 h-3 text-cyan-600" />
                ស្វ័យប្រវត្តិពី Mux
              </span>
            )}
          </div>
          <div className="flex items-center gap-3 px-3 py-3 border rounded-lg border-slate-300 focus-within:border-cyan-600 bg-white">
            <Clock className="w-5 h-5 text-slate-500 shrink-0" />
            <input
              type="text"
              value={duration}
              onChange={(e) => {
                setDuration(e.target.value);
                setAutoDetected(false);
              }}
              className="w-full text-sm outline-none bg-transparent text-slate-800"
              placeholder="e.g. 10:15 ឬ 05:20"
            />
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            *នឹងគណនាស្វ័យប្រវត្តិពីវីដេអូ Mux នៅពេលវីដេអូត្រូវបានផ្ទុក ឬលោកអ្នកអាចកែប្រែដោយដៃបាន
          </p>
        </div>

        {/* 3. Objective / Description (គោលបំណង) */}
        <div>
          <label className="block text-sm font-semibold text-[#60738d] mb-2">
            គោលបំណង
          </label>
          <textarea
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full p-4 text-sm leading-relaxed border rounded-xl border-slate-300 text-slate-800 focus:border-cyan-600 outline-none resize-none"
            placeholder={
              lesson?.description ||
              "Understand the program structure, expected outcomes, project workflow, and how each lesson connects to the final practical assignment."
            }
          />
        </div>

        {/* 4. Mux Playback ID Input */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <label className="text-sm font-semibold text-[#60738d]">
                វីដេអូមេរៀន (Mux Video)
              </label>
            </div>
            {muxVideoStatus === "checking" && (
              <span className="inline-flex items-center gap-1 text-[11px] text-slate-500 bg-slate-50 border border-slate-200 px-2 py-0.5 rounded-full">
                <Loader2 className="w-3.5 h-3.5 text-slate-400 animate-spin" />
                កំពុងពិនិត្យ Mux...
              </span>
            )}
            {muxVideoStatus === "error" && (
              <span className="inline-flex items-center gap-1 text-[11px] text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-full">
                <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
                វីដេអូមិនមាននៅលើ Mux ទេ
              </span>
            )}
          </div>

          <div className="relative">
            <label className="absolute -top-2.5 left-3 bg-white px-1 text-xs font-medium text-slate-500 z-10 select-none">
              Mux Playback ID*
            </label>
            <div
              className={`flex items-center gap-3 px-3 py-3 border rounded-lg transition-colors ${
                muxVideoStatus === "error"
                  ? "border-rose-400 focus-within:border-rose-600"
                  : muxVideoStatus === "valid"
                  ? "border-emerald-400 focus-within:border-emerald-600"
                  : "border-slate-300 focus-within:border-cyan-600"
              } bg-white`}
            >
              <Video className="w-5 h-5 text-slate-500 shrink-0" />
              <input
                type="text"
                value={playbackId}
                onChange={(e) => handlePlaybackIdInput(e.target.value)}
                className="w-full text-sm outline-none bg-transparent text-slate-800 font-mono"
                placeholder="e.g. sA00p7F11w000gS00k8t0101QG3uLp4rE"
              />
              {muxVideoStatus === "checking" && (
                <Loader2 className="w-4 h-4 text-slate-400 animate-spin shrink-0" />
              )}
              {muxVideoStatus === "valid" && (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              )}
              {muxVideoStatus === "error" && (
                <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />
              )}
            </div>
          </div>
          {muxVideoStatus === "error" ? (
            <p className="text-[11px] text-rose-600 font-medium">
              *វីដេអូមិនមាននៅលើ Mux ទេ (404 Not Found)។ សូមពិនិត្យមើលតួអក្សរ Mux Playback ID ឡើងវិញ។
            </p>
          ) : (
            <p className="text-[11px] text-slate-400">
              បញ្ចូល Mux Playback ID ឬតំណ stream (ឧទាហរណ៍៖ https://stream.mux.com/YOUR_PLAYBACK_ID.m3u8)
            </p>
          )}

          {/* Mux Video Live Preview */}
          {currentMuxId && (
            <div className="border border-slate-200 rounded-xl overflow-hidden bg-slate-900/5 mt-4">
              <button
                type="button"
                onClick={() => setShowPreview(!showPreview)}
                className="w-full flex items-center justify-between px-4 py-2.5 bg-slate-50 hover:bg-slate-100 transition-colors text-xs font-medium text-slate-700"
              >
                <span className="flex items-center gap-2">
                  <PlayCircle className="w-4 h-4 text-cyan-600" />
                  វីដេអូ (Mux Player Preview)
                </span>
                <ChevronDown
                  className={`w-4 h-4 text-slate-500 transition-transform duration-200 ${
                    showPreview ? "rotate-180" : ""
                  }`}
                />
              </button>

              {showPreview && (
                <div className="p-3 bg-black flex items-center justify-center">
                  <div className="w-full aspect-video rounded-lg overflow-hidden">
                    <MuxPlayer
                      key={currentMuxId}
                      playbackId={currentMuxId}
                      metadata={{
                        video_title: title || "Lesson Mux Video",
                      }}
                      streamType="on-demand"
                      onLoadedMetadata={handleMuxLoadedMetadata}
                      onError={() => setMuxVideoStatus("error")}
                      className="w-full h-full"
                    />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Bottom Sticky/Fixed Footer */}
      <div className="shrink-0 flex items-center justify-end px-6 py-4 bg-white border-t border-slate-200 z-20 shadow-sm">
        <button
          type="submit"
          disabled={isSaving || !title.trim() || muxVideoStatus === "error"}
          className="flex items-center justify-center gap-2 rounded-lg bg-cyan-600 px-8 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-cyan-700 disabled:opacity-50"
        >
          {isSaving ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>កំពុងរក្សាទុក...</span>
            </>
          ) : (
            <span>រួចរាល់</span>
          )}
        </button>
      </div>
    </form>
  );
}
