import { useToastStore } from "@/store/useToastStore";
import { AlertTriangle, CheckCircle2, Info, XCircle, X } from "lucide-react";

export function ToastNotification() {
    const { message, type, visible, hideToast } = useToastStore();

    const getToastStyle = () => {
        switch (type) {
            case "success":
                return {
                    container: "border-emerald-300 bg-emerald-50 text-emerald-900",
                    badge: "bg-emerald-200/80 text-emerald-700",
                    title: "Success",
                    icon: CheckCircle2,
                };
            case "error":
                return {
                    container: "border-rose-300 bg-rose-50 text-rose-900",
                    badge: "bg-rose-200/80 text-rose-700",
                    title: "Error",
                    icon: XCircle,
                };
            case "info":
                return {
                    container: "border-sky-300 bg-sky-50 text-sky-900",
                    badge: "bg-sky-200/80 text-sky-700",
                    title: "Information",
                    icon: Info,
                };
            case "warning":
            default:
                return {
                    container: "border-amber-300 bg-amber-50 text-amber-900",
                    badge: "bg-amber-200/80 text-amber-700",
                    title: "Notice",
                    icon: AlertTriangle,
                };
        }
    };

    const style = getToastStyle();
    const IconComponent = style.icon;

    return (
        <div
            className={`fixed bottom-12 right-5 z-[9999] flex items-center gap-3 rounded-xl border px-4 py-3 shadow-2xl backdrop-blur-md transition-all duration-500 ease-out ${
                style.container
            } ${
                visible ? "translate-x-0 opacity-100" : "translate-x-full opacity-0 pointer-events-none"
            }`}
        >
            <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${style.badge}`}>
                <IconComponent className="h-5 w-5" />
            </div>
            <div>
                <p className="text-xs font-bold uppercase tracking-wider opacity-80">
                    {style.title}
                </p>
                <p className="text-sm font-medium">
                    {message}
                </p>
            </div>
            <button
                type="button"
                onClick={hideToast}
                className="ml-2 rounded-lg p-1 opacity-70 hover:opacity-100 hover:bg-black/5"
                aria-label="Close message"
            >
                <X className="h-4 w-4" />
            </button>
        </div>
    );
}
