import { useToastStore } from "@/store/useToastStore";
import { AlertTriangle, X } from "lucide-react";

export function ToastNotification() {
    const { message, visible , hideToast } = useToastStore();

    return (
        <div
            className={`fixed bottom-12  right-5 z-50 flex items-center gap-3 rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-amber-900 shadow-xl transition-all duration-500 ease-out ${
                visible ? "translate-x-0 opacity-100" : "translate-x-full opacity-0 pointer-events-none"
            }`}
        >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-amber-200/80 text-amber-700">
                <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
                <p className="text-xs font-bold uppercase tracking-wider text-amber-800">
                    Access Restricted
                </p>
                <p className="text-sm font-medium text-amber-900">
                    {message}
                </p>
            </div>
            <button
                onClick={hideToast}
                className="ml-2 rounded-lg p-1 text-amber-600 hover:bg-amber-100 hover:text-amber-900"
                    aria-label="Close message"
            >
                <X className="h-4 w-4" />
            </button>
        </div>
    );
}