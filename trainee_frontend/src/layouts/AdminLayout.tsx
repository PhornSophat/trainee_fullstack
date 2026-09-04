import { useState } from "react";
import { Outlet } from "react-router-dom";
import { DashboardSidebar } from "@/components/dashboard-sidebar/DashboardSidebar";

export function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-[calc(100vh-44px)]">

      <DashboardSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="flex-1">

        {/* Mobile button */}
        <button
          onClick={() => setSidebarOpen(true)}
          className="px-3 py-2 m-4 border rounded-lg lg:hidden"
        >
          ☰ Dashboard Menu
        </button>

        <main className="p-6">
          <Outlet />
        </main>

      </div>

    </div>
  );
}
