import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getCourseDetails } from "@/services/courseService";
import { useCoursesStore } from "@/store/courseStore";
import { CourseOverview } from "./CourseOverview";
import { CourseLearning } from "./CourseLearning";

export function CoursePage() {
  const { courseId } = useParams<{ courseId: string }>();

  const courses = useCoursesStore((s) => s.courses);
  const loaded = useCoursesStore((s) => s.loaded);
  const fetchCourses = useCoursesStore((s) => s.fetchCourses);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ensure list is in store (cached or fetched once)
  useEffect(() => { fetchCourses(); }, [fetchCourses]);

  // fetch curriculum only
  useEffect(() => {
    if (!courseId) return;
    setLoading(true);
    setError(null);
    getCourseDetails(courseId)
      .catch((err) => {
        console.error("Failed to load course:", err);
        setError("Failed to load course. Please try again.");
      })
      .finally(() => setLoading(false));
  }, [courseId]);

  const course = courseId
    ? courses.find((c) => String(c.id) === courseId) || null
    : null;

  if (loading) return <div className="flex h-screen items-center justify-center text-slate-500">Loading…</div>;
  if (error) return <div className="p-8 text-center text-red-600">{error}</div>;
  if (!courseId) return <div className="p-8 text-center">No course ID</div>;
  if (!course && !loaded) return <div className="flex h-screen items-center justify-center text-slate-500">Loading…</div>;
  if (!course) return <div className="p-8 text-center">Course not found</div>;

  return course.approvalStatus === "APPROVED"
    ? <CourseLearning courseId={courseId} />
    : <CourseOverview course={course} />;
}