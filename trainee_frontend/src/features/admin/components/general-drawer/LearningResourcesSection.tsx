import { Code2, Database, FileText, Server, Plus } from "lucide-react";

export function LearningResourcesSection() {
  const resources = [
    { icon: Code2, title: "API contract examples" },
    { icon: Database, title: "Database schema guide" },
    { icon: FileText, title: "Postman collection" },
    { icon: Server, title: "Backend deployment checklist" },
  ];

  return (
    <section className="px-5 py-4 border-b border-slate-100 font-kantumruy">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-bold text-[#60738d]">Learning Resources</h3>
        <button type="button" className="p-1 text-slate-400 hover:text-slate-600">
          <Plus className="w-4 h-4" />
        </button>
      </div>
      <div className="space-y-2">
        {resources.map((res, idx) => {
          const Icon = res.icon;
          return (
            <div key={idx} className="flex items-center gap-3 text-slate-800">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-300 text-slate-700">
                <Icon className="w-6 h-6" />
              </span>
              <div className="flex-1 min-w-0 py-2.5 border-b border-slate-200">
                <span className="text-sm font-medium">{res.title}</span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
