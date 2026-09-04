import {
  Activity,
  BarChart3,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  Download,
  LogIn,
  Users,
} from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";

const weeklyVisits = [112, 114, 108, 129, 138, 96, 111];
const monthlyUsers = [0, 0, 0, 0, 0, 0, 0, 0, 0, 34, 24, 0];

function StatCard({ children }: { children: React.ReactNode }) {
  return <section className="p-5 bg-white shadow-sm rounded-2xl ring-1 ring-slate-200/70">{children}</section>;
}

export default function DashboardOverview() {
  const role = useAuthStore((state) => state.role);

  if (role !== "admin") {
    return (
      <div className="p-6 text-slate-600 sm:p-8">
        <h2 className="text-2xl font-semibold text-slate-800">Welcome to Training Platform</h2>
        <p className="mt-2">Explore the available training courses from the sidebar.</p>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-[#edf2f6] p-4 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-5">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#dce8f0] text-lg font-bold text-[#1e2b3f]">AD</div>
          <div><h2 className="text-xl font-bold text-[#1e2b3f]">Administrator dashboard</h2><p className="text-sm text-slate-500">Training platform overview</p></div>
        </div>
        <button className="flex items-center gap-2 rounded-xl bg-[#078baa] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#007792]"><Download className="w-4 h-4" /> Download report</button>
      </div>

      <div className="grid gap-5 xl:grid-cols-3">
        <StatCard>
          <div className="flex items-center justify-between text-slate-600"><span className="flex items-center gap-2 font-semibold"><Activity className="w-5 h-5" /> Course progress</span><span className="flex items-center gap-1 rounded-xl bg-slate-100 px-3 py-1.5 text-sm"><CalendarDays className="w-4 h-4" /> 2026</span></div>
          <div className="relative mx-auto mt-5 h-32 max-w-[270px] overflow-hidden"><svg viewBox="0 0 240 135" className="w-full h-full" aria-label="34 active courses"><path d="M 30 116 A 90 90 0 0 1 210 116" fill="none" stroke="#e2e8f0" strokeWidth="24" /><path d="M 30 116 A 90 90 0 0 1 159 33" fill="none" stroke="#22c55e" strokeWidth="24" /><path d="M 159 33 A 90 90 0 0 1 210 116" fill="none" stroke="#fbbf24" strokeWidth="24" /></svg><div className="absolute inset-x-0 text-center bottom-2"><strong className="block text-2xl text-[#1e2b3f]">34</strong><span className="text-xs text-slate-500">courses</span></div></div>
          <div className="flex justify-center gap-4 mt-2 text-xs text-slate-500"><span><i className="mr-1 inline-block h-2.5 w-2.5 rounded-full bg-green-500" />Active 24</span><span><i className="mr-1 inline-block h-2.5 w-2.5 rounded-full bg-amber-500" />Draft 10</span><span><i className="mr-1 inline-block h-2.5 w-2.5 rounded-full bg-red-500" />Archived 0</span></div>
        </StatCard>

        <StatCard>
          <div className="flex items-center justify-between text-slate-600"><span className="flex items-center gap-2 font-semibold"><BookOpen className="w-5 h-5" /> Learning sources</span><span className="flex items-center gap-1 rounded-xl bg-slate-100 px-3 py-1.5 text-sm"><CalendarDays className="w-4 h-4" /> 2026</span></div>
          <div className="flex items-center justify-center mt-7 gap-7"><div className="grid h-36 w-36 place-items-center rounded-full bg-[conic-gradient(#2654d8_0deg_360deg,#e2e8f0_360deg)] p-3"><div className="grid w-full h-full text-center bg-white rounded-full place-items-center"><strong className="text-2xl text-[#1e2b3f]">7</strong><span className="-mt-4 text-xs text-slate-500">items</span></div></div><div className="space-y-4 text-sm text-slate-600"><p className="flex items-center justify-between gap-8"><span><i className="mr-2 inline-block h-3 w-3 rounded-full bg-[#2654d8]" />Training links</span><b className="text-[#1e2b3f]">7</b></p><p className="flex items-center justify-between gap-8"><span><i className="mr-2 inline-block h-3 w-3 rounded-full bg-[#2dd4bf]" />QR codes</span><b className="text-[#1e2b3f]">0</b></p><p className="flex items-center justify-between gap-8"><span><i className="inline-block w-3 h-3 mr-2 bg-teal-500 rounded-full" />Other</span><b className="text-[#1e2b3f]">0</b></p></div></div>
        </StatCard>

        <StatCard>
          <div className="flex items-center justify-between text-slate-600"><span className="flex items-center gap-2 font-semibold"><LogIn className="w-5 h-5" /> Weekly visits</span><span className="rounded-xl bg-slate-100 px-3 py-1.5 text-sm">This week</span></div>
          <div className="mt-7 flex h-36 items-end gap-1.5 border-b border-[#85a9df] px-3">{weeklyVisits.map((value, index) => <div key={index} className="flex-1 bg-[#5c98ea]" style={{ height: `${value / 1.55}%` }} />)}</div><div className="mt-2 flex justify-around text-[11px] text-slate-400"><span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span></div>
        </StatCard>
      </div>

      <StatCard>
        <div className="flex flex-wrap items-center justify-between gap-3 text-slate-600"><span className="flex items-center gap-2 font-semibold"><Users className="w-5 h-5" /> Trainees</span><span className="flex items-center gap-1 rounded-xl bg-slate-100 px-3 py-1.5 text-sm"><CalendarDays className="w-4 h-4" /> 2026</span></div>
        <div className="mt-6 h-64 rounded-lg bg-[repeating-linear-gradient(to_bottom,transparent_0,transparent_39px,#e6edf5_40px)] px-4 pt-4"><div className="flex items-end justify-around h-full gap-2">{monthlyUsers.map((value, index) => <div key={index} className="flex items-end justify-center flex-1 h-full gap-1"><i className="w-3 max-w-[24px] bg-[#3e7fe7] sm:w-5" style={{ height: `${value * 4.5}px` }} /><i className="w-3 max-w-[24px] bg-[#16b981] sm:w-5" style={{ height: `${value * 3.2}px` }} /></div>)}</div></div>
        <div className="flex justify-center gap-6 mt-3 text-sm text-slate-500"><span><i className="mr-2 inline-block h-3 w-3 rounded-full bg-[#3e7fe7]" />New trainees</span><span><i className="mr-2 inline-block h-3 w-3 rounded-full bg-[#16b981]" />Completed trainees</span></div>
      </StatCard>

      <div className="grid gap-4 mt-5 sm:grid-cols-3">{[{ label: "Active trainees", value: "34", icon: Users }, { label: "Completed courses", value: "24", icon: CheckCircle2 }, { label: "Total activity", value: "112", icon: BarChart3 }].map(({ label, value, icon: Icon }) => <div key={label} className="flex items-center gap-3 p-4 bg-white shadow-sm rounded-xl ring-1 ring-slate-200/70"><Icon className="h-8 w-8 text-[#078baa]" /><div><p className="text-sm text-slate-500">{label}</p><strong className="text-xl text-[#1e2b3f]">{value}</strong></div></div>)}</div>
    </div>
  );
}
