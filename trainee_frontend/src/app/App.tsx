// src/app/App.tsx
import { BrowserRouter, Routes, Route, Navigate, useParams } from 'react-router-dom';
import { ErrorBoundary } from '@/components/error-boundary/ErrorBoundary';
import { UserLayout } from '@/layouts/UserLayout';
import { AdminLayout } from '@/layouts/AdminLayout';
import { Overview } from '@/features/admin/pages/Overview';
import { Tasks } from '@/features/admin/pages/Tasks';
import { Setting } from '@/features/admin/pages/Setting';
import { Insight } from '@/features/admin/pages/Insight';
import DashboardOverview from '@/features/admin/pages/DashboardOverview';
import { CourseListing } from '@/features/user/pages/CourseListing';
import { CoursePage } from '@/features/user/pages/courses/CoursePage';
import { CourseVideoLearning } from '@/features/user/pages/courses/CourseVideoLearning';
import { CourseListing as AdminViewCourse } from '@/features/admin/pages/CourseListing';
import { CourseApproval } from '@/features/admin/pages/CourseApproval';
import { ToastNotification } from '@/components/toast/ToastNotification';
import { AdminRouteGuard } from '@/components/auth/AdminRouteGuard';

function CourseLearningRedirect() {
  const { courseId } = useParams();
  return <Navigate to={`/trainee/courses/${courseId || ''}/learning`} replace />;
}

export function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>

        <ToastNotification />
        <Routes>
          {/* Root redirect */}
          <Route path="/" element={<Navigate to="/trainee/programs" replace />} />

          {/* Legacy route redirects */}
          <Route path="/courses/:courseId/learning" element={<Navigate to="/trainee/courses/:courseId/learning" replace />} />
          <Route path="/courses/:courseId/learning" element={<CourseLearningRedirect />} />
          <Route path="/admin" element={<Navigate to="/admin/insight" replace />} />

          {/* Main User/Admin Layout routes (shares Header & MainSidebar) */}
          <Route element={<UserLayout />}>
            <Route path="/trainee" element={<DashboardOverview />} />
            <Route index path="/trainee/programs" element={<CourseListing />} />
            <Route path="/trainee/programs/:courseId" element={<CoursePage />} />
            <Route path="/trainee/programs/:courseId/learning" element={<CourseVideoLearning />} />
            <Route path="/trainee/courses/:courseId/learning" element={<CourseVideoLearning />} />

            <Route element={<AdminRouteGuard />}>
              <Route path="/admin/insight" element={<DashboardOverview />} />
              <Route path="/admin/training-insight" element={<Insight />} />
              <Route path="/admin/courses" element={<AdminViewCourse />} />
              <Route path="/admin/approvals" element={<CourseApproval />} />
              <Route path="/admin/overview" element={<Overview />} />
              <Route path="/admin/tasks" element={<Tasks />} />
              <Route path="/admin/settings" element={<Setting />} />
            </Route>
          </Route>

          {/* Standalone Admin Layout routes */}
          <Route path="training-eg" element={<AdminLayout />}>
            <Route index element={<Navigate to="overview" replace />} />
            <Route path="overview" element={<Overview />} />
            <Route path="tasks" element={<Tasks />} />
            <Route path="settings" element={<Setting />} />
            <Route path="insight" element={<DashboardOverview />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  );
}