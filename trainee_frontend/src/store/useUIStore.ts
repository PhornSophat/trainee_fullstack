// src/store/useUIStore.ts
import { create } from 'zustand';

interface UIState {
  isSidebarOpen: boolean;       // For mobile drawer toggle
  isSidebarCollapsed: boolean;  // For desktop collapse (icons only)
  toggleSidebar: () => void;
  toggleCollapse: () => void;
  closeSidebar: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  isSidebarOpen: false,
  isSidebarCollapsed: false,
  toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
  toggleCollapse: () => set((state) => ({ isSidebarCollapsed: !state.isSidebarCollapsed })),
  closeSidebar: () => set({ isSidebarOpen: false }),
}));