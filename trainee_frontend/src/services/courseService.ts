import type { Chapter, Lesson, LessonDocument } from "../types/course";
import { mockCourseData } from "../data/courses.mock";
import type { CourseCardItem } from "../types/course";
import { apiClient, isApiConfigured } from "./apiClient";

export const MOCK_COURSE_DETAILS: Chapter[] = [
    {
    id: 1,
    title: "ជំពូកទី ១៖ ការចាប់ផ្តើម",
    lessons: [
      {
        id: "1-1",
        title: "១. ទិដ្ឋភាពទូទៅនៃវគ្គសិក្សា និងការរៀបចំ",
        duration: "05:20",
        type: "video",
        progressPercentage: 100,
        videoUrl: "",
        playbackId: "HB9uLu00goXxhpEhSMu2FtuZw9ydpd01tl0202yP00NlS6WA",
      },
      {
        id: "1-2",
        title: "២. ការរៀបចំបរិស្ថានការងារអភិវឌ្ឍន៍ (Workspace)",
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
    title: "ជំពូកទី ២៖ ការសិក្សាស្វែងយល់ពីគោលការណ៍គ្រឹះ",
    lessons: [
      {
        id: "2-1",
        title: "១. ការយល់ដឹងអំពី State & Props",
        duration: "12:00",
        type: "video",
        progressPercentage: 100,
        videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
        playbackId: "ePjkg1AH01Vv4sRaF8t400CXXwXIrGZsA6wFk9G8x00",
      },
      {
        id: "2-2",
        title: "២. Lifecycle & Effect Hooks",
        duration: "08:45",
        type: "video",
        progressPercentage: 45,
        videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
      },
      {
        id: "2-3",
        title: "៣. វិធីសាស្ត្រល្អៗក្នុងការគ្រប់គ្រង State (State Management)",
        duration: "15:00",
        type: "video",
        progressPercentage: 0,
        videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4",
      },
    ],
  },
  {
    id: 3,
    title: "ជំពូកទី ៣៖ ការបង្កើនប្រសិទ្ធភាពកម្រិតខ្ពស់",
    lessons: [
      {
        id: "3-1",
        title: "១. ការវាស់វែង និងពិនិត្យមើលប្រសិទ្ធភាព (Performance Profiling)",
        duration: "06:30",
        type: "video",
        progressPercentage: 0,
        videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoylikes.mp4",
      },
      {
        id: "3-2",
        title: "២. ការបង្កើត និងដាក់ឱ្យដំណើរការ Production (Building for Production)",
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

export async function updateCourseApi( courseId: string | number, payload: Partial<CourseCardItem> ) {
  if (!isApiConfigured) return { message: "Updated (mock)", ...payload };

  // Strip read-only or computed fields so NestJS ValidationPipe with whitelist doesn't reject the payload
  const {
    id,
    rating,
    reviewCount,
    lessons,
    tasks,
    quizzes,
    totalEnrollments,
    totalCompletions,
    totalLikes,
    totalDislikes,
    approvalStatus,
    createdAt,
    isFavorite,
    ...cleanPayload
  } = payload as any;

  const res = await apiClient.patch(`/courses/${courseId}`, cleanPayload);
  return res.data;
}

export async function createCourseApi( payload: {
  title: string;
  khmerTitle: string;
  categoryId?: number;
  level: string;
  duration?: number;
  description?: string;
  imageUrl?: string;
}) {
  if (!isApiConfigured) {
    return {
      id: Date.now(),
      ...payload,
      lessons: 0,
      tasks: 0,
      rating: 0,
      reviewCount: 0,
      instructors: [],
      approvalStatus: 'NOT_REQUESTED',
    };
  }

  const res = await apiClient.post("/courses", payload);
  return res.data;
};

export async function deleteCourseApi( courseId: string | number ) {
  if (!isApiConfigured) return { message: "Deleted (mock)" };

  await apiClient.delete(`/courses/${courseId}`);
}

export async function createChapterApi(courseId: string | number, title: string): Promise<Chapter> {
  if (!isApiConfigured) {
    return {
      id: Date.now(),
      title,
      lessons: [],
    };
  }
  const res = await apiClient.post(`/courses/${courseId}/chapters`, { title });
  return {
    ...res.data,
    lessons: res.data.lessons || [],
  };
}

export async function updateChapterApi(chapterId: string | number, title: string): Promise<Chapter> {
  if (!isApiConfigured) {
    return {
      id: chapterId,
      title,
      lessons: [],
    };
  }
  const res = await apiClient.patch(`/courses/chapters/${chapterId}`, { title });
  return res.data;
}

export async function deleteChapterApi(chapterId: string | number): Promise<void> {
  if (!isApiConfigured) return;
  await apiClient.delete(`/courses/chapters/${chapterId}`);
}

export async function createLessonApi(
  chapterId: string | number,
  data: { title: string; description?: string; duration?: string; type?: 'video' | 'doc'; videoUrl?: string; playbackId?: string }
): Promise<Lesson> {
  if (!isApiConfigured) {
    return {
      id: Date.now(),
      title: data.title,
      description: data.description || '',
      duration: data.duration || '',
      type: data.type || 'video',
      videoUrl: data.videoUrl || '',
      playbackId: data.playbackId || '',
    };
  }
  const payload = {
    ...data,
    type: data.type ? data.type.toUpperCase() : 'VIDEO',
  };
  const res = await apiClient.post(`/courses/chapters/${chapterId}/lessons`, payload);
  return {
    id: res.data.id,
    title: res.data.title,
    description: res.data.description || '',
    duration: res.data.duration || '',
    type: res.data.type?.toLowerCase() === 'doc' ? 'doc' : 'video',
    videoUrl: res.data.video_url || '',
    playbackId: res.data.mux_playback_id || res.data.playbackId || '',
  };
}

export async function deleteLessonApi(lessonId: string | number): Promise<void> {
  if (!isApiConfigured) return;
  await apiClient.delete(`/courses/lessons/${lessonId}`);
}

export async function updateLessonApi(
  lessonId: string | number,
  data: { title?: string; description?: string; duration?: string; videoUrl?: string; playbackId?: string }
): Promise<Lesson> {
  if (!isApiConfigured) {
    return {
      id: lessonId,
      title: data.title || '',
      description: data.description,
      duration: data.duration,
      type: 'video',
      videoUrl: data.videoUrl || '',
      playbackId: data.playbackId || '',
    };
  }
  const res = await apiClient.patch(`/courses/lessons/${lessonId}`, data);
  return {
    id: res.data.id,
    title: res.data.title,
    description: res.data.description,
    duration: res.data.duration || '',
    type: res.data.type || 'video',
    videoUrl: res.data.video_url || '',
    playbackId: res.data.mux_playback_id || res.data.playbackId || '',
  };
}

export async function addLessonDocumentApi(
  lessonId: string | number,
  data: { title: string; fileUrl: string; fileType?: string; fileSize?: string }
): Promise<LessonDocument> {
  const res = await apiClient.post(`/courses/lessons/${lessonId}/documents`, data);
  return res.data;
}

export async function deleteLessonDocumentApi(documentId: string | number): Promise<void> {
  await apiClient.delete(`/courses/lessons/documents/${documentId}`);
}

export async function getLessonDocumentsApi(lessonId: string | number): Promise<LessonDocument[]> {
  const res = await apiClient.get(`/courses/lessons/${lessonId}/documents`);
  return res.data;
}

export async function createMuxDirectUploadApi(lessonId?: string | number): Promise<{
  configured: boolean;
  uploadId?: string;
  uploadUrl?: string;
  status?: string;
  message?: string;
}> {
  const res = await apiClient.post('/courses/mux/direct-upload', {
    lessonId: lessonId ? Number(lessonId) : undefined,
  });
  return res.data;
}

export async function getMuxUploadStatusApi(uploadId: string): Promise<{
  configured: boolean;
  uploadId?: string;
  uploadStatus?: string;
  assetId?: string;
  playbackId?: string;
  duration?: string;
  durationSeconds?: number;
  status?: string;
}> {
  const res = await apiClient.get(`/courses/mux/uploads/${uploadId}`);
  return res.data;
}