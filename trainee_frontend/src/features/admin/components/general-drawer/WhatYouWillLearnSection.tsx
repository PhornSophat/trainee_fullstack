import { Check, Plus } from "lucide-react";

export function WhatYouWillLearnSection({ skills }: { skills?: string[] }) {
  const defaultSkills = [
    "យល់ពីមូលដ្ឋានគ្រឹះ និង workflow សម្រាប់ API/Backend Developer",
    "REST API design, validation, authentication, and permissions",
    "Database modeling, queries, transactions, and caching",
    "Backend testing, documentation, deployment, and monitoring",
    "អនុវត្តគម្រោង និងរៀបចំការបង្ហាញលទ្ធផលសម្រាប់ API/Backend Developer",
  ];

  const items = skills && skills.length > 0 ? skills : defaultSkills;

  return (
    <section className="px-5 py-4 border-b border-slate-100 font-kantumruy">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-bold text-[#60738d]">What you will learn</h3>
        <button type="button" className="p-1 text-slate-400 hover:text-slate-600">
          <Plus className="w-4 h-4" />
        </button>
      </div>
      <ul className="space-y-3">
        {items.map((skill, index) => (
          <li key={index} className="flex items-start gap-3 text-sm text-slate-700">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-300 text-slate-700 mt-0.5">
              <Check className="w-6 h-6" />
            </span>
            <div className="flex-1 min-w-0 pb-3 border-b border-slate-200">
              <span className="leading-snug block pt-2">{skill}</span>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
