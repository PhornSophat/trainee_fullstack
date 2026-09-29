import { useCoursesStore } from "@/store/courseStore";
import { useToastStore } from "@/store/useToastStore";
import { supabase } from "@/lib/supabaseClient";
import type { CourseCardItem, CourseTechnology } from "@/types/course";
import { useState, useRef } from "react";
import { Cpu, Loader2, Camera, Trash2 } from "lucide-react";

type EditTechnologyDrawerContentProps = {
  course: CourseCardItem;
  initialTech?: CourseTechnology;
  techIndex?: number;
  onCancel: () => void;
};

export function EditTechnologyDrawerContent({
  course,
  initialTech,
  techIndex,
  onCancel,
}: EditTechnologyDrawerContentProps) {
  const updateCourse = useCoursesStore((s) => s.updateCourse);
  const showToast = useToastStore((s) => s.showToast);

  const [name, setName] = useState(initialTech?.name || "");
  const [iconUrl, setIconUrl] = useState(initialTech?.icon || "");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const isEditing = techIndex !== undefined;

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
      const fileName = `tech-${course.id}-${Date.now()}.${fileExt}`;
      const filePath = `technologies/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("images of TMS")
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: publicUrlData } = supabase.storage
        .from("images of TMS")
        .getPublicUrl(filePath);

      setUploadProgress(100);
      setIconUrl(publicUrlData.publicUrl);
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
    if (!name.trim()) return;

    setIsSaving(true);
    try {
      const currentTechs: CourseTechnology[] = [...(course.technologies || [])];
      const newTechData: CourseTechnology = {
        name: name.trim(),
        icon: iconUrl.trim(),
      };

      if (isEditing) {
        currentTechs[techIndex] = newTechData;
      } else {
        currentTechs.push(newTechData);
      }

      await updateCourse(course.id, { technologies: currentTechs });
      showToast(isEditing ? "កែប្រែបច្ចេកវិទ្យាជោគជ័យ!" : "បានបន្ថែមបច្ចេកវិទ្យាជោគជ័យ!", "success");
      onCancel();
    } catch (error) {
      console.error("Failed to update technologies:", error);
      showToast("បរាជ័យក្នុងការរក្សាទុក", "error");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!isEditing) return;
    setIsSaving(true);

    try {
      const currentTechs = (course.technologies || []).filter((_, i) => i !== techIndex);
      await updateCourse(course.id, { technologies: currentTechs });
      showToast("បានលុបបច្ចេកវិទ្យាជោគជ័យ!", "success");
      onCancel();
    } catch (error) {
      console.error("Failed to delete technology:", error);
      showToast("បរាជ័យក្នុងការលុបបច្ចេកវិទ្យា", "error");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSave} className="flex-1 flex flex-col justify-between font-kantumruy">
      <div>
        {/* Cover Banner / Logo Upload Area */}
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

            {iconUrl ? (
              <img
                src={iconUrl}
                alt={name || "Technology icon"}
                className={`object-contain w-full h-full p-4 transition-transform duration-300 ${
                  isUploading ? "scale-95 opacity-50 blur-[1px]" : "group-hover:scale-105"
                }`}
              />
            ) : (
              <div className="flex flex-col items-center justify-center w-full h-full text-slate-400 gap-2">
                <Cpu className="w-14 h-14" />
                <span className="text-xs font-medium">No technology icon uploaded</span>
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
                    <span>{iconUrl ? "Change Icon" : "Upload Icon"}</span>
                  </button>
                  {iconUrl && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setIconUrl("");
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
          <div className="relative">
            <label className="absolute -top-2.5 left-3 bg-white px-1 text-xs font-medium text-slate-500 z-10">
              {isEditing ? "Edit Technology Name" : "Add New Technology"}*
            </label>
            <div className="flex items-center gap-3 px-3 py-3 border rounded-lg border-slate-300 focus-within:border-cyan-600">
              <Cpu className="w-4 h-4 text-slate-500 shrink-0" />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full text-sm outline-none bg-transparent text-slate-800"
                placeholder="e.g. Docker, FastAPI, PostgreSQL..."
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
            disabled={isSaving}
            className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
          >
            {isSaving && <Loader2 className="w-4 h-4 animate-spin inline mr-2" />}
            Delete
          </button>
        )}

        <button
          type="submit"
          disabled={isSaving || !name.trim()}
          className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-cyan-600 rounded-lg hover:bg-cyan-700 transition-colors disabled:opacity-50"
        >
          {isSaving && <Loader2 className="w-4 h-4 animate-spin inline mr-2" />}
          {isEditing ? "Save Changes" : "Add Technology"}
        </button>
      </div>
    </form>
  );
}
