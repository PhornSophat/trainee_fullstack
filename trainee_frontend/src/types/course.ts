export type CourseLevel = "BASIC" | "INTERMEDIATE" | "ADVANCED";

export type ApprovalStatus =
  | "NOT_REQUESTED"
  | "PENDING"
  | "APPROVED"
  | "REJECTED";

export type Lesson = {
  id: string | number;
  title: string;
  duration?: string;
  type: "video" | "doc";
  progressPercentage?: number;
  videoUrl: string;
  playbackId?: string;
};

export type Chapter = {
  id: string | number;
  title: string;
  lessons: Lesson[];
};

export type TabType =
  | "General"
  | "Curriculum"
  | "Session"
  | "Homework"
  | "Technical Support";

export type CourseInstructor = {
  id: string | number;
  name: string;
  avatarUrl?: string;
};

export type KeyLesson = {
  code?: string;
  title: string;
  description: string;
};

export type CourseTechnology = {
  name: string;
  icon: string;
};

export type CourseFAQ = {
  question: string;
  answer?: string;
};

/** API Progress update payload */
export type ProgressUpdateRequest = {
  progressPercentage: number;
};

/** Core Course entity including nested chapters */
export type Course = {
  id: string | number;
  title: string;
  chapters: Chapter[];
};

/** Shape expected from the courses endpoint in your backend. */
export type CourseCardItem = {
  id: string | number;
  categoryId?: string | number;
  categoryName?: string;
  title: string;
  khmerTitle?: string; // Added: For localized title
  description?: string;
  imageUrl: string;
  level: CourseLevel;
  rating: number;
  reviewCount: number;
  duration: string;
  createdAt: string;
  lessons: number;
  tasks: number;
  quizzes?: number; // Added: For total homeworks/quizzes count
  instructors: CourseInstructor[];
  isFavorite?: boolean;
  approvalStatus: ApprovalStatus;
  totalEnrollments?: number;
  totalCompletions?: number;
  totalLikes?: number;
  totalDislikes?: number;

  // Detail Page Additions
  skills?: string[]; // Added: "What you will learn" points
  keyLessons?: KeyLesson[]; // Added: Key modules/lessons breakdown
  technologies: CourseTechnology[]; // Added: Tech stack icons and names
  faqs?: CourseFAQ[]; // Added: Q&A section
};

export type ChatSender = "student" | "instructor";

export type HomeworkType = "task" | "quiz";

export type HomeworkStatus = "NOT_SUBMITTED" | "SUBMITTED" | "GRADED" | "LATE";

export type HomeworkTask = {
  id: string | number;
  title: string;
  description?: string;
  type: HomeworkType;
  status: HomeworkStatus;
  score?: number;
  maxScore: number;
  attachments?: string[];
  submittedAt?: string;
  dueDate?: string;
};

export type Homework = {
  id: string | number;
  title: string;
  description?: string;
  tasks: HomeworkTask[];
  courseId?: string | number;
};

export type ChatMessage = {
  id: string | number;
  sender: ChatSender;
  text: string;
  sentAt: string; // ISO timestamp
};
