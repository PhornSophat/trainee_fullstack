import { Module } from '@nestjs/common';
import { CoursesService } from './courses.service';
import { CoursesController } from './courses.controller';
import { LessonsService } from './lessons.service';
import { Course } from './entities/course.entity';
import { CourseFaq } from './entities/course-faqs.entity';
import { KeyLesson } from './entities/key-lesson.entity';
import { CourseTechnology } from './entities/course-technology.entity';
import { CourseSkill } from './entities/course-skill.entity';
import { User } from './entities/user.entity';
import { Lesson } from './entities/lesson.entity';
import { LessonProgress } from './entities/lesson-progress.entity';
import { Chapter } from './entities/chapter.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Course,
      Chapter,
      Lesson,
      LessonProgress,
      User,
      CourseSkill,
      CourseTechnology,
      KeyLesson,
      CourseFaq,
    ]),
  ],
  providers: [CoursesService, LessonsService],
  controllers: [CoursesController],
})
export class CoursesModule {}
