import { useEffect } from "react";
import { getCourses } from "@/services/courseService";

export function Setting() {
  useEffect(() => {
    getCourses().catch(() => {});
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-slate-800">Settings</h1>
      <p className="mt-2 text-slate-500">Manage platform settings and configurations.</p>
    </div>
  );
}