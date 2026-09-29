import { create } from "zustand";

export interface CourseRequestDrawerData {
  courseId: number | string;
  courseTitle?: string;
  courseKhmerTitle?: string;
  courseLevel?: string;
  courseLessons?: number;
  courseTasks?: number;
  courseImageUrl?: string;
  requesterName?: string;
  requesterDepartment?: string;
  requesterYear?: string;
  requesterAvatar?: string;
  requestNote?: string;
  requestTime?: string;
  approvalStatus?: string;
}

interface CourseRequestDrawerState {
  isOpen: boolean;
  data: CourseRequestDrawerData | null;
  openDrawer: (data: CourseRequestDrawerData) => void;
  closeDrawer: () => void;
}

export const useCourseRequestDrawerStore = create<CourseRequestDrawerState>((set) => ({
  isOpen: false,
  data: null,
  openDrawer: (data) => set({ isOpen: true, data }),
  closeDrawer: () => set({ isOpen: false }),
}));
