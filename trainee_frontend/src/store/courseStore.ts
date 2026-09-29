import { create } from 'zustand';
import type { CourseCardItem, ApprovalStatus } from '../types/course';
import { getCourses, updateCourseImageApi, updateCourseApi, createCourseApi, deleteCourseApi } from '../services/courseService';

interface CoursesStore {
    courses: CourseCardItem[];
    loaded: boolean;
    loading: boolean;
    updateCourseImage: (id: string | number, imageUrl: string) => Promise<void>;
    updateCourse: (id: string | number, data: Partial<CourseCardItem>) => Promise<void>;
    setCourses: (c: CourseCardItem[]) => void;
    fetchCourses: (force?: boolean) => Promise<void>;
    toggleFavorite: (id: string | number) => void;
    setCourseStatus: (id: string | number, status: ApprovalStatus) => void;
    createCourse: (data: {
    title: string;
    khmerTitle: string;
    categoryId?: number;
    level: string;
    description?: string;
    imageUrl?: string;
    }) => Promise<CourseCardItem>;
    deleteCourse: (id: string | number) => Promise<void>;
}

export const useCoursesStore = create<CoursesStore>((set, get) => ({
    courses: [],
    loaded: false,
    loading: false,

    setCourses: (c) => set({ courses: c, loaded: true }),

    fetchCourses: async (force = false) => {
        if (!force && (get().loaded || get().loading)) return;

        set({ loading: true });
        try {
            const data = await getCourses();
            set({ courses: data, loaded: true });
        } catch (error) {
            console.error('Error fetching courses:', error);
        } finally {
            set({ loading: false });
        }
    },

    toggleFavorite: (id: string | number) => set((s) => ({
        courses: s.courses.map((c) => c.id === id ? { ...c, isFavorite: !c.isFavorite } : c),
    })),

    setCourseStatus: (id: string | number, status: ApprovalStatus) => set((s) => ({
        courses: s.courses.map((c) =>
            c.id === id ? { ...c, approvalStatus: status } : c),
    })),

    updateCourseImage: async (id: string | number, imageUrl: string) => {
        // 1. Send update via your service function to NestJS/Postgres
        await updateCourseImageApi(id, imageUrl);

        // 2. Update local Zustand state once the API call succeeds
        set((s) => ({
            courses: s.courses.map((c) =>
                c.id === id ? { ...c, imageUrl } : c
            ),
        }));
    },

    updateCourse: async (id: string | number, data: Partial<CourseCardItem>) => {
        await updateCourseApi(id, data);
        set((s) => ({
            courses: s.courses.map((c) => 
                String(c.id) === String(id) ? { ...c, ...data } : c
            ),
        }))
    },

    createCourse: async (data) => {
        const res = await createCourseApi(data);
        const newCourse: CourseCardItem = {
            id: res.course?.id || Date.now(),
            title: data.title,
            khmerTitle: data.khmerTitle,
            categoryId: data.categoryId,
            level: data.level as any,
            description: data.description || '',
            imageUrl: data.imageUrl || '',
            duration: '0h',
            lessons: 0,
            tasks: 0,
            quizzes: 0,
            rating: 0,
            reviewCount: 0,
            instructors: [],
            approvalStatus: (res.course?.approved_status || res.course?.approval_status || 'NOT_REQUESTED') as ApprovalStatus,
            createdAt: new Date().toISOString(),
            technologies: [],
            skills: [],
            keyLessons: [],
            faqs: [],
            learningResources: [],
        };
        set((s) => ({
            courses: [newCourse, ...s.courses],
        }));
        return newCourse;
    },

    deleteCourse: async (id: string | number) => {
        await deleteCourseApi(id);
        set((s) => ({
            courses: s.courses.filter((c) => String(c.id) !== String(id)),
        }));
    },
}));