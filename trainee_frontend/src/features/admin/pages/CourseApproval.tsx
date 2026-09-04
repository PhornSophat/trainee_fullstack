import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCoursesStore } from "@/store/courseStore";
import { useAuthStore } from "@/store/useAuthStore";
import { setCourseApproval } from "@/services/courseService";
import type { ApprovalStatus } from "@/types/course";

export function CourseApproval() {
  const courses = useCoursesStore((s) => s.courses);
  const fetchCourses = useCoursesStore((s) => s.fetchCourses);
  const role = useAuthStore((s) => s.role);
  const navigate = useNavigate();

  useEffect(() => { fetchCourses(); }, [fetchCourses]);

  const pending = courses.filter((c) => c.approvalStatus === "PENDING");

  const handleDecision = async (id: string | number, status: ApprovalStatus) => {
    await setCourseApproval(id, status);
    useCoursesStore.getState().setCourseStatus(id, status);
  };

  if (role !== "admin") {
    return (
      <div className="p-8 text-center text-slate-500">
        Admin access required.
      </div>
    );
  }

  return (
    <div className="p-6 mx-auto max-w-3xl">
      <h1 className="mb-4 text-xl font-bold">Course Approval Requests</h1>

      {pending.length === 0 ? (
        <p className="text-slate-500">No pending requests. 🎉</p>
      ) : (
        <ul className="space-y-3">
          {pending.map((c) => (
            <li
              key={c.id}
              className="flex items-center justify-between rounded-md border border-slate-200 bg-white p-4"
            >
              <div>
                <p className="font-medium">{c.title}</p>
                <p className="text-xs text-slate-400">ID: {String(c.id)}</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleDecision(c.id, "APPROVED")}
                  className="rounded bg-emerald-600 px-3 py-1.5 text-sm text-white hover:bg-emerald-700"
                >
                  Approve
                </button>
                <button
                  onClick={() => handleDecision(c.id, "REJECTED")}
                  className="rounded bg-rose-600 px-3 py-1.5 text-sm text-white hover:bg-rose-700"
                >
                  Reject
                </button>
                <button
                  onClick={() => navigate(`/courses/${c.id}`)}
                  className="rounded border border-slate-200 px-3 py-1.5 text-sm hover:bg-slate-50"
                >
                  View
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}