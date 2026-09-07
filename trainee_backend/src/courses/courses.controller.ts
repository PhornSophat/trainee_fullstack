import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { CoursesService } from './courses.service';
import { LessonsService } from './lessons.service';
import { CourseCardItemDto } from './dto/course-card-item.dto';
import { ChapterDto } from './dto/chapter.dto';
import { UpdateLessonProgressDto } from './dto/update-lesson-progress.dto';
import { RequestAccessDto } from './dto/request-access.dto';
import { SetApprovalDto } from './dto/set-approval.dto';
import { UpdateCourseImageDto } from './dto/update-course-image.dto';
import { UpdateCourseDto } from './dto/update-course.dto';

@Controller('courses') // prefix all routes with /courses
export class CoursesController {
  constructor(
    private readonly svc: CoursesService,
    private readonly lessonsSvc: LessonsService,
  ) {}

  @Get()
  findAll(): Promise<CourseCardItemDto[]> {
    return this.svc.findAll();
  }

  @Get(':id/details')
  getDetails(@Param('id') id: string): Promise<ChapterDto[]> {
    return this.svc.getCurriculum(Number(id));
  }

  @Patch('lessons/:lessonId/progress')
  async updateLessonProgress(
    @Param('lessonId') lessonId: string,
    @Body() body: UpdateLessonProgressDto,
  ) {
    // TODO: Replace with actual user ID from auth
    const userId = '00000000-0000-0000-0000-000000000001';
    return this.lessonsSvc.updateProgress(
      userId,
      Number(lessonId),
      body.progressPercentage,
    );
  }

  @Post(':id/request-access')
  requestAccess(@Param('id') id: string, @Body() body: RequestAccessDto) {
    return this.svc.requestAccess(Number(id), body.userId);
  }

  @Patch(':id/approval')
  setApproval(@Param('id') id: string, @Body() body: SetApprovalDto) {
    return this.svc.setApprovalStatus(Number(id), body.status);
  }

  @Patch(':id/image')
  updateImage(@Param('id') id: string, @Body() body: UpdateCourseImageDto) {
    return this.svc.updateCourseImage(Number(id), body.imageUrl);
  }

  @Patch(':id')
  updateCourse(@Param('id') id: string, @Body() body: UpdateCourseDto) {
    return this.svc.updateCourse(Number(id), body);
  }
}
