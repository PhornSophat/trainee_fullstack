import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "@/store/useAuthStore";

export function AdminRouteGuard() {
    const role = useAuthStore((s) => s.role);
    const isAdmin = role === "admin";

    if (!isAdmin) {
        return <Navigate to="/trainee/programs" replace />;
    }

    return <Outlet />;
}