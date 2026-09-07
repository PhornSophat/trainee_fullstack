import { HelpCircle, Plus } from "lucide-react";
import type { CourseFAQ } from "@/types/course";

export function QnASection({ faqs }: { faqs?: CourseFAQ[] }) {
  const defaultFaqs = [
    {
      question: "តើអ្នកណាភាសាសមស្របសម្រាប់វគ្គ API/Backend Developer?",
      answer: "វគ្គនេះស័ក្តិសមសម្រាប់អ្នកចង់អភិវឌ្ឍជំនាញ API/Backend Developer តាមរយៈមេរៀនណែនាំ ការអនុវត្ត និងការងារគម្រោង។",
    },
    {
      question: "តើខ្ញុំត្រូវមានបទពិសោធន៍មុនទេ?",
      answer: "ត្រូវមានមូលដ្ឋានគ្រឹះកុំព្យូទ័រ និងចំណាប់អារម្មណ៍ក្នុងការអនុវត្ត។ មេរៀននឹងដឹកនាំពីមូលដ្ឋានទៅការអនុវត្តជាក់ស្តែង។",
    },
    {
      question: "ក្រោយរៀនចប់ ខ្ញុំទទួលបានអ្វី?",
      answer: "អ្នកនឹងមាន documented backend API and database implementation និងអាចប្រើប្រាស់វាសម្រាប់បន្តរៀន ឬបង្ហាញលទ្ធផលការងារ។",
    },
  ];

  const items = faqs && faqs.length > 0 ? faqs : defaultFaqs;

  return (
    <section className="px-5 py-4 pb-8 font-kantumruy">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-bold text-[#60738d]">Q&A</h3>
        <button type="button" className="p-1 text-slate-400 hover:text-slate-600">
          <Plus className="w-4 h-4" />
        </button>
      </div>
      <div className="space-y-3">
        {items.map((item, idx) => (
          <div key={idx} className="flex items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-300 text-slate-700 mt-0.5">
              <HelpCircle className="w-6 h-6" />
            </span>
            <div className="flex-1 min-w-0 pb-3 border-b border-slate-200">
              <h4 className="text-sm font-bold leading-snug text-slate-800">{item.question}</h4>
              {item.answer && <p className="mt-1 text-xs leading-relaxed text-slate-500">{item.answer}</p>}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
