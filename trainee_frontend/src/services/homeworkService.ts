import { mockHomeworks } from "../data/homework.mock";
import type { Homework, HomeworkTask, HomeworkType } from "../types/course";
import { apiClient, isApiConfigured } from "./apiClient";

// Local in-memory state fallback when offline or API is not reachable
let fallbackHomeworks: Homework[] = [...mockHomeworks];

export async function getHomeworks(courseId: string | number): Promise<Homework[]> {
  if (!isApiConfigured) {
    return fallbackHomeworks.filter(
      (homework) => String(homework.courseId) === String(courseId)
    );
  }

  try {
    const response = await apiClient.get<Homework[]>(`/courses/${courseId}/homeworks`);
    return response.data;
  } catch (error) {
    console.warn("[homeworkService] Falling back to mock data due to API error/offline state:", error);
    return fallbackHomeworks.filter(
      (homework) => String(homework.courseId) === String(courseId)
    );
  }
}

export async function createHomeworkApi(
  courseId: string | number,
  title: string,
  description?: string
): Promise<Homework> {
  if (!isApiConfigured) {
    const newHomework: Homework = {
      id: Date.now(),
      title,
      description: description || "",
      courseId: Number(courseId),
      tasks: [],
    };
    fallbackHomeworks = [...fallbackHomeworks, newHomework];
    return newHomework;
  }

  try {
    const response = await apiClient.post<Homework>(`/courses/${courseId}/homeworks`, {
      title,
      description,
    });
    return {
      ...response.data,
      tasks: response.data.tasks || [],
    };
  } catch (error) {
    console.warn("[homeworkService] createHomeworkApi failed, using fallback:", error);
    const newHomework: Homework = {
      id: Date.now(),
      title,
      description: description || "",
      courseId: Number(courseId),
      tasks: [],
    };
    fallbackHomeworks = [...fallbackHomeworks, newHomework];
    return newHomework;
  }
}

export async function updateHomeworkApi(
  homeworkId: string | number,
  data: { title?: string; description?: string }
): Promise<Homework> {
  if (!isApiConfigured) {
    fallbackHomeworks = fallbackHomeworks.map((h) =>
      String(h.id) === String(homeworkId) ? { ...h, ...data } : h
    );
    return fallbackHomeworks.find((h) => String(h.id) === String(homeworkId))!;
  }

  try {
    const response = await apiClient.patch<Homework>(`/courses/homeworks/${homeworkId}`, data);
    return response.data;
  } catch (error) {
    console.warn("[homeworkService] updateHomeworkApi failed, using fallback:", error);
    fallbackHomeworks = fallbackHomeworks.map((h) =>
      String(h.id) === String(homeworkId) ? { ...h, ...data } : h
    );
    return fallbackHomeworks.find((h) => String(h.id) === String(homeworkId))!;
  }
}

export async function deleteHomeworkApi(homeworkId: string | number): Promise<void> {
  if (!isApiConfigured) {
    fallbackHomeworks = fallbackHomeworks.filter((h) => String(h.id) !== String(homeworkId));
    return;
  }

  try {
    await apiClient.delete(`/courses/homeworks/${homeworkId}`);
  } catch (error) {
    console.warn("[homeworkService] deleteHomeworkApi failed, using fallback:", error);
    fallbackHomeworks = fallbackHomeworks.filter((h) => String(h.id) !== String(homeworkId));
  }
}

export async function createHomeworkTaskApi(
  homeworkId: string | number,
  data: {
    title: string;
    description?: string;
    type?: HomeworkType;
    maxScore?: number;
    dueDate?: string;
  }
): Promise<HomeworkTask> {
  if (!isApiConfigured) {
    const newTask: HomeworkTask = {
      id: `task-${Date.now()}`,
      title: data.title,
      description: data.description || "",
      type: data.type || "task",
      status: "NOT_SUBMITTED",
      maxScore: data.maxScore !== undefined ? data.maxScore : 100,
      dueDate: data.dueDate,
    };
    fallbackHomeworks = fallbackHomeworks.map((hw) => {
      if (String(hw.id) === String(homeworkId)) {
        return { ...hw, tasks: [...hw.tasks, newTask] };
      }
      return hw;
    });
    return newTask;
  }

  try {
    const response = await apiClient.post<HomeworkTask>(
      `/courses/homeworks/${homeworkId}/tasks`,
      data
    );
    return response.data;
  } catch (error) {
    console.warn("[homeworkService] createHomeworkTaskApi failed, using fallback:", error);
    const newTask: HomeworkTask = {
      id: `task-${Date.now()}`,
      title: data.title,
      description: data.description || "",
      type: data.type || "task",
      status: "NOT_SUBMITTED",
      maxScore: data.maxScore !== undefined ? data.maxScore : 100,
      dueDate: data.dueDate,
    };
    fallbackHomeworks = fallbackHomeworks.map((hw) => {
      if (String(hw.id) === String(homeworkId)) {
        return { ...hw, tasks: [...hw.tasks, newTask] };
      }
      return hw;
    });
    return newTask;
  }
}

export async function updateHomeworkTaskApi(
  taskId: string | number,
  data: {
    title?: string;
    description?: string;
    type?: HomeworkType;
    maxScore?: number;
    dueDate?: string;
  }
): Promise<HomeworkTask> {
  if (!isApiConfigured) {
    let updatedTask: HomeworkTask | null = null;
    fallbackHomeworks = fallbackHomeworks.map((hw) => ({
      ...hw,
      tasks: hw.tasks.map((t) => {
        if (String(t.id) === String(taskId)) {
          updatedTask = { ...t, ...data };
          return updatedTask;
        }
        return t;
      }),
    }));
    return updatedTask || (data as HomeworkTask);
  }

  try {
    const response = await apiClient.patch<HomeworkTask>(
      `/courses/homework_tasks/${taskId}`,
      data
    );
    return response.data;
  } catch (error) {
    console.warn("[homeworkService] updateHomeworkTaskApi failed, using fallback:", error);
    let updatedTask: HomeworkTask | null = null;
    fallbackHomeworks = fallbackHomeworks.map((hw) => ({
      ...hw,
      tasks: hw.tasks.map((t) => {
        if (String(t.id) === String(taskId)) {
          updatedTask = { ...t, ...data };
          return updatedTask;
        }
        return t;
      }),
    }));
    return updatedTask || (data as HomeworkTask);
  }
}

export async function deleteHomeworkTaskApi(taskId: string | number): Promise<void> {
  if (!isApiConfigured) {
    fallbackHomeworks = fallbackHomeworks.map((hw) => ({
      ...hw,
      tasks: hw.tasks.filter((t) => String(t.id) !== String(taskId)),
    }));
    return;
  }

  try {
    await apiClient.delete(`/courses/homework_tasks/${taskId}`);
  } catch (error) {
    console.warn("[homeworkService] deleteHomeworkTaskApi failed, using fallback:", error);
    fallbackHomeworks = fallbackHomeworks.map((hw) => ({
      ...hw,
      tasks: hw.tasks.filter((t) => String(t.id) !== String(taskId)),
    }));
  }
}

// ============================================================
// Submission & End-to-End File Upload
// ============================================================

export type TaskSubmissionAttachment = {
  id: number;
  fileName: string;
  fileUrl: string;
  fileSize?: number;
  uploadedAt: string;
};

export type TaskSubmissionMessage = {
  id: number | string;
  senderName: string;
  sender: "student" | "instructor";
  text: string;
  sentAt: string;
};

export type TaskSubmission = {
  id: number;
  taskId: number;
  taskTitle?: string;
  taskDescription?: string;
  taskDeadline?: string;
  courseId?: number | string;
  courseTitle?: string;
  userId: string;
  instructorId?: string;
  status: string;
  score?: number;
  submittedAt?: string;
  attachments: TaskSubmissionAttachment[];
  messages: TaskSubmissionMessage[];
};

export async function getTaskSubmission(
  taskId: string | number
): Promise<TaskSubmission> {
  try {
    const response = await apiClient.get<TaskSubmission>(
      `/courses/homework_tasks/${taskId}/submission`
    );
    return response.data;
  } catch (err) {
    // Retry once in case of a remote server/DB connection wake-up delay
    await new Promise((r) => setTimeout(r, 800));
    const response = await apiClient.get<TaskSubmission>(
      `/courses/homework_tasks/${taskId}/submission`
    );
    return response.data;
  }
}

export async function addSubmissionAttachmentApi(
  taskId: string | number,
  data: { fileName: string; fileUrl: string; fileSize?: number }
): Promise<{ attachment: TaskSubmissionAttachment; message?: TaskSubmissionMessage }> {
  const response = await apiClient.post(
    `/courses/homework_tasks/${taskId}/attachments`,
    data
  );
  return response.data;
}

export async function uploadTaskAttachment(
  taskId: string | number,
  file: File
): Promise<{ attachment: TaskSubmissionAttachment; message?: TaskSubmissionMessage }> {
  const { supabase } = await import("@/lib/supabaseClient");

  const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const filePath = `submission_attachment/task-${taskId}/${Date.now()}_${sanitizedFileName}`;

  const { error: uploadError } = await supabase.storage
    .from("images of TMS")
    .upload(filePath, file, { upsert: true });

  if (uploadError) {
    throw uploadError;
  }

  const { data: publicUrlData } = supabase.storage
    .from("images of TMS")
    .getPublicUrl(filePath);

  const publicUrl = publicUrlData.publicUrl;

  return await addSubmissionAttachmentApi(taskId, {
    fileName: file.name,
    fileUrl: publicUrl,
    fileSize: file.size,
  });
}

export async function deleteSubmissionAttachmentApi(
  attachmentId: number | string
): Promise<void> {
  await apiClient.delete(`/courses/homework_tasks/attachments/${attachmentId}`);
}

export async function updateTaskStatusApi(
  taskId: string | number,
  status: string,
  options?: { senderName?: string; sender?: "student" | "instructor" }
): Promise<{ id: number; taskId: number; status: string; submittedAt?: string }> {
  const response = await apiClient.patch(
    `/courses/homework_tasks/${taskId}/status`,
    { status, ...options }
  );
  return response.data;
}

export async function sendTaskMessageApi(
  taskId: string | number,
  data: { text: string; senderName?: string; sender?: "student" | "instructor" }
): Promise<TaskSubmissionMessage> {
  const response = await apiClient.post(
    `/courses/homework_tasks/${taskId}/messages`,
    data
  );
  return response.data;
}

