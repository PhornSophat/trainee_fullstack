import { create } from 'zustand';
import type { CourseCardItem, ApprovalStatus } from '../types/course';
import { getCourses } from '../services/courseService';

interface CoursesStore {
    courses: CourseCardItem[];
    loaded: boolean;
    loading: boolean;
    updateCourseImage: (id: string | number, imageUrl: string) => void;
    setCourses: (c: CourseCardItem[]) => void;
    fetchCourses: () => Promise<void>;
    toggleFavorite: (id: string | number) => void;
    setCourseStatus: (id: string | number, status: ApprovalStatus) => void;
}

export const useCoursesStore = create<CoursesStore>((set, get) => ({
    courses: [],
    loaded: false,
    loading: false,

    setCourses: (c) => set({ courses: c, loaded: true }),

    fetchCourses: async () => {
        if( get().loaded || get().loading ) return;

        set({ loading: true });
        try{
            const data = await getCourses();
            set({ courses: data, loaded: true });
        } catch (error) {
            console.error('Error fetching courses:', error);
        } finally {
            set({ loading: false });
        }
    },

    toggleFavorite: (id: string | number) => set((s) => ({
        courses: s.courses.map((c) => c.id === id ? { ...c, isFavorite: !c.isFavorite } : c ),
    })),

    setCourseStatus: (id: string | number, status: ApprovalStatus) => set((s) => ({
        courses: s.courses.map((c) =>
        c.id === id ? { ...c, approvalStatus: status } : c ),
    })),

    updateCourseImage: (id, imageUrl) => 
        set((s) => ({
            courses: s.courses.map((c) => 
                c.id === id ? { ...c, imageUrl } : c
            ),
        })),
}));