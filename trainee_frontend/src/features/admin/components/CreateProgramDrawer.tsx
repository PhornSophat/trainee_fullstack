import { useState, useRef, useEffect } from "react";
import {
  X,
  Pencil,
  Shapes,
  BarChart2,
  ChevronDown,
  Camera,
  Trash2,
  Code2,
  Loader2,
} from "lucide-react";
import { useCoursesStore } from "@/store/courseStore";
import { useToastStore } from "@/store/useToastStore";
import { supabase } from "@/lib/supabaseClient";
import type { CourseLevel } from "@/types/course";

type CreateProgramDrawerProps = {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (courseId: number | string) => void;
};

const CATEGORIES = [
  { id: 1, name: "Web" },
  { id: 2, name: "Mobile" },
  { id: 3, name: "DevOps" },
  { id: 4, name: "Cyber" },
  { id: 5, name: "UX/UI" },
  { id: 6, name: "API" },
];

const LEVELS: { value: CourseLevel; label: string }[] = [
  { value: "BASIC", label: "Basic" },
  { value: "INTERMEDIATE", label: "Intermediate" },
  { value: "ADVANCED", label: "Advanced" },
];

export function CreateProgramDrawer({
  isOpen,
  onClose,
  onSuccess,
}: CreateProgramDrawerProps) {
  const createCourse = useCoursesStore((s) => s.createCourse);
  const showToast = useToastStore((s) => s.showToast);

  const [khmerName, setKhmerName] = useState("");
  const [latinName, setLatinName] = useState("");
  const [categoryId, setCategoryId] = useState<number | "">("");
  const [level, setLevel] = useState<CourseLevel | "">("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [khmerWarning, setKhmerWarning] = useState("");
  const [latinWarning, setLatinWarning] = useState("");

  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [isLevelOpen, setIsLevelOpen] = useState(false);

  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const categoryRef = useRef<HTMLDivElement | null>(null);
  const levelRef = useRef<HTMLDivElement | null>(null);

  // Circle progress calculation (Radius = 34)
  const radius = 34;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset =
    circumference - (circumference * uploadProgress) / 100;

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        categoryRef.current &&
        !categoryRef.current.contains(e.target as Node)
      ) {
        setIsCategoryOpen(false);
      }
      if (levelRef.current && !levelRef.current.contains(e.target as Node)) {
        setIsLevelOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close on ESC key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  const resetForm = () => {
    setKhmerName("");
    setLatinName("");
    setCategoryId("");
    setLevel("");
    setDescription("");
    setImageUrl("");
    setKhmerWarning("");
    setLatinWarning("");
    setIsCategoryOpen(false);
    setIsLevelOpen(false);
  };

  const handleKhmerNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    // Check if user typed or pasted non-Khmer characters
    const hasInvalid = /[^\u1780-\u17FF\u19E0-\u19FF\u200B\s]/.test(raw);

    if (hasInvalid) {
      const msg = "មិនអនុញ្ញាតឱ្យបញ្ចូលអក្សរអង់គ្លេសទេ (Khmer letters only)";
      setKhmerWarning(msg);
      showToast(msg, "warning");
      setTimeout(() => setKhmerWarning(""), 3500);
    } else {
      setKhmerWarning("");
    }

    // Allow only Khmer letters, vowels, numerals, spaces, and Zero-Width Space (\u200B)
    const khmerOnly = raw.replace(
      /[^\u1780-\u17FF\u19E0-\u19FF\u200B\s]/g,
      ""
    );
    setKhmerName(khmerOnly);
  };

  const handleLatinNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    // Check if user typed or pasted non-Latin characters
    const hasInvalid = /[^a-zA-Z0-9\s\-&.,/]/.test(raw);

    if (hasInvalid) {
      const msg = "មិនអនុញ្ញាតឱ្យបញ្ចូលអក្សរខ្មែរទេ (English/Latin only)";
      setLatinWarning(msg);
      showToast(msg, "warning");
      setTimeout(() => setLatinWarning(""), 3500);
    } else {
      setLatinWarning("");
    }

    // Allow only Latin characters (A-Z, a-z), numbers, spaces, and common punctuation
    const latinOnly = raw.replace(/[^a-zA-Z0-9\s\-&.,/]/g, "");
    setLatinName(latinOnly);
  };

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
      const fileName = `course-cover-${Date.now()}.${fileExt}`;
      const filePath = `thumbnails/${fileName}`;

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
    } catch (err: any) {
      console.error("Upload error:", err);
      showToast(err.message || "បរាជ័យក្នុងការបញ្ចូលរូបភាព!", "error");
    } finally {
      clearInterval(progressInterval);
      setTimeout(() => {
        setIsUploading(false);
        setUploadProgress(0);
      }, 400);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const isValid =
    khmerName.trim() !== "" &&
    latinName.trim() !== "" &&
    categoryId !== "" &&
    level !== "";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const newCourse = await createCourse({
        title: latinName.trim(),
        khmerTitle: khmerName.trim(),
        categoryId: Number(categoryId),
        level: level as CourseLevel,
        description: description.trim(),
        imageUrl: imageUrl.trim() || undefined,
      });

      showToast("កម្មវិធីសិក្សាត្រូវបានបង្កើតដោយជោគជ័យ!", "success");
      onSuccess?.(newCourse.id);
      resetForm();
      onClose();
    } catch (err: any) {
      console.error("Create course error:", err);
      showToast(err.message || "បរាជ័យក្នុងការបង្កើតកម្មវិធីសិក្សា!", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedCategoryName = CATEGORIES.find((c) => c.id === categoryId)?.name;
  const selectedLevelLabel = LEVELS.find((l) => l.value === level)?.label;

  return (
    <div
      className={`fixed inset-0 z-50 overflow-hidden transition font-kantumruy ${
        isOpen ? "pointer-events-auto" : "pointer-events-none"
      }`}
      aria-hidden={!isOpen}
    >
      {/* Backdrop */}
      <button
        type="button"
        aria-label="Close drawer"
        onClick={onClose}
        className={`absolute inset-0 bg-slate-900/35 transition-opacity duration-300 ${
          isOpen ? "opacity-100" : "opacity-0"
        }`}
      />

      {/* Drawer */}
      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Create Program"
        className={`absolute inset-y-0 right-0 flex w-full max-w-[500px] flex-col bg-white shadow-2xl transition-transform duration-300 ease-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Top-Left Circular Close Button - only rendered when open */}
        {isOpen && (
          <button
            type="button"
            onClick={onClose}
            aria-label="Close drawer"
            className="absolute -left-4 top-3.5 flex h-9 w-9 -translate-x-1/2 items-center justify-center rounded-full bg-white text-[#60738d] shadow-md hover:text-slate-900 border border-slate-200 z-50 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        {/* Header */}
        <div className="relative flex items-center justify-center min-h-[56px] border-b border-slate-200 px-4 py-3 shrink-0">
          <h2 className="text-base font-semibold text-[#60738d]">
            Create Program
          </h2>
        </div>

        {/* Form Body */}
        <form
          onSubmit={handleSubmit}
          className="flex-1 flex flex-col justify-between overflow-y-auto"
        >
          <div>
            {/* Rectangular Cover Banner matching other drawers */}
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
                    alt={latinName || "Program cover"}
                    className={`object-contain w-full h-full p-2 transition-transform duration-300 ${
                      isUploading
                        ? "scale-95 opacity-50 blur-[1px]"
                        : "group-hover:scale-105"
                    }`}
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center w-full h-full text-slate-400 gap-2">
                    <Code2 className="w-14 h-14" />
                    <span className="text-xs font-medium">
                      No program cover uploaded
                    </span>
                  </div>
                )}

                {/* Dark Overlay & Upload UI */}
                <div
                  className={`absolute inset-0 flex items-center justify-center bg-slate-900/50 backdrop-blur-[2px] transition-opacity duration-300 ${
                    isUploading
                      ? "opacity-100"
                      : "opacity-0 group-hover:opacity-100"
                  }`}
                >
                  {isUploading ? (
                    /* Progress Ring Indicator */
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
                    /* Action Pill Buttons */
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="flex items-center gap-2 px-4 py-2 text-xs font-semibold shadow-md rounded-xl bg-white/90 text-slate-800 border border-slate-200/80 backdrop-blur-sm transition-transform hover:scale-105 hover:bg-white cursor-pointer"
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
                          className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold shadow-md rounded-xl bg-red-600/90 text-white backdrop-blur-sm transition-transform hover:scale-105 hover:bg-red-600 cursor-pointer"
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

            {/* Inputs Section */}
            <div className="p-6 space-y-4">
              {/* Name in Khmer* */}
              <div className="space-y-1">
                <div
                  className={`flex items-center gap-3 px-3.5 py-3 border rounded-lg transition-colors ${
                    khmerWarning
                      ? "border-red-500 ring-1 ring-red-500"
                      : "border-slate-300 focus-within:border-cyan-600"
                  }`}
                >
                  <Pencil className="w-4 h-4 text-slate-500 shrink-0" />
                  <input
                    type="text"
                    value={khmerName}
                    onChange={handleKhmerNameChange}
                    required
                    placeholder="Name in Khmer*"
                    className="w-full text-sm outline-none bg-transparent text-slate-800 placeholder:text-slate-400"
                  />
                </div>
                {khmerWarning && (
                  <p className="text-xs text-red-500 pl-1 font-medium animate-fadeIn">
                    {khmerWarning}
                  </p>
                )}
              </div>

              {/* Name in Latin* */}
              <div className="space-y-1">
                <div
                  className={`flex items-center gap-3 px-3.5 py-3 border rounded-lg transition-colors ${
                    latinWarning
                      ? "border-red-500 ring-1 ring-red-500"
                      : "border-slate-300 focus-within:border-cyan-600"
                  }`}
                >
                  <Pencil className="w-4 h-4 text-slate-500 shrink-0" />
                  <input
                    type="text"
                    value={latinName}
                    onChange={handleLatinNameChange}
                    required
                    placeholder="Name in Latin*"
                    className="w-full text-sm outline-none bg-transparent text-slate-800 placeholder:text-slate-400"
                  />
                </div>
                {latinWarning && (
                  <p className="text-xs text-red-500 pl-1 font-medium animate-fadeIn">
                    {latinWarning}
                  </p>
                )}
              </div>

              {/* Category* Dropdown */}
              <div ref={categoryRef} className="relative">
                {(isCategoryOpen || categoryId !== "") && (
                  <label className="absolute -top-2.5 left-3 bg-white px-1 text-xs font-medium text-cyan-600 z-10">
                    Category*
                  </label>
                )}
                <div
                  onClick={() => {
                    setIsCategoryOpen((prev) => !prev);
                    setIsLevelOpen(false);
                  }}
                  className={`flex items-center justify-between px-3.5 py-3 border rounded-lg cursor-pointer transition-colors ${
                    isCategoryOpen
                      ? "border-cyan-600 ring-1 ring-cyan-600"
                      : categoryId !== ""
                      ? "border-cyan-600"
                      : "border-slate-300 hover:border-slate-400"
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Shapes className="w-4 h-4 text-slate-500 shrink-0" />
                    <span
                      className={`text-sm truncate ${
                        selectedCategoryName ? "text-slate-800" : "text-slate-400"
                      }`}
                    >
                      {selectedCategoryName || "Category*"}
                    </span>
                  </div>
                  <ChevronDown
                    className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${
                      isCategoryOpen ? "rotate-180 text-cyan-600" : ""
                    }`}
                  />
                </div>

                {/* Floating Options Menu */}
                {isCategoryOpen && (
                  <div className="absolute top-[calc(100%+4px)] left-0 right-0 bg-white border border-slate-200 rounded-lg shadow-xl z-30 py-1 max-h-60 overflow-y-auto">
                    {CATEGORIES.map((cat) => (
                      <div
                        key={cat.id}
                        onClick={() => {
                          setCategoryId(cat.id);
                          setIsCategoryOpen(false);
                        }}
                        className={`px-4 py-2.5 text-sm cursor-pointer transition-colors ${
                          categoryId === cat.id
                            ? "bg-slate-100 font-medium text-slate-900"
                            : "text-slate-700 hover:bg-slate-50"
                        }`}
                      >
                        {cat.name}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Level* Dropdown */}
              <div ref={levelRef} className="relative">
                {(isLevelOpen || level !== "") && (
                  <label className="absolute -top-2.5 left-3 bg-white px-1 text-xs font-medium text-cyan-600 z-10">
                    Level*
                  </label>
                )}
                <div
                  onClick={() => {
                    setIsLevelOpen((prev) => !prev);
                    setIsCategoryOpen(false);
                  }}
                  className={`flex items-center justify-between px-3.5 py-3 border rounded-lg cursor-pointer transition-colors ${
                    isLevelOpen
                      ? "border-cyan-600 ring-1 ring-cyan-600"
                      : level !== ""
                      ? "border-cyan-600"
                      : "border-slate-300 hover:border-slate-400"
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <BarChart2 className="w-4 h-4 text-slate-500 shrink-0" />
                    <span
                      className={`text-sm truncate ${
                        selectedLevelLabel ? "text-slate-800" : "text-slate-400"
                      }`}
                    >
                      {selectedLevelLabel || "Level*"}
                    </span>
                  </div>
                  <ChevronDown
                    className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${
                      isLevelOpen ? "rotate-180 text-cyan-600" : ""
                    }`}
                  />
                </div>

                {/* Floating Options Menu */}
                {isLevelOpen && (
                  <div className="absolute top-[calc(100%+4px)] left-0 right-0 bg-white border border-slate-200 rounded-lg shadow-xl z-30 py-1 max-h-60 overflow-y-auto">
                    {LEVELS.map((lvl) => (
                      <div
                        key={lvl.value}
                        onClick={() => {
                          setLevel(lvl.value);
                          setIsLevelOpen(false);
                        }}
                        className={`px-4 py-2.5 text-sm cursor-pointer transition-colors ${
                          level === lvl.value
                            ? "bg-slate-100 font-medium text-slate-900"
                            : "text-slate-700 hover:bg-slate-50"
                        }`}
                      >
                        {lvl.label}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Description */}
              <div className="space-y-1.5 pt-1">
                <label className="block text-sm font-medium text-slate-600">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  placeholder="Enter a description..."
                  className="w-full p-3 text-sm border rounded-lg border-slate-300 outline-none focus:border-cyan-600 resize-none text-slate-800 placeholder:text-slate-400 transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Sticky Footer with Right-Aligned Create Button */}
          <div className="sticky bottom-0 mt-auto flex items-center justify-end px-6 py-4 bg-white border-t border-slate-200">
            <button
              type="submit"
              disabled={!isValid || isSubmitting || isUploading}
              className={`px-7 py-2 text-sm font-medium rounded-lg transition-all ${
                isValid && !isSubmitting && !isUploading
                  ? "bg-cyan-600 text-white hover:bg-cyan-700 shadow-sm cursor-pointer"
                  : "bg-slate-200 text-white cursor-not-allowed"
              }`}
            >
              {isSubmitting && (
                <Loader2 className="w-4 h-4 animate-spin inline mr-2" />
              )}
              Create
            </button>
          </div>
        </form>
      </aside>
    </div>
  );
}
