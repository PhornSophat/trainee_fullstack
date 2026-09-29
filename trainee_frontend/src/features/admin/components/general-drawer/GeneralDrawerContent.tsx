import type { CourseCardItem, KeyLesson, CourseTechnology, CourseFAQ, LearningResource } from "@/types/course";
import { CourseCoverBanner } from "../CourseCoverBanner";
import { GeneralInfoSection } from "./GeneralInfoSection";
import { WhatYouWillLearnSection } from "./WhatYouWillLearnSection";
import { KeyLessonsSection } from "./KeyLessonsSection";
import { LearningResourcesSection } from "./LearningResourcesSection";
import { TechnologiesSection } from "./TechnologiesSection";
import { QnASection } from "./QnASection";
import { EditGeneralDrawerContent } from "./EditGeneralDrawerContent";
import { EditSkillDrawerContent } from "./EditSkillDrawerContent";
import { EditKeyLessonDrawerContent } from "./EditKeyLessonDrawerContent";
import { EditTechnologyDrawerContent } from "./EditTechnologyDrawerContent";
import { EditFaqDrawerContent } from "./EditFaqDrawerContent";
import { EditLearningResourceDrawerContent } from "./EditLearningResourceDrawerContent";

export type GeneralViewMode =
  | "view"
  | "edit-general"
  | "edit-skill"
  | "edit-key-lesson"
  | "edit-technology"
  | "edit-faq"
  | "edit-learning-resource";

type GeneralDrawerContentProps = {
  course: CourseCardItem;
  viewMode?: GeneralViewMode;
  setViewMode?: (mode: GeneralViewMode) => void;
  selectedSkill?: { index: number; text: string } | null;
  setSelectedSkill?: (skill: { index: number; text: string } | null) => void;
  selectedKeyLesson?: { index?: number; lesson?: KeyLesson } | null;
  setSelectedKeyLesson?: (item: { index?: number; lesson?: KeyLesson } | null) => void;
  selectedTech?: { index?: number; tech?: CourseTechnology } | null;
  setSelectedTech?: (item: { index?: number; tech?: CourseTechnology } | null) => void;
  selectedFaq?: { index?: number; faq?: CourseFAQ } | null;
  setSelectedFaq?: (item: { index?: number; faq?: CourseFAQ } | null) => void;
  selectedResource?: { index?: number; resource?: LearningResource } | null;
  setSelectedResource?: (item: { index?: number; resource?: LearningResource } | null) => void;
};

export function GeneralDrawerContent({
  course,
  viewMode = "view",
  setViewMode,
  selectedSkill = null,
  setSelectedSkill,
  selectedKeyLesson = null,
  setSelectedKeyLesson,
  selectedTech = null,
  setSelectedTech,
  selectedFaq = null,
  setSelectedFaq,
  selectedResource = null,
  setSelectedResource,
}: GeneralDrawerContentProps) {

  return (
    <div className="flex-1 min-h-0 overflow-y-auto bg-white font-kantumruy flex flex-col">
      {/* Cover Banner - Only displayed in main general view */}
      {viewMode === "view" && (
        <div className="p-4 border-b border-slate-300 bg-slate-50/50">
          <CourseCoverBanner course={course} heightClass="h-48" />
        </div>
      )}

      {viewMode === "edit-general" ? (
        <EditGeneralDrawerContent
          course={course}
          onCancel={() => setViewMode?.("view")}
        />
      ) : viewMode === "edit-skill" ? (
        <EditSkillDrawerContent
          course={course}
          initialText={selectedSkill?.text ?? ""}
          skillIndex={selectedSkill?.index}
          onCancel={() => {
            setSelectedSkill?.(null);
            setViewMode?.("view");
          }}
        />
      ) : viewMode === "edit-key-lesson" ? (
        <EditKeyLessonDrawerContent
          course={course}
          initialLesson={selectedKeyLesson?.lesson}
          lessonIndex={selectedKeyLesson?.index}
          onCancel={() => {
            setSelectedKeyLesson?.(null);
            setViewMode?.("view");
          }}
        />
      ) : viewMode === "edit-technology" ? (
        <EditTechnologyDrawerContent
          course={course}
          initialTech={selectedTech?.tech}
          techIndex={selectedTech?.index}
          onCancel={() => {
            setSelectedTech?.(null);
            setViewMode?.("view");
          }}
        />
      ) : viewMode === "edit-faq" ? (
        <EditFaqDrawerContent
          course={course}
          initialFaq={selectedFaq?.faq}
          faqIndex={selectedFaq?.index}
          onCancel={() => {
            setSelectedFaq?.(null);
            setViewMode?.("view");
          }}
        />
      ) : viewMode === "edit-learning-resource" ? (
        <EditLearningResourceDrawerContent
          course={course}
          initialResource={selectedResource?.resource}
          resourceIndex={selectedResource?.index}
          onCancel={() => {
            setSelectedResource?.(null);
            setViewMode?.("view");
          }}
        />
      ) : (
        <>
          <GeneralInfoSection
            course={course}
            onEdit={() => setViewMode?.("edit-general")}
          />
          <WhatYouWillLearnSection
            skills={course.skills}
            onAddSkill={() => {
              setSelectedSkill?.(null);
              setViewMode?.("edit-skill");
            }}
            onEditSkill={(index, text) => {
              setSelectedSkill?.({ index, text });
              setViewMode?.("edit-skill");
            }}
          />
          <KeyLessonsSection
            keyLessons={course.keyLessons}
            onAddLesson={() => {
              setSelectedKeyLesson?.(null);
              setViewMode?.("edit-key-lesson");
            }}
            onEditLesson={(index, lesson) => {
              setSelectedKeyLesson?.({ index, lesson });
              setViewMode?.("edit-key-lesson");
            }}
          />
          <LearningResourcesSection
            resources={course.learningResources}
            onAddResource={() => {
              setSelectedResource?.(null);
              setViewMode?.("edit-learning-resource");
            }}
            onEditResource={(index, resource) => {
              setSelectedResource?.({ index, resource });
              setViewMode?.("edit-learning-resource");
            }}
          />
          <TechnologiesSection
            technologies={course.technologies}
            onAddTech={() => {
              setSelectedTech?.(null);
              setViewMode?.("edit-technology");
            }}
            onEditTech={(index, tech) => {
              setSelectedTech?.({ index, tech });
              setViewMode?.("edit-technology");
            }}
          />
          <QnASection
            faqs={course.faqs}
            onAddFaq={() => {
              setSelectedFaq?.(null);
              setViewMode?.("edit-faq");
            }}
            onEditFaq={(index, faq) => {
              setSelectedFaq?.({ index, faq });
              setViewMode?.("edit-faq");
            }}
          />
        </>
      )}
    </div>
  );
}
