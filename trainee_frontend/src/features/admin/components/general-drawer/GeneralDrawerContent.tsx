import type { CourseCardItem } from "@/types/course";
import { CourseCoverBanner } from "../CourseCoverBanner";
import { GeneralInfoSection } from "./GeneralInfoSection";
import { WhatYouWillLearnSection } from "./WhatYouWillLearnSection";
import { KeyLessonsSection } from "./KeyLessonsSection";
import { LearningResourcesSection } from "./LearningResourcesSection";
import { TechnologiesSection } from "./TechnologiesSection";
import { QnASection } from "./QnASection";

export function GeneralDrawerContent({ course }: { course: CourseCardItem }) {
  return (
    <div className="flex-1 min-h-0 overflow-y-auto bg-white font-kantumruy">
      {/* Cover Banner */}
      <div className="p-4 border-b border-slate-300 bg-slate-50/50">
        <CourseCoverBanner course={course} heightClass="h-48" />
      </div>

      <GeneralInfoSection course={course} />
      <WhatYouWillLearnSection skills={course.skills} />
      <KeyLessonsSection keyLessons={course.keyLessons} />
      <LearningResourcesSection />
      <TechnologiesSection technologies={course.technologies} />
      <QnASection faqs={course.faqs} />
    </div>
  );
}
