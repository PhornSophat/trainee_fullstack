import { mockHomeworks } from "../data/homework.mock";
import type { Homework } from "../types/course";
import { apiClient, isApiConfigured } from "./apiClient";

export async function getHomeworks(courseId: string | number): Promise<Homework[]> {
    if (!isApiConfigured) {
        return mockHomeworks.filter(
            (homework) => String(homework.courseId) === String(courseId),
        );
    }

    try {
        const response = await apiClient.get<Homework[]>(`/courses/${courseId}/homeworks`);
        return response.data;
    } catch (error) {
        console.warn("[homeworkService] Falling back to mock data due to API error/offline state:", error);
        // Return mock data as a fallback
        return mockHomeworks;
    }
}
