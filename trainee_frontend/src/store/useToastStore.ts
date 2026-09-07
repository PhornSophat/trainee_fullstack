import { create } from "zustand";

export type ToastType = "warning" | "error" | "success" | "info";

interface ToastState {
  message: string | null;
  type: ToastType;
  visible: boolean;
  showToast: (message: string, type?: ToastType) => void;
  hideToast: () => void;
}

export const useToastStore = create<ToastState>((set) => ({
  message: null,
  type: "warning",
  visible: false,

  showToast: (message, type = "warning") => {
    set({ message, type, visible: true });

    setTimeout(() => {
      set({ visible: false });
    }, 4000);
  },

  hideToast: () => set({ visible: false }),
}));
