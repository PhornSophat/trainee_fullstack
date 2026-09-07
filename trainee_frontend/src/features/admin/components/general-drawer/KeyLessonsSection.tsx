import { Code2, Database, Server, Plus } from "lucide-react";
import type { KeyLesson } from "@/types/course";

export function KeyLessonsSection({ keyLessons }: { keyLessons?: KeyLesson[] }) {
  const defaultLessons = [
    {
      title: "រចនា API",
      description:
        "រៀបចំកំណត់ Route DTO Validation Authentication Authorization និង Response Contract សម្រាប់ API.",
    },
    {
      title: "Database និង Service",
      description:
        "អនុវត្តការរចនា Table Relation Query Transaction និងការរៀបចំ Service Logic ឱ្យច្បាស់លាស់.",
    },
    {
      title: "ចេញផ្សាយ Backend",
      description:
        "រៀបចំ Documentation Test Deployment Monitoring និងការចែករំលែក Backend បន្ទាប់ពីដាក់ឱ្យប្រើប្រាស់.",
    },
  ];

  const items = keyLessons && keyLessons.length > 0 ? keyLessons : defaultLessons;
  const icons = [Code2, Database, Server];

  return (
    <section className="px-5 py-4 border-b border-slate-100 font-kantumruy">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-bold text-[#60738d]">Key Lessons</h3>
        <button type="button" className="p-1 text-slate-400 hover:text-slate-600">
          <Plus className="w-4 h-4" />
        </button>
      </div>
      <div className="space-y-3">
        {items.map((item, idx) => {
          const Icon = icons[idx % icons.length];
          return (
            <div key={idx} className="flex items-start gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-300 text-slate-700 mt-0.5">
                <Icon className="w-6 h-6" />
              </span>
              <div className="flex-1 min-w-0 pb-3 border-b border-slate-200">
                <h4 className="text-sm font-bold text-slate-800">{item.title}</h4>
                <p className="mt-0.5 text-xs text-slate-500 leading-relaxed">{item.description}</p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
