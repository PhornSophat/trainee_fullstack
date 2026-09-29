import { useCoursesStore } from "@/store/courseStore";
import { useToastStore } from "@/store/useToastStore";
import type { CourseCardItem, LearningResource } from "@/types/course";
import { useState } from "react";
import {
  Code2,
  Database,
  FileText,
  Server,
  Link2,
  Video,
  BookOpen,
  Loader2,
  Bookmark,
} from "lucide-react";

type EditLearningResourceDrawerContentProps = {
  course: CourseCardItem;
  initialResource?: LearningResource;
  resourceIndex?: number;
  onCancel: () => void;
};

const ICON_OPTIONS = [
  { id: "file", label: "Document", icon: FileText },
  { id: "code", label: "Code & API", icon: Code2 },
  { id: "database", label: "Database", icon: Database },
  { id: "server", label: "Deployment", icon: Server },
  { id: "link", label: "Web Link", icon: Link2 },
  { id: "video", label: "Video", icon: Video },
  { id: "book", label: "Guide / Book", icon: BookOpen },
];

export function EditLearningResourceDrawerContent({
  course,
  initialResource,
  resourceIndex,
  onCancel,
}: EditLearningResourceDrawerContentProps) {
  const updateCourse = useCoursesStore((s) => s.updateCourse);
  const showToast = useToastStore((s) => s.showToast);

  const [title, setTitle] = useState(initialResource?.title || "");
  const [url, setUrl] = useState(initialResource?.url || "");
  const [selectedIcon, setSelectedIcon] = useState(initialResource?.icon || "file");
  const [isSaving, setIsSaving] = useState(false);

  const isEditing = resourceIndex !== undefined;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsSaving(true);
    try {
      const currentResources: LearningResource[] = [...(course.learningResources || [])];
      const newResourceData: LearningResource = {
        title: title.trim(),
        url: url.trim() || undefined,
        icon: selectedIcon,
      };

      if (isEditing) {
        currentResources[resourceIndex] = newResourceData;
      } else {
        currentResources.push(newResourceData);
      }

      await updateCourse(course.id, { learningResources: currentResources });
      showToast(
        isEditing
          ? "កែប្រែឯកសារយោងជោគជ័យ!"
          : "បានបន្ថែមឯកសារយោងជោគជ័យ!",
        "success"
      );
      onCancel();
    } catch (error) {
      console.error("Failed to update learning resources:", error);
      showToast("បរាជ័យក្នុងការរក្សាទុក", "error");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!isEditing) return;
    setIsSaving(true);

    try {
      const currentResources = (course.learningResources || []).filter(
        (_, i) => i !== resourceIndex
      );
      await updateCourse(course.id, { learningResources: currentResources });
      showToast("បានលុបឯកសារយោងជោគជ័យ!", "success");
      onCancel();
    } catch (error) {
      console.error("Failed to delete learning resource:", error);
      showToast("បរាជ័យក្នុងការលុបឯកសារយោង", "error");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSave} className="flex-1 flex flex-col justify-between font-kantumruy">
      <div className="p-6 space-y-6">
        {/* Resource Title */}
        <div className="relative">
          <label className="absolute -top-2.5 left-3 bg-white px-1 text-xs font-medium text-slate-500 z-10">
            {isEditing ? "Edit Resource Title" : "Add Resource Title"}*
          </label>
          <div className="flex items-center gap-3 px-3 py-3 border rounded-lg border-slate-300 focus-within:border-cyan-600">
            <Bookmark className="w-4 h-4 text-slate-500 shrink-0" />
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full text-sm outline-none bg-transparent text-slate-800"
              placeholder="e.g. API contract examples, Database schema guide..."
            />
          </div>
        </div>

        {/* Resource URL / Link */}
        <div className="relative">
          <label className="absolute -top-2.5 left-3 bg-white px-1 text-xs font-medium text-slate-500 z-10">
            Resource Link / URL (Optional)
          </label>
          <div className="flex items-center gap-3 px-3 py-3 border rounded-lg border-slate-300 focus-within:border-cyan-600">
            <Link2 className="w-4 h-4 text-slate-500 shrink-0" />
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="w-full text-sm outline-none bg-transparent text-slate-800"
              placeholder="e.g. https://swagger.io or https://docs.example.com"
            />
          </div>
        </div>

        {/* Icon Type Selection */}
        <div>
          <label className="block text-xs font-semibold text-slate-500 mb-2.5">
            SELECT RESOURCE TYPE / ICON
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            {ICON_OPTIONS.map((opt) => {
              const Icon = opt.icon;
              const isSelected = selectedIcon === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setSelectedIcon(opt.id)}
                  className={`flex items-center gap-2.5 p-2.5 rounded-lg border text-left transition-all ${
                    isSelected
                      ? "border-cyan-600 bg-cyan-50/50 text-cyan-900 font-medium shadow-sm ring-1 ring-cyan-600"
                      : "border-slate-200 hover:border-slate-300 text-slate-700 bg-white"
                  }`}
                >
                  <span
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                      isSelected ? "bg-cyan-600 text-white" : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </span>
                  <span className="text-xs truncate">{opt.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Sticky Bottom Actions */}
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
          disabled={isSaving || !title.trim()}
          className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-cyan-600 rounded-lg hover:bg-cyan-700 transition-colors disabled:opacity-50"
        >
          {isSaving && <Loader2 className="w-4 h-4 animate-spin inline mr-2" />}
          {isEditing ? "Save Changes" : "Add Resource"}
        </button>
      </div>
    </form>
  );
}
