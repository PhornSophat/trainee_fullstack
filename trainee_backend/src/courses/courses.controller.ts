import { Body, Controller, Get, Param, Patch, Post, Delete } from '@nestjs/common';
import { CoursesService } from './courses.service';
import { LessonsService } from './lessons.service';
import { CourseCardItemDto } from './dto/course-card-item.dto';
import { ChapterDto } from './dto/chapter.dto';
import { UpdateLessonProgressDto } from './dto/update-lesson-progress.dto';
import { RequestAccessDto } from './dto/request-access.dto';
import { SetApprovalDto } from './dto/set-approval.dto';
import { UpdateCourseImageDto } from './dto/update-course-image.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { CreateCourseDto } from './dto/create-course.dto';
import { CreateLessonDocumentDto } from './dto/create-lesson-document.dto';
import { MuxService } from './mux.service';

@Controller('courses') // prefix all routes with /courses
export class CoursesController {
  constructor(
    private readonly svc: CoursesService,
    private readonly lessonsSvc: LessonsService,
    private readonly muxSvc: MuxService,
  ) {}

  @Get()
  findAll(): Promise<CourseCardItemDto[]> {
    return this.svc.findAll();
  }

  @Get(':id/details')
  getDetails(@Param('id') id: string): Promise<ChapterDto[]> {
    // TODO: Replace with actual user ID from auth
    const userId = '00000000-0000-0000-0000-000000000001';
    return this.svc.getCurriculum(Number(id), userId);
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
      body.lastPositionSeconds,
    );
  }

  @Patch('reset-all-status')
  resetAllStatus() {
    return this.svc.resetAllApprovalStatus();
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

  @Post()
  createCourse(@Body() body: CreateCourseDto) {
    return this.svc.createCourse(body);
  }

  @Delete(':id')
  deleteCourse(@Param('id') id: string) {
    return this.svc.deleteCourse(Number(id));
  }

  @Post(':id/chapters')
  createChapter(
    @Param('id') id: string,
    @Body() body: { title: string }
  ) {
    return this.svc.createChapter(Number(id), body.title);
  }

  @Patch('chapters/:chapterId')
  updateChapter(
    @Param('chapterId') chapterId: string,
    @Body() body: { title: string }
  ) {
    return this.svc.updateChapter(Number(chapterId), body.title);
  }

  @Delete('chapters/:chapterId')
  deleteChapter(@Param('chapterId') chapterId: string) {
    return this.svc.deleteChapter(Number(chapterId));
  }

  @Post('chapters/:chapterId/lessons')
  createLesson(
    @Param('chapterId') chapterId: string,
    @Body() body: { title: string; description?: string; duration?: string; type?: string; videoUrl?: string; playbackId?: string }
  ) {
    return this.lessonsSvc.createLesson(Number(chapterId), body);
  }

  @Delete('lessons/:lessonId')
  deleteLesson(@Param('lessonId') lessonId: string) {
    return this.lessonsSvc.deleteLesson(Number(lessonId));
  }

  @Patch('lessons/:lessonId')
  updateLesson(
    @Param('lessonId') lessonId: string,
    @Body() body: { title?: string; description?: string; duration?: string; videoUrl?: string; playbackId?: string }
  ) {
    return this.lessonsSvc.updateLesson(Number(lessonId), body);
  }

  @Post('lessons/:lessonId/documents')
  addLessonDocument(
    @Param('lessonId') lessonId: string,
    @Body() body: CreateLessonDocumentDto,
  ) {
    return this.lessonsSvc.addDocument(Number(lessonId), body);
  }

  @Delete('lessons/documents/:documentId')
  deleteLessonDocument(@Param('documentId') documentId: string) {
    return this.lessonsSvc.deleteDocument(Number(documentId));
  }

  @Get('lessons/:lessonId/documents')
  getLessonDocuments(@Param('lessonId') lessonId: string) {
    return this.lessonsSvc.getDocuments(Number(lessonId));
  }

  @Get(':id/homeworks')
  getHomeworks(@Param('id') id: string) {
    return this.svc.getHomeworks(Number(id));
  }

  @Post(':id/homeworks')
  createHomework(
    @Param('id') id: string,
    @Body() body: { title: string; description?: string }
  ) {
    return this.svc.createHomework(Number(id), body.title, body.description);
  }

  @Patch('homeworks/:homeworkId')
  updateHomework(
    @Param('homeworkId') homeworkId: string,
    @Body() body: { title?: string; description?: string }
  ) {
    return this.svc.updateHomework(Number(homeworkId), body.title, body.description);
  }

  @Delete('homeworks/:homeworkId')
  deleteHomework(@Param('homeworkId') homeworkId: string) {
    return this.svc.deleteHomework(Number(homeworkId));
  }

  @Post('homeworks/:homeworkId/tasks')
  createHomeworkTask(
    @Param('homeworkId') homeworkId: string,
    @Body() body: { title: string; description?: string; type?: string; maxScore?: number; dueDate?: string }
  ) {
    return this.svc.createHomeworkTask(Number(homeworkId), body);
  }

  @Patch('homework_tasks/:taskId')
  updateHomeworkTask(
    @Param('taskId') taskId: string,
    @Body() body: { title?: string; description?: string; type?: string; maxScore?: number; dueDate?: string }
  ) {
    return this.svc.updateHomeworkTask(Number(taskId), body);
  }

  @Delete('homework_tasks/:taskId')
  deleteHomeworkTask(@Param('taskId') taskId: string) {
    return this.svc.deleteHomeworkTask(Number(taskId));
  }

  // --- Homework Task Submission & Chat Endpoints ---

  @Get('homework_tasks/:taskId/submission')
  getTaskSubmission(@Param('taskId') taskId: string) {
    const userId = '00000000-0000-0000-0000-000000000001';
    return this.svc.getTaskSubmission(Number(taskId), userId);
  }

  @Post('homework_tasks/:taskId/attachments')
  addSubmissionAttachment(
    @Param('taskId') taskId: string,
    @Body() body: { fileName: string; fileUrl: string; fileSize?: number },
  ) {
    const userId = '00000000-0000-0000-0000-000000000001';
    return this.svc.addSubmissionAttachment(Number(taskId), body, userId);
  }

  @Delete('homework_tasks/attachments/:attachmentId')
  deleteSubmissionAttachment(@Param('attachmentId') attachmentId: string) {
    return this.svc.deleteSubmissionAttachment(Number(attachmentId));
  }

  @Patch('homework_tasks/:taskId/status')
  updateSubmissionStatus(
    @Param('taskId') taskId: string,
    @Body() body: { status: string; senderName?: string; sender?: string },
  ) {
    const userId = '00000000-0000-0000-0000-000000000001';
    return this.svc.updateSubmissionStatus(
      Number(taskId),
      body.status,
      userId,
      body.senderName,
      body.sender,
    );
  }

  @Post('homework_tasks/:taskId/messages')
  addTaskChatMessage(
    @Param('taskId') taskId: string,
    @Body() body: { text: string; senderName?: string; sender?: string },
  ) {
    const userId = '00000000-0000-0000-0000-000000000001';
    return this.svc.addTaskChatMessage(Number(taskId), body, userId);
  }

  // --- Mux Endpoints ---
  @Post('mux/direct-upload')
  createMuxDirectUpload(@Body() body?: { lessonId?: number }) {
    return this.muxSvc.createDirectUpload(body?.lessonId);
  }

  @Get('mux/uploads/:uploadId')
  getMuxUploadStatus(@Param('uploadId') uploadId: string) {
    return this.muxSvc.getUploadStatus(uploadId);
  }

  @Post('mux/webhook')
  handleMuxWebhook(@Body() body: any) {
    return this.muxSvc.handleWebhook(body);
  }
}
