import { useState, useEffect } from "react";
import {
  ArrowLeft,
  BarChart2,
  CheckCircle2,
  ChevronRight,
  Layers,
  MessageCircle,
  MoreVertical,
  Network,
  Pencil,
  ScrollText,
  Star,
  XCircle,
} from "lucide-react";
import { useCourseRequestDrawerStore } from "@/store/useCourseRequestDrawerStore";
import { useCoursesStore } from "@/store/courseStore";
import { useNotificationStore } from "@/store/useNotificationStore";
import { useToastStore } from "@/store/useToastStore";
import { setCourseApproval } from "@/services/courseService";
import type { ApprovalStatus } from "@/types/course";
import userProfileImg from "@/assets/images/e20220628.jpg";

// Custom SVG illustration representing the workspace shown in the reference design
function WorkspaceIllustration() {
  return (
    <svg
      viewBox="0 0 280 200"
      className="w-full h-full object-contain filter drop-shadow-sm select-none"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Ground soft shadow */}
      <ellipse cx="140" cy="180" rx="90" ry="12" fill="#E2E8F0" opacity="0.6" />

      {/* Left flowchart/diagram board */}
      <rect x="36" y="42" width="60" height="74" rx="4" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="1.5" />
      <rect x="42" y="48" width="48" height="4" rx="2" fill="#0284C7" />
      <circle cx="48" cy="62" r="4" fill="#38BDF8" />
      <circle cx="78" cy="62" r="4" fill="#38BDF8" />
      <circle cx="63" cy="76" r="4" fill="#0284C7" />
      <circle cx="50" cy="94" r="3" fill="#94A3B8" />
      <circle cx="76" cy="94" r="3" fill="#94A3B8" />
      <path d="M48 66L63 72L78 66" stroke="#CBD5E1" strokeWidth="1.5" fill="none" />
      <path d="M63 80L50 91M63 80L76 91" stroke="#CBD5E1" strokeWidth="1.5" fill="none" />

      {/* Main Developer Desk */}
      <path d="M50 148H200L185 174H65L50 148Z" fill="#F1F5F9" stroke="#E2E8F0" strokeWidth="1.5" />

      {/* Main Front Monitor */}
      <rect x="68" y="58" width="82" height="58" rx="4" fill="#0F172A" />
      <rect x="71" y="61" width="76" height="52" rx="3" fill="#1E293B" />
      {/* Code syntax lines in monitor */}
      <rect x="76" y="67" width="20" height="3" rx="1.5" fill="#38BDF8" />
      <rect x="100" y="67" width="16" height="3" rx="1.5" fill="#F43F5E" />
      <rect x="80" y="74" width="28" height="2.5" rx="1" fill="#F59E0B" />
      <rect x="112" y="74" width="18" height="2.5" rx="1" fill="#10B981" />
      <rect x="80" y="80" width="36" height="2.5" rx="1" fill="#94A3B8" />
      <rect x="84" y="86" width="24" height="2.5" rx="1" fill="#38BDF8" />
      <rect x="112" y="86" width="20" height="2.5" rx="1" fill="#F43F5E" />
      <rect x="76" y="94" width="16" height="2.5" rx="1" fill="#F59E0B" />
      <rect x="96" y="94" width="30" height="2.5" rx="1" fill="#38BDF8" />
      <rect x="76" y="101" width="40" height="2.5" rx="1" fill="#10B981" />

      {/* Monitor Stand */}
      <rect x="105" y="116" width="8" height="14" fill="#64748B" />
      <ellipse cx="109" cy="130" rx="16" ry="3" fill="#475569" />

      {/* Second Angled Screen / Laptop */}
      <path d="M125 76L166 70L168 116L126 122Z" fill="#1E293B" stroke="#0F172A" strokeWidth="1" />
      <path d="M128 78L163 73L165 113L129 119Z" fill="#0F172A" />
      {/* Laptop code lines */}
      <path d="M133 84L150 82" stroke="#38BDF8" strokeWidth="2" strokeLinecap="round" />
      <path d="M133 90L158 87" stroke="#F43F5E" strokeWidth="2" strokeLinecap="round" />
      <path d="M133 96L148 94" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" />
      <path d="M133 102L156 99" stroke="#10B981" strokeWidth="2" strokeLinecap="round" />
      <path d="M133 108L145 106" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" />
      {/* Laptop base */}
      <path d="M120 123L168 117L178 131L128 136Z" fill="#334155" />

      {/* Blue Gears on the floor/desk */}
      <g transform="translate(100, 140)">
        <circle cx="12" cy="12" r="9" fill="#0284C7" />
        <circle cx="12" cy="12" r="4.5" fill="#F1F5F9" />
        <rect x="10.5" y="1" width="3" height="4" rx="1" fill="#0284C7" />
        <rect x="10.5" y="19" width="3" height="4" rx="1" fill="#0284C7" />
        <rect x="1" y="10.5" width="4" height="3" rx="1" fill="#0284C7" />
        <rect x="19" y="10.5" width="4" height="3" rx="1" fill="#0284C7" />
      </g>
      <g transform="translate(85, 146)">
        <circle cx="9" cy="9" r="7" fill="#38BDF8" />
        <circle cx="9" cy="9" r="3.5" fill="#F1F5F9" />
        <rect x="7.8" y="0.5" width="2.4" height="3" rx="0.8" fill="#38BDF8" />
        <rect x="7.8" y="14.5" width="2.4" height="3" rx="0.8" fill="#38BDF8" />
        <rect x="0.5" y="7.8" width="3" height="2.4" rx="0.8" fill="#38BDF8" />
        <rect x="14.5" y="7.8" width="3" height="2.4" rx="0.8" fill="#38BDF8" />
      </g>

      {/* Floating UI tags */}
      <rect x="42" y="112" width="20" height="15" rx="3" fill="#0284C7" />
      <path d="M47 119.5L50 116.5M47 119.5L50 122.5M57 119.5L54 116.5M57 119.5L54 122.5" stroke="#FFFFFF" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />

      {/* Standing Developer Person on the right */}
      {/* Legs */}
      <rect x="192" y="132" width="8" height="42" rx="3" fill="#334155" />
      <rect x="203" y="132" width="8" height="42" rx="3" fill="#1E293B" />
      {/* Shoes */}
      <ellipse cx="196" cy="175" rx="6" ry="2.5" fill="#0F172A" />
      <ellipse cx="207" cy="175" rx="6" ry="2.5" fill="#0F172A" />
      {/* Body / Shirt */}
      <path d="M188 94C188 90 193 88 202 88C211 88 216 90 216 94L218 134H186L188 94Z" fill="#F43F5E" />
      {/* Head */}
      <circle cx="202" cy="74" r="8" fill="#FDBA74" />
      {/* Hair */}
      <path d="M195 72C195 67 198 64 204 64C210 64 211 67 211 72C208 70 205 70 195 72Z" fill="#0F172A" />
      {/* Arm holding tablet */}
      <path d="M188 97L178 112L192 118" stroke="#FDBA74" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" />
      <rect x="174" y="106" width="16" height="11" rx="2" fill="#0284C7" transform="rotate(-15 174 106)" />
    </svg>
  );
}

export function CourseRequestDrawer() {
  const isOpen = useCourseRequestDrawerStore((s) => s.isOpen);
  const data = useCourseRequestDrawerStore((s) => s.data);
  const closeDrawer = useCourseRequestDrawerStore((s) => s.closeDrawer);

  const courses = useCoursesStore((s) => s.courses);
  const targetCourse = courses.find((c) => String(c.id) === String(data?.courseId));

  const [activeTab, setActiveTab] = useState<"records" | "chat" | "workflow">("records");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Local approval status that updates immediately upon clicking
  const [decisionStatus, setDecisionStatus] = useState<string | null>(null);

  // Always reset local decision whenever drawer opens or course changes
  useEffect(() => {
    setDecisionStatus(null);
  }, [data?.courseId, isOpen]);

  const currentStatus =
    decisionStatus ||
    data?.approvalStatus ||
    targetCourse?.approvalStatus ||
    "PENDING";

  const courseTitle = data?.courseTitle || targetCourse?.title || "Fullstack Developer";
  const courseKhmerTitle =
    data?.courseKhmerTitle || targetCourse?.khmerTitle || "អភិវឌ្ឍប្រព័ន្ធឌីជីថល";
  const courseLevel = data?.courseLevel || targetCourse?.level || "INTERMEDIATE";
  const lessonsCount = data?.courseLessons ?? targetCourse?.lessons ?? 10;
  const tasksCount = data?.courseTasks ?? (targetCourse?.tasks ?? 9);

  const requesterName = data?.requesterName || "សុផាត ផន";
  const requesterDept = data?.requesterDepartment || "បច្ចេកវិទ្យាព័ត៌មាន";
  const requesterYear = data?.requesterYear || "Y1";
  const requesterAvatar =
    data?.requesterAvatar ||
    userProfileImg;

  const handleDecision = async (status: ApprovalStatus) => {
    if (!data?.courseId) return;
    setIsSubmitting(true);
    try {
      await setCourseApproval(data.courseId, status);
      useCoursesStore.getState().setCourseStatus(data.courseId, status);
      setDecisionStatus(status);

      const isApproved = status === "APPROVED";
      useNotificationStore.getState().addNotification({
        type: isApproved ? "COURSE_APPROVED" : "COURSE_REJECTED",
        title: "សំណើចូលរៀនជំនាញសិក្សា",
        breadcrumb: `${courseKhmerTitle} > សំណើ`,
        message: isApproved
          ? `ខូច គឿន បានអនុម័តសំណើក្នុងការចូលរួម ${courseTitle}`
          : `ខូច គឿន បានបដិសេធសំណើក្នុងការចូលរួម ${courseTitle}`,
        timeAgo: "ទើបតែឥឡូវនេះ",
        senderName: "ខូច គឿន",
        avatarUrl: userProfileImg,
        courseId: data.courseId,
        courseTitle: courseTitle,
        targetUrl: `/trainee/programs/${data.courseId}`,
        forRole: "user",
      });

      useToastStore
        .getState()
        .showToast(
          isApproved ? "បានឯកភាពសំណើជោគជ័យ!" : "បានបដិសេធសំណើ!",
          isApproved ? "success" : "warning"
        );
    } catch (err) {
      console.error("Decision failed:", err);
      useToastStore.getState().showToast("មានបញ្ហាក្នុងការសម្រេចចិត្ត សូមព្យាយាមម្តងទៀត", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getLevelKhmer = (lvl: string) => {
    switch (lvl.toUpperCase()) {
      case "BASIC":
        return "កម្រិតដំបូង";
      case "INTERMEDIATE":
        return "កម្រិតមធ្យម";
      case "ADVANCED":
        return "កម្រិតខ្ពស់";
      default:
        return "កម្រិតមធ្យម";
    }
  };

  return (
    <div
      className={`fixed inset-0 z-50 transition-opacity duration-300 ${
        isOpen && data ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
      }`}
    >
      {/* Dark backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-[2px] transition-opacity"
        onClick={closeDrawer}
      />

      {/* Right sliding container */}
      <aside
        className={`absolute inset-y-0 right-0 flex w-full max-w-[840px] bg-white shadow-2xl transition-transform duration-300 ease-out font-kantumruy ${
          isOpen && data ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Protruding circular Back Arrow Button */}
        {isOpen && (
          <button
            type="button"
            onClick={closeDrawer}
            aria-label="Close drawer"
            className="absolute -left-4 top-3.5 flex h-9 w-9 -translate-x-1/2 items-center justify-center rounded-full bg-white text-[#60738d] shadow-md hover:text-slate-900 border border-slate-200/90 z-50 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 text-slate-600" />
          </button>
        )}

        {/* Inner Two-Column Layout */}
        <div className="flex w-full h-full overflow-hidden">
          {/* ================= LEFT COLUMN: Course & Requester Profile ================= */}
          <div className="w-[390px] shrink-0 border-r border-slate-200/80 flex flex-col bg-white overflow-y-auto">
            {/* Top Header */}
            <div className="flex items-center justify-between px-6 h-13 border-b border-slate-100 shrink-0">
              <h3 className="text-[15px] font-semibold text-slate-800 tracking-tight">
                សំណើចុះឈ្មោះចូលរៀន
              </h3>
              <button
                type="button"
                className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
              >
                <MoreVertical className="w-4 h-4" />
              </button>
            </div>

            {/* Requester Row */}
            <div className="flex items-center justify-between px-6 py-3.5 border-b border-slate-100 hover:bg-slate-50/80 transition cursor-pointer shrink-0">
              <div className="flex items-center gap-3 min-w-0">
                <div className="relative">
                  <img
                    src={requesterAvatar}
                    alt={requesterName}
                    className="w-10 h-10 rounded-full object-cover ring-1 ring-slate-200 shadow-sm"
                  />
                  <span className="absolute -bottom-0.5 -right-0.5 flex h-3.5 px-1 items-center justify-center rounded-full bg-emerald-600 text-[7.5px] font-semibold text-white ring-1 ring-white">
                    KIT
                  </span>
                </div>
                <div className="truncate">
                  <h4 className="text-sm font-semibold text-slate-800 truncate">
                    {requesterName}
                  </h4>
                  <p className="text-xs text-slate-400 font-normal truncate mt-0.5">
                    {requesterDept} • {requesterYear}
                  </p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400 shrink-0 ml-2" />
            </div>

            {/* Course Card Detail (Centered) */}
            <div className="flex-1 flex flex-col items-center justify-center px-6 py-5 text-center">
              <div className="relative w-56 h-46 flex items-center justify-center mb-3">
                <WorkspaceIllustration />
              </div>

              <h2 className="text-[18px] font-semibold text-slate-800 leading-snug">
                {courseKhmerTitle}
              </h2>
              <p className="text-xs text-slate-500 font-normal mt-0.5">
                {courseTitle}
              </p>

              {/* Chips & Badges */}
              <div className="flex flex-wrap items-center justify-center gap-3 mt-4 text-xs">
                <span className="px-2.5 py-0.5 rounded-full bg-[#FFF9EA] text-[#D97706] font-medium border border-amber-200/50">
                  {getLevelKhmer(courseLevel)}
                </span>
                <span className="flex items-center gap-1.5 text-slate-500 font-normal">
                  <BarChart2 className="w-3.5 h-3.5 text-slate-400" />
                  {lessonsCount} មេរៀន
                </span>
                <span className="flex items-center gap-1.5 text-slate-500 font-normal">
                  <Layers className="w-3.5 h-3.5 text-slate-400" />
                  {tasksCount} កិច្ចការ
                </span>
              </div>

              {/* Subtle divider line below course badges */}
              <div className="w-full border-b border-slate-100 mt-6" />
            </div>
          </div>

          {/* ================= RIGHT COLUMN: Timeline & Activity Workflow ================= */}
          <div className="flex-1 flex flex-col bg-[#F4F6F9] min-w-0">
            {/* Top Navigation Tabs */}
            <div className="p-3 shrink-0">
              <div className="flex items-center bg-[#E9EEF3] p-1 rounded-xl gap-1">
                <button
                  type="button"
                  onClick={() => setActiveTab("records")}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg text-xs font-medium transition ${
                    activeTab === "records"
                      ? "bg-white text-teal-700 shadow-sm"
                      : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  <ScrollText className="w-3.5 h-3.5 text-teal-600" />
                  <span>កំណត់ត្រា</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("chat")}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg text-xs font-medium transition ${
                    activeTab === "chat"
                      ? "bg-white text-teal-700 shadow-sm"
                      : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>ជជែក</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("workflow")}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg text-xs font-medium transition ${
                    activeTab === "workflow"
                      ? "bg-white text-teal-700 shadow-sm"
                      : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  <Network className="w-3.5 h-3.5" />
                  <span>លំហូរ</span>
                </button>
              </div>
            </div>

            {/* Timeline Stream */}
            <div className="flex-1 overflow-y-auto px-6 py-2 relative [scrollbar-width:thin]">
              {/* Vertical connecting line */}
              <div className="absolute left-[39px] top-6 bottom-10 w-[1.5px] bg-[#CBD5E1] z-0" />

              <div className="space-y-6 relative z-10">
                {/* ---------- Step 1: ស្នើសុំ (Request) ---------- */}
                <div>
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-full bg-[#8FA2B4] text-white flex items-center justify-center shrink-0 shadow-sm">
                      <Pencil className="w-3.5 h-3.5" />
                    </div>
                    <h4 className="text-xs font-semibold text-slate-800">ស្នើសុំ</h4>
                  </div>

                  <div className="pl-10 mt-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <img
                          src={requesterAvatar}
                          alt={requesterName}
                          className="w-7 h-7 rounded-full object-cover ring-1 ring-slate-200"
                        />
                        <div>
                          <p className="text-xs font-semibold text-slate-800">{requesterName}</p>
                          <p className="text-[10px] text-slate-400 font-normal">
                            {requesterDept} • KIT • {requesterYear}
                          </p>
                        </div>
                      </div>
                      <span className="text-[11px] text-slate-400 font-normal">4m</span>
                    </div>

                    <div className="mt-2 bg-white border border-slate-100 rounded-2xl px-3.5 py-2.5 text-xs text-slate-700 font-normal shadow-[0_1px_2px_rgba(0,0,0,0.02)] leading-relaxed">
                      {data?.requestNote || `ខ្ញុំសុំចូលរៀនវគ្គ${courseKhmerTitle}`}
                    </div>
                  </div>
                </div>

                {/* ---------- Step 2: ត្រួតពិនិត្យ (Review) ---------- */}
                <div>
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-full bg-[#8FA2B4] text-white flex items-center justify-center shrink-0 shadow-sm">
                      <MessageCircle className="w-3.5 h-3.5 fill-white" />
                    </div>
                    <h4 className="text-xs font-semibold text-slate-800">ត្រួតពិនិត្យ</h4>
                  </div>

                  <div className="pl-10 space-y-3 mt-2">
                    {/* Reviewer 1 */}
                    <div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <img
                            src="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=120&auto=format&fit=crop&q=80"
                            alt="គ្រោន សីលា"
                            className="w-7 h-7 rounded-full object-cover ring-1 ring-slate-200"
                          />
                          <div>
                            <p className="text-xs font-semibold text-slate-800">គ្រោន សីលា</p>
                            <p className="text-[10px] text-slate-400 font-normal">
                              សមាជិកក្រុមការងារ
                            </p>
                          </div>
                        </div>
                        <span className="text-[11px] text-slate-400 font-normal">4m</span>
                      </div>
                      <div className="mt-1.5 bg-white border border-slate-100 rounded-xl px-3 py-2 text-xs text-slate-700 font-normal shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
                        គួរឯកភាព
                      </div>
                    </div>

                    {/* Reviewer 2 */}
                    <div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <img
                            src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=120&auto=format&fit=crop&q=80"
                            alt="ជីង គឹមឡាយ"
                            className="w-7 h-7 rounded-full object-cover ring-1 ring-slate-200"
                          />
                          <div>
                            <p className="text-xs font-semibold text-slate-800">ជីង គឹមឡាយ</p>
                            <p className="text-[10px] text-slate-400 font-normal">
                              អនុប្រធានក្រុមការងារ
                            </p>
                          </div>
                        </div>
                        <span className="text-[11px] text-slate-400 font-normal">4m</span>
                      </div>
                      <div className="mt-1.5 bg-white border border-slate-100 rounded-xl px-3 py-2 text-xs text-slate-700 font-normal shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
                        គួរឯកភាព
                      </div>
                    </div>

                    {/* Reviewer 3 */}
                    <div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <img
                            src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=80"
                            alt="ឡេង សុខជាយ"
                            className="w-7 h-7 rounded-full object-cover ring-1 ring-slate-200"
                          />
                          <div>
                            <p className="text-xs font-semibold text-slate-800">ឡេង សុខជាយ</p>
                            <p className="text-[10px] text-slate-400 font-normal">
                              អនុប្រធានក្រុមការងារ
                            </p>
                          </div>
                        </div>
                        <span className="text-[11px] text-slate-400 font-normal">4m</span>
                      </div>
                      <div className="mt-1.5 bg-white border border-slate-100 rounded-xl px-3 py-2 text-xs text-slate-700 font-normal shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
                        គួរឯកភាព
                      </div>
                    </div>
                  </div>
                </div>

                {/* ---------- Step 3: សម្រេចចិត្ត (Decision) ---------- */}
                <div>
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-full bg-[#8FA2B4] text-white flex items-center justify-center shrink-0 shadow-sm">
                      <Star className="w-3.5 h-3.5 fill-white" />
                    </div>
                    <h4 className="text-xs font-semibold text-slate-800">សម្រេចចិត្ត</h4>
                  </div>

                  <div className="pl-10 mt-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <img
                          src="https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=120&auto=format&fit=crop&q=80"
                          alt="ខូច គឿន"
                          className="w-7 h-7 rounded-full object-cover ring-1 ring-slate-200"
                        />
                        <div>
                          <p className="text-xs font-semibold text-slate-800">ខូច គឿន</p>
                          <p className="text-[10px] text-slate-400 font-normal">
                            ប្រធានក្រុមការងារ
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="mt-2">
                      {currentStatus === "APPROVED" ? (
                        <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl px-3.5 py-2 text-xs font-medium shadow-sm">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                          <span>បានឯកភាព (Approved)</span>
                        </div>
                      ) : currentStatus === "REJECTED" ? (
                        <div className="flex items-center gap-2 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl px-3.5 py-2 text-xs font-medium shadow-sm">
                          <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
                          <span>បានបដិសេធ (Rejected)</span>
                        </div>
                      ) : (
                        <div className="bg-white border border-slate-100 rounded-2xl px-4 py-2 text-xs text-slate-400 shadow-[0_1px_2px_rgba(0,0,0,0.02)] flex items-center gap-1.5 w-fit">
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Action Footer */}
            <div className="px-6 py-4 flex items-center gap-3 shrink-0">
              <button
                type="button"
                disabled={isSubmitting || currentStatus === "APPROVED"}
                onClick={() => handleDecision("APPROVED")}
                className="px-6 py-2 rounded-xl bg-[#009B72] hover:bg-[#008763] active:scale-95 disabled:opacity-50 disabled:pointer-events-none text-white text-xs font-medium transition shadow-sm cursor-pointer"
              >
                {isSubmitting ? "កំពុងដំណើរការ..." : "ឯកភាព"}
              </button>
              <button
                type="button"
                disabled={isSubmitting || currentStatus === "REJECTED"}
                onClick={() => handleDecision("REJECTED")}
                className="px-6 py-2 rounded-xl bg-[#F04438] hover:bg-[#E0382E] active:scale-95 disabled:opacity-50 disabled:pointer-events-none text-white text-xs font-medium transition shadow-sm cursor-pointer"
              >
                {isSubmitting ? "កំពុងដំណើរការ..." : "បដិសេធ"}
              </button>
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
}
