import { useCoursesStore } from "@/store/courseStore";
import { useToastStore } from "@/store/useToastStore";
import type { CourseCardItem, CourseFAQ } from "@/types/course";
import { useState } from "react";
import { HelpCircle, MessageSquare, Loader2 } from "lucide-react";

type EditFaqDrawerContentProps = {
  course: CourseCardItem;
  initialFaq?: CourseFAQ;
  faqIndex?: number;
  onCancel: () => void;
};

export function EditFaqDrawerContent({
  course,
  initialFaq,
  faqIndex,
  onCancel,
}: EditFaqDrawerContentProps) {
  const updateCourse = useCoursesStore((s) => s.updateCourse);
  const showToast = useToastStore((s) => s.showToast);

  const [question, setQuestion] = useState(initialFaq?.question || "");
  const [answer, setAnswer] = useState(initialFaq?.answer || "");
  const [isSaving, setIsSaving] = useState(false);
  const isEditing = faqIndex !== undefined;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim()) return;

    setIsSaving(true);
    try {
      const currentFaqs: CourseFAQ[] = [...(course.faqs || [])];
      const newFaqData: CourseFAQ = {
        question: question.trim(),
        answer: answer.trim(),
      };

      if (isEditing) {
        currentFaqs[faqIndex] = newFaqData;
      } else {
        currentFaqs.push(newFaqData);
      }

      await updateCourse(course.id, { faqs: currentFaqs });
      showToast(isEditing ? "កែប្រែសំណួរ-ចម្លើយជោគជ័យ!" : "បានបន្ថែមសំណួរ-ចម្លើយជោគជ័យ!", "success");
      onCancel();
    } catch (error) {
      console.error("Failed to update course FAQs:", error);
      showToast("បរាជ័យក្នុងការរក្សាទុក", "error");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!isEditing) return;
    setIsSaving(true);

    try {
      const currentFaqs = (course.faqs || []).filter((_, i) => i !== faqIndex);
      await updateCourse(course.id, { faqs: currentFaqs });
      showToast("បានលុបសំណួរ-ចម្លើយជោគជ័យ!", "success");
      onCancel();
    } catch (error) {
      console.error("Failed to delete FAQ:", error);
      showToast("បរាជ័យក្នុងការលុបសំណួរ-ចម្លើយ", "error");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSave} className="flex-1 flex flex-col justify-between font-kantumruy">
      <div className="p-6 space-y-6">
        {/* Question */}
        <div className="relative">
          <label className="absolute -top-2.5 left-3 bg-white px-1 text-xs font-medium text-slate-500 z-10">
            {isEditing ? "Edit Question" : "New Question"}*
          </label>
          <div className="flex items-center gap-3 px-3 py-3 border rounded-lg border-slate-300 focus-within:border-cyan-600">
            <HelpCircle className="w-4 h-4 text-slate-500 shrink-0" />
            <input
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              required
              className="w-full text-sm outline-none bg-transparent text-slate-800"
              placeholder="e.g. តើវគ្គនេះស័ក្តិសមសម្រាប់អ្នកណា?..."
            />
          </div>
        </div>

        {/* Answer */}
        <div className="relative">
          <label className="absolute -top-2.5 left-3 bg-white px-1 text-xs font-medium text-slate-500 z-10">
            Answer
          </label>
          <div className="flex items-start gap-3 px-3 py-3 border rounded-lg border-slate-300 focus-within:border-cyan-600">
            <MessageSquare className="w-4 h-4 text-slate-500 shrink-0 mt-1" />
            <textarea
              rows={4}
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              className="w-full text-sm outline-none bg-transparent text-slate-800 resize-none"
              placeholder="Enter answer details..."
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
          disabled={isSaving || !question.trim()}
          className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-cyan-600 rounded-lg hover:bg-cyan-700 transition-colors disabled:opacity-50"
        >
          {isSaving && <Loader2 className="w-4 h-4 animate-spin inline mr-2" />}
          {isEditing ? "Save Changes" : "Add Question & Answer"}
        </button>
      </div>
    </form>
  );
}
