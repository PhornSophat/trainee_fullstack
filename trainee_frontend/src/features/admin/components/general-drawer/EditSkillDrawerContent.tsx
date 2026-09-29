import { useCoursesStore } from "@/store/courseStore";
import { useToastStore } from "@/store/useToastStore";
import type { CourseCardItem } from "@/types/course"
import { useState } from "react";
import {
    Pencil,
    Loader2
} from "lucide-react";

type EditSkillDrawerContentProps = {
    course: CourseCardItem;
    initialText?: string;
    skillIndex?: number;
    onCancel: () => void;
};

export function EditSkillDrawerContent({
    course,
    initialText = '',
    skillIndex,
    onCancel
}: EditSkillDrawerContentProps) {
    const updateCourse = useCoursesStore((s) => s.updateCourse)
    const showToast = useToastStore((s) => s.showToast)

    const [text, setText] = useState(initialText);
    const [isSaving, setIsSaving] = useState(false);
    const isEditing = skillIndex !== undefined;

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!text.trim()) return;

        setIsSaving(true);
        try {
            const currentSkills = [...(course.skills || [])];

            if (isEditing) {
                currentSkills[skillIndex] = text.trim();
            } else {
                currentSkills.push(text.trim());
            }

            await updateCourse(course.id, { skills: currentSkills });   
            showToast(isEditing ? "កែប្រែជំនាញជោគជ័យ!" : "បានបន្ថែមជំនាញជោគជ័យ!", "success");
            onCancel();
        } catch (error) {
            console.error("Failed to update course skills:", error);
            showToast("បរាជ័យក្នុងការរក្សាទុក", "error");
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!isEditing) return;
        setIsSaving(true);

        try {
            const currentSkills = (course.skills || []).filter((_, i) => i !== skillIndex);
            await updateCourse(course.id, { skills: currentSkills });
            showToast("បានលុបជំនាញដោយជោគជ័យ!", "success");
            onCancel();
        } catch (error) {
            console.error("Failed to delete course skill:", error);
            showToast("បរាជ័យក្នុងការលុបជំនាញ", "error");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <form onSubmit={handleSave} className="flex-1 flex flex-col justify-between font-kantumruy">
            <div className="p-6 space-y-6">
                <div className="relative">
                    <label className="absolute -top-2.5 left-3 bg-white px-1 text-xs font-medium text-slate-500 z-10">
                        {isEditing ? "Edit Skill" : "Add New Skill"}*
                    </label>
                    <div className="flex items-center gap-3 px-3 py-3 border rounded-lg border-slate-300 focus-within:border-cyan-600">
                        <Pencil className="w-4 h-4 text-slate-500 shrink-0" />
                        <input
                            type="text"
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                            required
                            className="w-full text-sm outline-none bg-transparent text-slate-800"
                            placeholder={isEditing ? "Edit skill text..." : "Enter new skill..."}
                        />
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
                    disabled={isSaving || !text.trim()}
                    className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-cyan-600 rounded-lg hover:bg-cyan-700 transition-colors disabled:opacity-50"
                >
                    {isSaving && <Loader2 className="w-4 h-4 animate-spin inline mr-2" />}
                    {isEditing ? "Save Changes" : "Add Skill"}
                </button>
            </div>
        </form>
    );
}
