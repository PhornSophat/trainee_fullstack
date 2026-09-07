import type { LucideIcon } from "lucide-react";

type InfoRowProps = {
  icon: LucideIcon;
  label: string;
  value: string;
};

export function InfoRow({ icon: Icon, label, value }: InfoRowProps) {
  return (
    <div className="flex items-start gap-3">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-300 text-slate-700 mt-0.5">
        <Icon className="w-6 h-6" />
      </span>
      <div className="flex-1 min-w-0 pb-3 border-b border-slate-200">
        <span className="block text-xs text-slate-400">{label}</span>
        <p className="text-sm font-medium leading-snug text-slate-800 mt-0.5">{value}</p>
      </div>
    </div>
  );
}
