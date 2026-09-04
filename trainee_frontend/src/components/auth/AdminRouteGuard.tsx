import { useEffect } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "@/store/useAuthStore";
import { useToastStore } from "@/store/useToastStore";

export function AdminRouteGuard() {
    const role = useAuthStore((s) => s.role);
    const showToast = useToastStore((s) => s.showToast);

    const isAdmin = role === "admin";
    
    useEffect(() => {
        if (!isAdmin) {
            showToast("Admin access required!", "warning");
        }
    }, [isAdmin, showToast]);

    if (!isAdmin) {
        return <Navigate to="/trainee/programs" replace />
    }

    return <Outlet />
}