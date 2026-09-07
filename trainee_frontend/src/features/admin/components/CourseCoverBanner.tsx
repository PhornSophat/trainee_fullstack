import { useEffect, useState, useRef } from "react";
import { Camera, Code2 } from "lucide-react";
import { useToastStore } from "@/store/useToastStore";
import { useCoursesStore } from "@/store/courseStore";
import { supabase } from "@/lib/supabaseClient";
import type { CourseCardItem } from "@/types/course";

type CourseCoverBannerProps = {
  course: CourseCardItem;
  className?: string;
  heightClass?: string;
};

export function CourseCoverBanner({
  course,
  className = "",
  heightClass = "h-48",
}: CourseCoverBannerProps) {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [previewUrl, setPreviewUrl] = useState<string | null>(course.imageUrl ?? null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const updateCourseImage = useCoursesStore((s) => s.updateCourseImage);
  const showToast = useToastStore((s) => s.showToast);

  // Keep preview in sync if course prop changes
  useEffect(() => {
    setPreviewUrl(course.imageUrl ?? null);
  }, [course.imageUrl]);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      showToast("Please select a valid image file", "error");
      event.target.value = "";
      return;
    }

    let progressInterval: ReturnType<typeof setInterval> | null = null;

    try {
      setUploading(true);
      setUploadProgress(10);

      // Smooth progress animation simulator while uploading
      progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev < 75) return prev + Math.floor(Math.random() * 8 + 4);
          if (prev < 92) return prev + 2;
          return prev;
        });
      }, 150);

      // 1. Delete previous thumbnail if it exists in Supabase
      if (course.imageUrl && course.imageUrl.includes("images%20of%20TMS/thumbnails/")) {
        try {
          const rawFileName = course.imageUrl.split("/thumbnails/")[1]?.split("?")[0];
          const oldFileName = rawFileName ? decodeURIComponent(rawFileName) : null;

          if (oldFileName) {
            await supabase.storage
              .from("images of TMS")
              .remove([`thumbnails/${oldFileName}`]);
          }
        } catch (err) {
          console.warn("Error parsing old image path:", err);
        }
      }

      // 2. Generate unique filename and upload
      const fileExt = file.name.split(".").pop();
      const fileName = `course-${course.id}-${Date.now()}.${fileExt}`;
      const filePath = `thumbnails/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("images of TMS")
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      // 3. Get public URL
      const { data: publicUrlData } = supabase.storage
        .from("images of TMS")
        .getPublicUrl(filePath);

      const publicUrl = publicUrlData.publicUrl;

      // 4. Persist to NestJS backend / PostgreSQL
      setUploadProgress(88);
      await updateCourseImage(course.id, publicUrl);

      // 5. Complete Progress & Show Toast
      if (progressInterval) clearInterval(progressInterval);
      setUploadProgress(100);
      setPreviewUrl(publicUrl);

      // Delay slightly at 100% so user sees completion before toast & overlay fade out
      setTimeout(() => {
        showToast("Course thumbnail updated successfully!", "success");
        setUploading(false);
        setUploadProgress(0);
      }, 400);

    } catch (error: any) {
      if (progressInterval) clearInterval(progressInterval);
      console.error("Upload error:", error);
      showToast(error.message || "Failed to upload image", "error");
      setUploading(false);
      setUploadProgress(0);
    } finally {
      if (event.target) event.target.value = "";
    }
  };

  // Circle progress calculation (Radius = 34)
  const radius = 34;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (circumference * uploadProgress) / 100;

  return (
    <div
      className={`group relative w-full overflow-hidden rounded-xl bg-slate-200/70 border border-slate-200/80 flex items-center justify-center ${heightClass} ${className}`}
    >
      <input
        type="file"
        ref={fileInputRef}
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
        disabled={uploading}
      />

      {previewUrl ? (
        <img
          src={previewUrl}
          alt={course.title}
          className={`object-contain w-full h-full p-2 transition-transform duration-300 ${
            uploading ? "scale-95 opacity-50 blur-[1px]" : "group-hover:scale-105"
          }`}
        />
      ) : (
        <div className="flex items-center justify-center w-full h-full text-slate-500">
          <Code2 className="w-14 h-14" />
        </div>
      )}

      {/* Dark Overlay & Centered UI */}
      <div
        className={`absolute inset-0 flex items-center justify-center bg-slate-900/50 backdrop-blur-[2px] transition-opacity duration-300 ${
          uploading ? "opacity-100" : "opacity-0 group-hover:opacity-100"
        }`}
      >
        {uploading ? (
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
              {uploadProgress < 85 ? "Uploading Image..." : uploadProgress < 100 ? "Syncing Database..." : "Done!"}
            </span>
          </div>
        ) : (
          /* Floating "Change Cover" Pill Button */
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 px-4 py-2 text-xs font-semibold shadow-md rounded-xl bg-white/90 text-slate-800 border border-slate-200/80 backdrop-blur-sm transition-transform hover:scale-105 hover:bg-white"
          >
            <Camera className="w-4 h-4 text-cyan-600" />
            <span>Change Cover</span>
          </button>
        )}
      </div>
    </div>
  );
}
