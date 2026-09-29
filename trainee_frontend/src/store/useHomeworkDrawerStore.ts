import { create } from "zustand";
import type { HomeworkTask } from "@/types/course";

export interface HomeworkDrawerData {
  taskId: number | string;
  courseId?: number | string;
  courseTitle?: string;
  taskTitle?: string;
  task?: HomeworkTask;
}

interface HomeworkDrawerState {
  isOpen: boolean;
  data: HomeworkDrawerData | null;
  openDrawer: (data: HomeworkDrawerData) => void;
  closeDrawer: () => void;
}

export const useHomeworkDrawerStore = create<HomeworkDrawerState>((set) => ({
  isOpen: false,
  data: null,
  openDrawer: (data) => set({ isOpen: true, data }),
  closeDrawer: () => set({ isOpen: false, data: null }),
}));
