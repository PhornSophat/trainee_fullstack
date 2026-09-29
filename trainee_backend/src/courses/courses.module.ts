import { Module } from '@nestjs/common';
import { CoursesService } from './courses.service';
import { CoursesController } from './courses.controller';
import { LessonsService } from './lessons.service';
import { Course } from './entities/course.entity';
import { CourseFaq } from './entities/course-faqs.entity';
import { CourseLearningResource } from './entities/course-learning-resource.entity';
import { KeyLesson } from './entities/key-lesson.entity';
import { CourseTechnology } from './entities/course-technology.entity';
import { CourseSkill } from './entities/course-skill.entity';
import { User } from './entities/user.entity';
import { Lesson } from './entities/lesson.entity';
import { LessonProgress } from './entities/lesson-progress.entity';
import { Chapter } from './entities/chapter.entity';
import { Category } from '../categories/entities/category.entity';
import { Homework } from './entities/homework.entity';
import { HomeworkTask } from './entities/homework-task.entity';
import { LessonDocument } from './entities/lesson-document.entity';
import { Submission } from './entities/submission.entity';
import { SubmissionAttachment } from './entities/submission-attachment.entity';
import { ChatMessage } from './entities/chat-message.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MuxService } from './mux.service';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Course,
      Chapter,
      Lesson,
      LessonProgress,
      LessonDocument,
      User,
      CourseSkill,
      CourseTechnology,
      KeyLesson,
      CourseFaq,
      CourseLearningResource,
      Category,
      Homework,
      HomeworkTask,
      Submission,
      SubmissionAttachment,
      ChatMessage,
    ]),
    NotificationsModule,
  ],
  providers: [CoursesService, LessonsService, MuxService],
  controllers: [CoursesController],
  exports: [MuxService],
})
export class CoursesModule {}
