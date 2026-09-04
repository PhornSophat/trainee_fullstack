import type { Chapter } from "../types/course";
import { mockCourseData } from "../data/courses.mock";
import type { CourseCardItem } from "../types/course";
import { apiClient, isApiConfigured } from "./apiClient";

export const MOCK_COURSE_DETAILS: Chapter[] = [
    {
    id: 1,
    title: "Chapter 1: Getting Started",
    lessons: [
      {
        id: "1-1",
        title: "1. Course Overview & Setup",
        duration: "05:20",
        type: "video",
        progressPercentage: 100,
        videoUrl: "",
        playbackId: "HB9uLu00goXxhpEhSMu2FtuZw9ydpd01tl0202yP00NlS6WA",
      },
      {
        id: "1-2",
        title: "2. Setting up the Development Workspace",
        duration: "10:15",
        type: "video",
        progressPercentage: 100,
        videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
        playbackId: "ePjkg1AH01Vv4sRaF8t400CXXwXIrGZsA6wFk9G8x00",
      },
    ],
  },
  {
    id: 2,
    title: "Chapter 2: Core Concepts Deep Dive",
    lessons: [
      {
        id: "2-1",
        title: "3. Understanding State & Props",
        duration: "12:00",
        type: "video",
        progressPercentage: 100,
        videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
        playbackId: "ePjkg1AH01Vv4sRaF8t400CXXwXIrGZsA6wFk9G8x00",
      },
      {
        id: "2-2",
        title: "4. Lifecycle & Effect Hooks",
        duration: "08:45",
        type: "video",
        progressPercentage: 45,
        videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
      },
      {
        id: "2-3",
        title: "5. State Management Best Practices",
        duration: "15:00",
        type: "video",
        progressPercentage: 0,
        videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4",
      },
    ],
  },
  {
    id: 3,
    title: "Chapter 3: Advanced Optimization",
    lessons: [
      {
        id: "3-1",
        title: "6. Performance Profiling",
        duration: "06:30",
        type: "video",
        progressPercentage: 0,
        videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoylikes.mp4",
      },
      {
        id: "3-2",
        title: "7. Building for Production",
        duration: "11:20",
        type: "video",
        progressPercentage: 0,
        videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4",
      },
    ],
  },
];

// fetch chapter and lesson data for a specific course
export async function getCourseDetails( courseId: string | number ) : Promise<Chapter[]> {

    if (!isApiConfigured) {
        return MOCK_COURSE_DETAILS;
    }

    try {
        const response = await apiClient.get<Chapter[]>(`/courses/${courseId}/details`);
        return response.data;

    }catch ( error ) {
        console.warn("[courseService] Falling back to mock data due to API error/offline state:", error);
        return MOCK_COURSE_DETAILS;
    }
}

export async function getCourses(): Promise<CourseCardItem[]> {
  if( !isApiConfigured ) {
    return mockCourseData;
  }

  try {
    const response = await apiClient.get<CourseCardItem[]>("/courses");
    return response.data;
  }catch( error ) {
    console.warn("[courseService] Falling back to mock data due to API error/offline state:", error);
    return mockCourseData;
  }
}

export async function requestCourseAccess(courseId: string | number, userId: string | number) {
  if( !isApiConfigured ) return { message: "grant (mock)", status: "APPROVED" };

  const res = await apiClient.post(`/courses/${courseId}/request-access`, { userId });
  return res.data;
}

export async function setCourseApproval(courseId: string | number, status: string) {
  if (!isApiConfigured) return { message: `set ${status}`, status };
  const res = await apiClient.patch(`/courses/${courseId}/approval`, { status });
  return res.data;
}

export async function updateCourseImageApi( courseId: string | number, imageUrl: string ) {
  if (!isApiConfigured) return { message: "Updated (mock)", imageUrl };

  const res = await apiClient.patch(`/courses/${courseId}/image`, { imageUrl });
  return res.data;
}
