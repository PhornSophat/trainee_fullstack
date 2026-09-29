import { useCoursesStore } from "@/store/courseStore";
import { useToastStore } from "@/store/useToastStore";
import { supabase } from "@/lib/supabaseClient";
import type { CourseCardItem, KeyLesson } from "@/types/course";
import { useState, useRef } from "react";
import { BookOpen, AlignLeft, Loader2, Camera, Trash2 } from "lucide-react";

type EditKeyLessonDrawerContentProps = {
  course: CourseCardItem;
  initialLesson?: KeyLesson;
  lessonIndex?: number;
  onCancel: () => void;
};

export function EditKeyLessonDrawerContent({
  course,
  initialLesson,
  lessonIndex,
  onCancel,
}: EditKeyLessonDrawerContentProps) {
  const updateCourse = useCoursesStore((s) => s.updateCourse);
  const showToast = useToastStore((s) => s.showToast);

  const [title, setTitle] = useState(initialLesson?.title || "");
  const [description, setDescription] = useState(initialLesson?.description || "");
  const [imageUrl, setImageUrl] = useState(initialLesson?.imageUrl || "");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const isEditing = lessonIndex !== undefined;

  // Circle progress calculation (Radius = 34)
  const radius = 34;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (circumference * uploadProgress) / 100;

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      showToast("សូមជ្រើសរើសប្រភេទរូបភាព", "error");
      return;
    }

    // Limit size to 5MB
    if (file.size > 5 * 1024 * 1024) {
      showToast("ទំហំរូបភាពត្រូវតែតូចជាង 5MB", "error");
      return;
    }

    setIsUploading(true);
    let currentProgress = 15;
    setUploadProgress(currentProgress);

    const progressInterval = setInterval(() => {
      currentProgress = Math.min(currentProgress + 15, 80);
      setUploadProgress(currentProgress);
    }, 120);

    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `key-lesson-${course.id}-${Date.now()}.${fileExt}`;
      const filePath = `key-lessons/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("images of TMS")
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: publicUrlData } = supabase.storage
        .from("images of TMS")
        .getPublicUrl(filePath);

      setUploadProgress(100);
      setImageUrl(publicUrlData.publicUrl);
      showToast("រូបភាពត្រូវបានបញ្ចូលជោគជ័យ!", "success");
    } catch (error: any) {
      console.error("Upload error:", error);
      showToast(error.message || "បរាជ័យក្នុងការបញ្ចូលរូបភាព", "error");
    } finally {
      clearInterval(progressInterval);
      setTimeout(() => {
        setIsUploading(false);
        setUploadProgress(0);
      }, 400);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsSaving(true);
    try {
      const currentLessons: KeyLesson[] = [...(course.keyLessons || [])];

      const newLessonData: KeyLesson = {
        title: title.trim(),
        description: description.trim(),
        imageUrl: imageUrl.trim() || undefined,
        code: initialLesson?.code,
      };

      if (isEditing) {
        currentLessons[lessonIndex] = newLessonData;
      } else {
        currentLessons.push(newLessonData);
      }

      await updateCourse(course.id, { keyLessons: currentLessons });
      showToast(isEditing ? "កែប្រែមេរៀនគន្លឹះជោគជ័យ!" : "បានបន្ថែមមេរៀនគន្លឹះជោគជ័យ!", "success");
      onCancel();
    } catch (error) {
      console.error("Failed to update key lessons:", error);
      showToast("បរាជ័យក្នុងការរក្សាទុក", "error");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!isEditing) return;
    setIsSaving(true);

    try {
      const currentLessons = (course.keyLessons || []).filter((_, i) => i !== lessonIndex);
      await updateCourse(course.id, { keyLessons: currentLessons });
      showToast("បានលុបមេរៀនគន្លឹះជោគជ័យ!", "success");
      onCancel();
    } catch (error) {
      console.error("Failed to delete key lesson:", error);
      showToast("បរាជ័យក្នុងការលុបមេរៀនគន្លឹះ", "error");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSave} className="flex-1 flex flex-col justify-between font-kantumruy">
      <div>
        {/* Cover Banner with exact same design & interaction as CourseCoverBanner */}
        <div className="p-4 border-b border-slate-300 bg-slate-50/50">
          <div className="group relative w-full overflow-hidden rounded-xl bg-slate-200/70 border border-slate-200/80 flex items-center justify-center h-48">
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              onChange={handleImageSelect}
              className="hidden"
              disabled={isUploading}
            />

            {imageUrl ? (
              <img
                src={imageUrl}
                alt={title || "Key lesson cover"}
                className={`object-contain w-full h-full p-2 transition-transform duration-300 ${
                  isUploading ? "scale-95 opacity-50 blur-[1px]" : "group-hover:scale-105"
                }`}
              />
            ) : (
              <div className="flex flex-col items-center justify-center w-full h-full text-slate-400 gap-2">
                <BookOpen className="w-14 h-14" />
                <span className="text-xs font-medium">No lesson image uploaded</span>
              </div>
            )}

            {/* Dark Overlay & Centered Hover / Upload UI */}
            <div
              className={`absolute inset-0 flex items-center justify-center bg-slate-900/50 backdrop-blur-[2px] transition-opacity duration-300 ${
                isUploading ? "opacity-100" : "opacity-0 group-hover:opacity-100"
              }`}
            >
              {isUploading ? (
                /* Premium Progress Ring & Percentage Indicator */
                <div className="flex flex-col items-center justify-center gap-2">
                  <div className="relative flex items-center justify-center w-20 h-20">
                    <svg className="w-20 h-20 transform -rotate-90">
                      <circle
                        cx="40"
                        cy="40"
                        r={radius}
                        stroke="currentColor"
                        strokeWidth="5"
                        className="text-white/20"
                        fill="transparent"
                      />
                      <circle
                        cx="40"
                        cy="40"
                        r={radius}
                        stroke="currentColor"
                        strokeWidth="5"
                        strokeDasharray={circumference}
                        strokeDashoffset={strokeDashoffset}
                        strokeLinecap="round"
                        className="text-cyan-400 transition-all duration-150 ease-out"
                        fill="transparent"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-sm font-bold text-white tracking-wide">
                        {uploadProgress}%
                      </span>
                    </div>
                  </div>
                  <span className="text-xs font-semibold text-cyan-200 tracking-wide">
                    {uploadProgress < 85 ? "Uploading Image..." : "Done!"}
                  </span>
                </div>
              ) : (
                /* Floating Action Buttons */
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-2 px-4 py-2 text-xs font-semibold shadow-md rounded-xl bg-white/90 text-slate-800 border border-slate-200/80 backdrop-blur-sm transition-transform hover:scale-105 hover:bg-white"
                  >
                    <Camera className="w-4 h-4 text-cyan-600" />
                    <span>{imageUrl ? "Change Cover" : "Upload Cover"}</span>
                  </button>
                  {imageUrl && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setImageUrl("");
                      }}
                      className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold shadow-md rounded-xl bg-red-600/90 text-white backdrop-blur-sm transition-transform hover:scale-105 hover:bg-red-600"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Remove</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Inputs */}
        <div className="p-6 space-y-6">
          {/* Title */}
          <div className="relative">
            <label className="absolute -top-2.5 left-3 bg-white px-1 text-xs font-medium text-slate-500 z-10">
              {isEditing ? "Edit Key Lesson Title" : "New Key Lesson Title"}*
            </label>
            <div className="flex items-center gap-3 px-3 py-3 border rounded-lg border-slate-300 focus-within:border-cyan-600">
              <BookOpen className="w-4 h-4 text-slate-500 shrink-0" />
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="w-full text-sm outline-none bg-transparent text-slate-800"
                placeholder="e.g. រចនា API..."
              />
            </div>
          </div>

          {/* Description */}
          <div className="relative">
            <label className="absolute -top-2.5 left-3 bg-white px-1 text-xs font-medium text-slate-500 z-10">
              Description
            </label>
            <div className="flex items-start gap-3 px-3 py-3 border rounded-lg border-slate-300 focus-within:border-cyan-600">
              <AlignLeft className="w-4 h-4 text-slate-500 shrink-0 mt-1" />
              <textarea
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full text-sm outline-none bg-transparent text-slate-800 resize-none"
                placeholder="Enter lesson description..."
              />
            </div>
          </div>
        </div>
      </div>

      <div className="sticky bottom-0 mt-auto flex items-center gap-3 px-6 py-4 bg-white border-t border-slate-200 z-10">
        {!isEditing ? (
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 px-4 py-2.5 text-sm font-medium text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors"
          >
            Cancel
          </button>
        ) : (
          <button
            type="button"
            onClick={handleDelete}
            disabled={isSaving || isUploading}
            className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
          >
            {isSaving && <Loader2 className="w-4 h-4 animate-spin inline mr-2" />}
            Delete
          </button>
        )}

        <button
          type="submit"
          disabled={isSaving || isUploading || !title.trim()}
          className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-cyan-600 rounded-lg hover:bg-cyan-700 transition-colors disabled:opacity-50"
        >
          {isSaving && <Loader2 className="w-4 h-4 animate-spin inline mr-2" />}
          {isEditing ? "Save Changes" : "Add Key Lesson"}
        </button>
      </div>
    </form>
  );
}
