import { useState } from "react";
import { Outlet } from "react-router-dom";
import MainSidebar from "@/components/main-sidebar/MainSidebar";
import { Header } from "./Header";
import { CourseRequestDrawer } from "@/components/courses/CourseRequestDrawer";
import { GlobalHomeworkDrawer } from "@/components/courses/GlobalHomeworkDrawer";

export function UserLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen">

      <MainSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="flex min-h-0 min-w-0 flex-1 flex-col bg-slate-100 lg:ml-[124px]">
        <Header onMenuOpen={() => setSidebarOpen(true)} />
        <main className="min-h-0 min-w-0 flex-1 overflow-hidden">
          <Outlet />
        </main>
      </div>

      {/* Global Course Request Approval Drawer */}
      <CourseRequestDrawer />

      {/* Global Homework Task Drawer */}
      <GlobalHomeworkDrawer />
    </div>
  );
}
