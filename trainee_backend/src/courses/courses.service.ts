/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import {
  BadRequestException,
  Injectable,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { Course } from './entities/course.entity';
import { Repository, In } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Chapter } from './entities/chapter.entity';
import { CourseCardItemDto } from './dto/course-card-item.dto';
import { plainToInstance } from 'class-transformer';
import { ChapterDto } from './dto/chapter.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { CreateCourseDto } from './dto/create-course.dto';

import { Homework } from './entities/homework.entity';
import { HomeworkTask } from './entities/homework-task.entity';
import { Submission, HomeworkStatusEnum } from './entities/submission.entity';
import { SubmissionAttachment } from './entities/submission-attachment.entity';
import { ChatMessage, ChatSenderEnum } from './entities/chat-message.entity';
import { LessonProgress } from './entities/lesson-progress.entity';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class CoursesService {
  private readonly logger = new Logger(CoursesService.name);
  private cache: { data: CourseCardItemDto[]; ts: number } | null = null;

  constructor(
    @InjectRepository(Course) private courseRepo: Repository<Course>,
    @InjectRepository(Chapter) private chapterRepo: Repository<Chapter>,
    @InjectRepository(Homework) private homeworkRepo: Repository<Homework>,
    @InjectRepository(HomeworkTask) private homeworkTaskRepo: Repository<HomeworkTask>,
    @InjectRepository(LessonProgress) private progressRepo: Repository<LessonProgress>,
    @InjectRepository(Submission) private submissionRepo: Repository<Submission>,
    @InjectRepository(SubmissionAttachment) private attachmentRepo: Repository<SubmissionAttachment>,
    @InjectRepository(ChatMessage) private chatRepo: Repository<ChatMessage>,
    private readonly notifService: NotificationsService,
  ) {}

  async findAll(): Promise<CourseCardItemDto[]> {
    // Fix A: return cached data if it's still fresh (<30s)
    if (this.cache && Date.now() - this.cache.ts < 30_000) {
      return this.cache.data;
    }

    // Avoid Cartesian product explosion by loading relations with separate queries
    const rows = await this.courseRepo.find({
      relations: {
        instructors: true,
        skills: true,
        technologies: true,
        keyLessons: true,
        faqs: true,
        learningResources: true,
        categories: true,
      },
      order: {
        created_at: 'DESC',
      },
      relationLoadStrategy: 'query',
    });

    const stats = await this.getCourseStats();
    const dtos = plainToInstance(CourseCardItemDto, rows);
    for (const dto of dtos) {
      const s = stats.get(dto.id);
      if (s) Object.assign(dto, s);
    }

    this.cache = { data: dtos, ts: Date.now() };
    return dtos;
  }

  async getCurriculum(
    courseId: number,
    userId: string = '00000000-0000-0000-0000-000000000001',
  ): Promise<ChapterDto[]> {
    if (isNaN(courseId)) {
      return [];
    }
    const chapters = await this.chapterRepo
      .createQueryBuilder('chapter')
      .leftJoinAndSelect('chapter.lessons', 'lesson')
      .leftJoinAndSelect('lesson.documents', 'document')
      .where('chapter.course_id = :courseId', { courseId })
      .orderBy('chapter.position', 'ASC')
      .addOrderBy('lesson.position', 'ASC')
      .addOrderBy('document.id', 'ASC')
      .getMany();

    const lessonIds = chapters.flatMap((c) =>
      (c.lessons || []).map((l) => l.id),
    );

    const progressMap = new Map<number, number>();
    const positionMap = new Map<number, number>();
    if (lessonIds.length > 0 && userId) {
      const progressRecords = await this.progressRepo
        .createQueryBuilder('p')
        .where('p.user_id = :userId', { userId })
        .andWhere('p.lesson_id IN (:...lessonIds)', { lessonIds })
        .getMany();

      for (const rec of progressRecords) {
        progressMap.set(rec.lessonId, rec.progressPercentage);
        positionMap.set(rec.lessonId, rec.lastPositionSeconds ?? 0);
      }
    }

    const result: ChapterDto[] = chapters.map((chapter) => {
      const lessonDtos = (chapter.lessons || []).map((lesson) => ({
        id: lesson.id,
        title: lesson.title,
        description: lesson.description || '',
        duration: lesson.duration || '',
        type: lesson.type,
        videoUrl: lesson.video_url || '',
        playbackId:
          lesson.mux_playback_id ||
          (lesson.video_url &&
          /^[a-zA-Z0-9_-]{15,50}$/.test(lesson.video_url.trim()) &&
          !lesson.video_url.includes('/')
            ? lesson.video_url.trim()
            : ''),
        progressPercentage: progressMap.get(lesson.id) ?? 0,
        lastPositionSeconds: positionMap.get(lesson.id) ?? 0,
        documents: (lesson.documents || []).map((doc) => ({
          id: doc.id,
          lessonId: doc.lessonId,
          title: doc.title,
          fileUrl: doc.fileUrl,
          fileType: doc.fileType,
          fileSize: doc.fileSize,
          createdAt: doc.createdAt,
        })),
      }));
      return {
        id: chapter.id,
        title: chapter.title,
        lessons: lessonDtos,
      };
    });
    return result;
  }

  private async getCourseStats(): Promise<Map<number, any>> {
    const query = `
      SELECT
        c.id                                                          AS "courseId",
        COALESCE(AVG(r.rating), 0)                                    AS "rating",
        COUNT(DISTINCT r.id)                                          AS "reviewCount",
        COUNT(DISTINCT l.id)                                          AS "lessons",
        COUNT(DISTINCT CASE WHEN ht.type = 'TASK'  THEN ht.id END)    AS "tasks",
        COUNT(DISTINCT CASE WHEN ht.type = 'QUIZ'  THEN ht.id END)    AS "quizzes",
        COUNT(DISTINCT e.id)                                          AS "totalEnrollments",
        COUNT(DISTINCT CASE WHEN e.progress_percentage = 100
                            THEN e.id END)                            AS "totalCompletions",
        COUNT(DISTINCT CASE WHEN cr.type = 'LIKE'   THEN cr.id END)   AS "totalLikes",
        COUNT(DISTINCT CASE WHEN cr.type = 'DISLIKE' THEN cr.id END)  AS "totalDislikes"
      FROM courses c
      LEFT JOIN reviews           r  ON r.course_id  = c.id
      LEFT JOIN chapters          ch ON ch.course_id = c.id
      LEFT JOIN lessons           l  ON l.chapter_id = ch.id
      LEFT JOIN homeworks         h  ON h.course_id  = c.id
      LEFT JOIN homework_tasks    ht ON ht.homework_id = h.id
      LEFT JOIN enrollments       e  ON e.course_id  = c.id
      LEFT JOIN course_reactions  cr ON cr.course_id = c.id
      GROUP BY c.id
    `;

    const rows = await this.courseRepo.query(query);

    const map = new Map<number, any>();
    for (const row of rows) {
      map.set(Number(row.courseId), {
        rating: Number(row.rating),
        reviewCount: Number(row.reviewCount),
        lessons: Number(row.lessons),
        tasks: Number(row.tasks),
        quizzes: Number(row.quizzes),
        totalEnrollments: Number(row.totalEnrollments),
        totalCompletions: Number(row.totalCompletions),
        totalLikes: Number(row.totalLikes),
        totalDislikes: Number(row.totalDislikes),
      });
    }
    return map;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async requestAccess(courseId: number, userId?: string) {
    const course = await this.courseRepo.findOne({ where: { id: courseId } });

    if (!course) throw new NotFoundException('Course not found!');
    if (course.approval_status === 'APPROVED')
      return { message: 'Already approved', status: 'APPROVED' };

    course.approval_status = 'PENDING'; // Request sent, awaiting admin approval
    await this.courseRepo.save(course);
    this.cache = null;

    // Create notification for Admin in PostgreSQL
    await this.notifService.create({
      type: 'COURSE_REQUEST',
      title: 'សំណើចូលរៀនជំនាញសិក្សា',
      breadcrumb: `${course.khmer_title || course.title} > សំណើ`,
      message: `សុផាត ផន បានស្នើសុំចូលរៀនវគ្គ ${course.title}`,
      sender_name: 'សុផាត ផន',
      avatar_url: '/e20220628.jpg',
      course_id: course.id,
      course_title: course.title,
      target_url: '/admin/approvals',
      for_role: 'admin',
    });

    return { message: 'Request sent', status: 'PENDING' };
  }

  async setApprovalStatus(courseId: number, status: string) {
    const formattedStatus = (status || '').toUpperCase();
    const allowed = ['APPROVED', 'REJECTED', 'PENDING', 'NOT_REQUESTED'];
    if (!allowed.includes(formattedStatus)) {
      throw new BadRequestException('Invalid Status!');
    }

    const course = await this.courseRepo.findOne({ where: { id: courseId } });
    if (!course) throw new NotFoundException('Course not found!');
    course.approval_status = formattedStatus;
    await this.courseRepo.save(course);
    this.cache = null;

    const isApproved = formattedStatus === 'APPROVED';
    await this.notifService.create({
      type: isApproved ? 'COURSE_APPROVED' : 'COURSE_REJECTED',
      title: 'សំណើចូលរៀនជំនាញសិក្សា',
      breadcrumb: `${course.khmer_title || course.title} > សំណើ`,
      message: isApproved
        ? `ខូច គឿន បានអនុម័តសំណើក្នុងការចូលរួម ${course.title}`
        : `ខូច គឿន បានបដិសេធសំណើក្នុងការចូលរួម ${course.title}`,
      sender_name: 'ខូច គឿន',
      avatar_url: '/e20220628.jpg',
      course_id: course.id,
      course_title: course.title,
      target_url: `/trainee/programs/${course.id}`,
      for_role: 'user',
    });

    return {
      message: `Status set to ${formattedStatus}`,
      status: formattedStatus,
    };
  }

  async resetAllApprovalStatus() {
    await this.courseRepo.query(`UPDATE courses SET approved_status = 'NOT_REQUESTED'`);
    this.cache = null;
    return { success: true, message: 'All courses reset to NOT_REQUESTED' };
  }

  async updateCourseImage(courseId: number, imageUrl: string) {
    const course = await this.courseRepo.findOne({ where: { id: courseId } });
    if (!course) throw new NotFoundException('Course not found!');

    course.image_url = imageUrl;
    await this.courseRepo.save(course);

    this.cache = null;

    return { message: 'Thumbnail updated successfully', imageUrl };
  }

  // update course Information
  async updateCourse(courseId: number, dto: UpdateCourseDto) {
    const course = await this.courseRepo.findOne({ where: { id: courseId } });
    if (!course) throw new NotFoundException('Course not found!');

    if (dto.title !== undefined) course.title = dto.title;
    if (dto.khmerTitle !== undefined) course.khmer_title = dto.khmerTitle;
    if (dto.level !== undefined) course.level = dto.level;
    if (dto.description !== undefined) course.description = dto.description;

    await this.courseRepo.save(course);

    if (dto.categoryId !== undefined) {
      await this.courseRepo.query(
        `DELETE FROM course_categories WHERE course_id = $1`,
        [courseId],
      );

      await this.courseRepo.query(
        `INSERT INTO course_categories (course_id, category_id) VALUES ($1, $2)`,
        [courseId, dto.categoryId],
      );
    }

    if (dto.skills !== undefined) {
      await this.courseRepo.query(
        `DELETE FROM course_skills WHERE course_id = $1`, 
        [courseId]
      );

      for (let i = 0; i < dto.skills.length; i++ ) {
        const text = dto.skills[i]?.trim();
        if (text) {
          await this.courseRepo.query(
            `INSERT INTO course_skills (course_id, text, position) VALUES ($1, $2, $3)`,
            [courseId, text, i + 1],
          );
        }
      }
    }

    if (dto.keyLessons !== undefined) {
      await this.courseRepo.query(
        `DELETE FROM key_lessons WHERE course_id = $1`,
        [courseId],
      );

      for (let i = 0; i < dto.keyLessons.length; i++) {
        const item = dto.keyLessons[i];
        const title = item.title?.trim();
        if (title) {
          await this.courseRepo.query(
            `INSERT INTO key_lessons (course_id, code, title, description, image_url, position) VALUES ($1, $2, $3, $4, $5, $6)`,
            [courseId, item.code || null, title, item.description || null, item.imageUrl || null, i + 1],
          );
        }
      }
    }

    if (dto.technologies !== undefined) {
      await this.courseRepo.query(
        `DELETE FROM course_technologies WHERE course_id = $1`,
        [courseId],
      );

      for (const item of dto.technologies) {
        const name = item.name?.trim();
        if (name) {
          await this.courseRepo.query(
            `INSERT INTO course_technologies (course_id, name, icon) VALUES ($1, $2, $3)`,
            [courseId, name, item.icon || null],
          );
        }
      }
    }

    if (dto.faqs !== undefined) {
      await this.courseRepo.query(
        `DELETE FROM course_faqs WHERE course_id = $1`,
        [courseId],
      );

      for (let i = 0; i < dto.faqs.length; i++) {
        const item = dto.faqs[i];
        const question = item.question?.trim();
        if (question) {
          await this.courseRepo.query(
            `INSERT INTO course_faqs (course_id, question, answer, position) VALUES ($1, $2, $3, $4)`,
            [courseId, question, item.answer || null, i + 1],
          );
        }
      }
    }

    if (dto.learningResources !== undefined) {
      await this.courseRepo.query(
        `DELETE FROM course_learning_resources WHERE course_id = $1`,
        [courseId],
      );

      for (let i = 0; i < dto.learningResources.length; i++) {
        const item = dto.learningResources[i];
        const title = item.title?.trim();
        if (title) {
          await this.courseRepo.query(
            `INSERT INTO course_learning_resources (course_id, title, url, icon, position) VALUES ($1, $2, $3, $4, $5)`,
            [courseId, title, item.url || null, item.icon || 'file', i + 1],
          );
        }
      }
    }

    this.cache = null;

    return { message: 'Course updated successfully', course };
  }

  async createCourse(dto: CreateCourseDto) {
    const result = await this.courseRepo.query(`
       INSERT INTO courses (title, khmer_title, description, image_url, level, duration, approved_status)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING *
      `, [ 
          dto.title.trim(),
          dto.khmerTitle?.trim() || null,
          dto.description?.trim() || null,
          dto.imageUrl || null,
          dto.level || "BASIC",
          dto.duration || "0h",
          'NOT_REQUESTED'
          ]
    );

    const newCourse = result[0];

    if (dto.categoryId) {
      await this.courseRepo.query(
        `INSERT INTO course_categories (course_id, category_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`, [ newCourse.id, dto.categoryId],
      );
    }

    this.cache = null;

    return {
      message: 'Course created successfully',
      course: newCourse,
    }
  };

  async deleteCourse( id: number ) {
    // check the course id is exist or not
    const course = await this.courseRepo.findOne({ where: { id } });

    if (!course) {
      throw new NotFoundException(`Course with id ${id} not found!`);
    }

    // Clean up auxiliary relation tables safely
    await this.courseRepo.query(`DELETE FROM course_categories WHERE course_id = $1`, [id]);
    await this.courseRepo.query(`DELETE FROM course_instructors WHERE course_id = $1`, [id]);
    await this.courseRepo.query(`DELETE FROM course_skills WHERE course_id = $1`, [id]);
    await this.courseRepo.query(`DELETE FROM key_lessons WHERE course_id = $1`, [id]);
    await this.courseRepo.query(`DELETE FROM course_technologies WHERE course_id = $1`, [id]);
    await this.courseRepo.query(`DELETE FROM course_faqs WHERE course_id = $1`, [id]);
    await this.courseRepo.query(`DELETE FROM course_learning_resources WHERE course_id = $1`, [id]);

    const chapters = await this.chapterRepo.find({ where: { course: { id } } });
    if (chapters.length > 0) {
      const chapterIds = chapters.map((c) => c.id);
      await this.courseRepo.query(
        `DELETE FROM lesson_progress WHERE lesson_id IN (SELECT id FROM lessons WHERE chapter_id = ANY($1))`,
        [chapterIds],
      );
      await this.courseRepo.query(`DELETE FROM lessons WHERE chapter_id = ANY($1)`, [chapterIds]);
      await this.chapterRepo.delete(chapterIds);
    }

    // delete the course 
    await this.courseRepo.delete(id);

    this.cache = null;

    return { message : 'Course delete successfully!'};
  }

  // add chapter to the course
  async createChapter(courseId: number, title: string) {
    const count = await this.chapterRepo.count({ where: { course: { id: courseId } }});
    const chapter = this.chapterRepo.create({
      title,
      position: count + 1,
      course: { id: courseId },
    });

    this.cache = null;
    return this.chapterRepo.save(chapter);
  }

  async deleteChapter(chapterId: number) {
    await this.chapterRepo.delete(chapterId);
  
    this.cache = null;
    return { message: 'Chapter deleted successfully' };
  }

  async updateChapter(chapterId: number, title: string) {
    await this.chapterRepo.update(chapterId, { title });
    this.cache = null;
    return this.chapterRepo.findOne({ where: { id: chapterId } });
  }

  async getHomeworks(courseId: number, userId: string = '00000000-0000-0000-0000-000000000001') {
    const homeworks = await this.homeworkRepo.find({
      where: { course: { id: courseId } },
      relations: { tasks: true },
      order: { id: 'ASC' },
    });

    const taskIds = homeworks.flatMap((hw) => hw.tasks?.map((t) => t.id) || []);
    const submissionMap = new Map<number, Submission>();
    if (taskIds.length > 0) {
      const submissions = await this.submissionRepo.find({
        where: { task: { id: In(taskIds) }, userId },
        relations: { attachments: true, task: true },
      });
      for (const s of submissions) {
        if (s.task?.id) {
          submissionMap.set(Number(s.task.id), s);
        }
      }
    }

    return homeworks.map((hw) => ({
      id: hw.id,
      title: hw.title,
      description: hw.description || '',
      courseId: courseId,
      tasks: (hw.tasks || []).map((t) => {
        const sub = submissionMap.get(Number(t.id));
        return {
          id: t.id,
          title: t.title,
          description: t.description || '',
          type: (t.type || 'TASK').toLowerCase(),
          status: sub?.status || 'NOT_SUBMITTED',
          score: sub?.score ?? undefined,
          attachments: sub?.attachments?.map((a) => a.fileName) || [],
          maxScore: Number(t.maxScore) || 100,
          dueDate: t.dueDate ? t.dueDate.toISOString() : undefined,
        };
      }),
    }));
  }

  async createHomework(courseId: number, title: string, description?: string) {
    const homework = this.homeworkRepo.create({
      title: title.trim(),
      description: description?.trim(),
      course: { id: courseId },
    });
    const saved = await this.homeworkRepo.save(homework);
    this.cache = null;
    return {
      id: saved.id,
      title: saved.title,
      description: saved.description || '',
      courseId: courseId,
      tasks: [],
    };
  }

  async updateHomework(homeworkId: number, title?: string, description?: string) {
    await this.homeworkRepo.update(homeworkId, {
      ...(title && { title: title.trim() }),
      ...(description !== undefined && { description: description.trim() }),
    });
    this.cache = null;
    return this.homeworkRepo.findOne({
      where: { id: homeworkId },
      relations: { tasks: true },
    });
  }

  async deleteHomework(homeworkId: number) {
    await this.homeworkTaskRepo.delete({ homework: { id: homeworkId } });
    await this.homeworkRepo.delete(homeworkId);
    this.cache = null;
    return { message: 'Homework deleted successfully' };
  }

  async createHomeworkTask(
    homeworkId: number,
    data: {
      title: string;
      description?: string;
      type?: string;
      maxScore?: number;
      dueDate?: string;
    },
  ) {
    const task = this.homeworkTaskRepo.create({
      title: data.title.trim(),
      description: data.description?.trim(),
      type: (data.type || 'TASK').toUpperCase(),
      maxScore: data.maxScore !== undefined ? Number(data.maxScore) : 100,
      dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
      homework: { id: homeworkId },
    });
    const saved = await this.homeworkTaskRepo.save(task);
    this.cache = null;
    return {
      id: saved.id,
      title: saved.title,
      description: saved.description || '',
      type: (saved.type || 'TASK').toLowerCase(),
      status: 'NOT_SUBMITTED',
      maxScore: Number(saved.maxScore),
      dueDate: saved.dueDate ? saved.dueDate.toISOString() : undefined,
    };
  }

  async updateHomeworkTask(
    taskId: number,
    data: {
      title?: string;
      description?: string;
      type?: string;
      maxScore?: number;
      dueDate?: string;
    },
  ) {
    await this.homeworkTaskRepo.update(taskId, {
      ...(data.title && { title: data.title.trim() }),
      ...(data.description !== undefined && { description: data.description.trim() }),
      ...(data.type && { type: data.type.toUpperCase() }),
      ...(data.maxScore !== undefined && { maxScore: Number(data.maxScore) }),
      ...(data.dueDate !== undefined && { dueDate: data.dueDate ? new Date(data.dueDate) : undefined }),
    });
    this.cache = null;
    const updated = await this.homeworkTaskRepo.findOne({ where: { id: taskId } });
    if (!updated) {
      throw new NotFoundException(`Task with ID ${taskId} not found`);
    }
    return {
      id: updated.id,
      title: updated.title,
      description: updated.description || '',
      type: (updated.type || 'TASK').toLowerCase(),
      status: 'NOT_SUBMITTED',
      maxScore: Number(updated.maxScore),
      dueDate: updated.dueDate ? updated.dueDate.toISOString() : undefined,
    };
  }

  async deleteHomeworkTask(taskId: number) {
    await this.homeworkTaskRepo.delete(taskId);
    this.cache = null;
    return { message: 'Task deleted successfully' };
  }

  // --- Submissions & Attachments End-to-End ---

  async findOrCreateSubmission(
    taskId: number,
    userId: string = '00000000-0000-0000-0000-000000000001'
  ): Promise<Submission> {
    let sub = await this.submissionRepo.findOne({
      where: { task: { id: taskId }, userId },
      relations: { attachments: true, messages: true, task: true },
    });

    if (!sub) {
      const task = await this.homeworkTaskRepo.findOne({ where: { id: taskId } });
      if (!task) {
        throw new NotFoundException(`Homework task #${taskId} not found`);
      }
      sub = this.submissionRepo.create({
        task,
        userId,
        instructorId: '00000000-0000-0000-0000-000000000002', // Dara
        status: HomeworkStatusEnum.NOT_SUBMITTED,
      });
      sub = await this.submissionRepo.save(sub);
      sub.attachments = [];
      sub.messages = [];
    }

    return sub;
  }

  async getTaskSubmission(
    taskId: number,
    userId: string = '00000000-0000-0000-0000-000000000001'
  ) {
    try {
      return await this._getTaskSubmissionData(taskId, userId);
    } catch (err: any) {
      if (
        err?.message?.includes('Connection terminated') ||
        err?.message?.includes('timeout')
      ) {
        this.logger.warn(
          `Retrying getTaskSubmission for task #${taskId} after connection timeout...`
        );
        return await this._getTaskSubmissionData(taskId, userId);
      }
      throw err;
    }
  }

  private async _getTaskSubmissionData(
    taskId: number,
    userId: string = '00000000-0000-0000-0000-000000000001'
  ) {
    const sub = await this.findOrCreateSubmission(taskId, userId);
    const task = await this.homeworkTaskRepo.findOne({
      where: { id: taskId },
      relations: { homework: { course: true } },
    });

    // Ensure attachments and messages are loaded and sorted
    const attachments = await this.attachmentRepo.find({
      where: { submission: { id: sub.id } },
      order: { uploadedAt: 'ASC' },
    });

    const messages = await this.chatRepo.find({
      where: { submission: { id: sub.id } },
      order: { sentAt: 'ASC' },
    });

    return {
      id: sub.id,
      taskId: Number(taskId),
      taskTitle: task?.title || 'កិច្ចការ',
      taskDescription: task?.description || '',
      taskDeadline: task?.dueDate ? task.dueDate.toISOString() : '',
      courseId: task?.homework?.course?.id,
      courseTitle: task?.homework?.course?.title || '',
      userId: sub.userId,
      instructorId: sub.instructorId,
      status: sub.status,
      score: sub.score,
      submittedAt: sub.submittedAt ? sub.submittedAt.toISOString() : null,
      attachments: attachments.map((a) => ({
        id: a.id,
        fileName: a.fileName,
        fileUrl: a.fileUrl,
        fileSize: a.fileSize ? Number(a.fileSize) : undefined,
        uploadedAt: a.uploadedAt.toISOString(),
      })),
      messages: messages.map((m) => ({
        id: m.id,
        senderName: m.senderName,
        sender: m.sender === ChatSenderEnum.STUDENT ? 'student' : 'instructor',
        text: m.text,
        sentAt: m.sentAt.toISOString(),
      })),
    };
  }

  async addSubmissionAttachment(
    taskId: number,
    data: { fileName: string; fileUrl: string; fileSize?: number },
    userId: string = '00000000-0000-0000-0000-000000000001'
  ) {
    const sub = await this.findOrCreateSubmission(taskId, userId);

    const attachment = this.attachmentRepo.create({
      submission: sub,
      fileName: data.fileName,
      fileUrl: data.fileUrl,
      fileSize: data.fileSize,
    });
    const savedAttachment = await this.attachmentRepo.save(attachment);

    // Auto-create chat notification message for the added file
    const chatMsg = this.chatRepo.create({
      submission: sub,
      senderName: 'Sophath',
      sender: ChatSenderEnum.STUDENT,
      text: `បានបញ្ចូលឯកសារ៖ ${data.fileName}`,
    });
    const savedChat = await this.chatRepo.save(chatMsg);

    // Notify Admin of uploaded attachment
    try {
      const task = await this.homeworkTaskRepo.findOne({
        where: { id: taskId },
        relations: { homework: { course: true } },
      });
      const course = task?.homework?.course;
      await this.notifService.create({
        type: 'HOMEWORK_SUBMITTED',
        title: 'ឯកសារកិច្ចការថ្មី',
        breadcrumb: `${course?.khmer_title || course?.title || 'វគ្គសិក្សា'} > កិច្ចការ`,
        message: `Sophath បានបញ្ចូលឯកសារ "${data.fileName}" លើកិច្ចការ "${task?.title || 'កិច្ចការ'}"`,
        sender_name: 'Sophath',
        avatar_url: '/e20220628.jpg',
        course_id: course?.id,
        course_title: course?.title,
        target_url: course ? `/trainee/programs/${course.id}/learning?tab=Homework` : '/trainee/programs',
        for_role: 'admin',
      });
    } catch (err) {
      this.logger.warn(`Failed to dispatch attachment notification: ${err}`);
    }

    return {
      attachment: {
        id: savedAttachment.id,
        fileName: savedAttachment.fileName,
        fileUrl: savedAttachment.fileUrl,
        fileSize: savedAttachment.fileSize ? Number(savedAttachment.fileSize) : undefined,
        uploadedAt: savedAttachment.uploadedAt.toISOString(),
      },
      message: {
        id: savedChat.id,
        senderName: savedChat.senderName,
        sender: 'student',
        text: savedChat.text,
        sentAt: savedChat.sentAt.toISOString(),
      },
    };
  }

  async deleteSubmissionAttachment(attachmentId: number) {
    if (!attachmentId || isNaN(attachmentId)) {
      return { success: true, id: attachmentId };
    }

    const attachment = await this.attachmentRepo.findOne({
      where: { id: attachmentId },
      relations: { submission: true },
    });

    if (!attachment) {
      // Idempotent delete: if already removed from DB, return success
      return { success: true, id: attachmentId, message: 'Already deleted or not found' };
    }

    await this.attachmentRepo.remove(attachment);
    return { success: true, id: attachmentId };
  }

  async updateSubmissionStatus(
    taskId: number,
    status: string,
    userId: string = '00000000-0000-0000-0000-000000000001',
    senderName?: string,
    senderRole?: string,
  ) {
    const sub = await this.findOrCreateSubmission(taskId, userId);
    const validStatuses: Record<string, HomeworkStatusEnum> = {
      NOT_SUBMITTED: HomeworkStatusEnum.NOT_SUBMITTED,
      DOING: HomeworkStatusEnum.DOING,
      SUBMITTED: HomeworkStatusEnum.SUBMITTED,
      GRADED: HomeworkStatusEnum.GRADED,
      LATE: HomeworkStatusEnum.LATE,
    };

    const targetStatus = validStatuses[status] || HomeworkStatusEnum.SUBMITTED;
    sub.status = targetStatus;
    if (targetStatus === HomeworkStatusEnum.SUBMITTED && !sub.submittedAt) {
      sub.submittedAt = new Date();
    }
    await this.submissionRepo.save(sub);

    const khmerLabels: Record<string, string> = {
      DOING: 'កំពុងធ្វើ',
      SUBMITTED: 'ស្នើពិនិត្យ',
      NOT_SUBMITTED: 'កិច្ចការថ្មី',
      GRADED: 'បញ្ចប់',
      LATE: 'យឺតយ៉ាវ',
    };
    const statusKhmer = khmerLabels[targetStatus] || targetStatus;
    const isInstructor = senderRole === 'admin' || senderRole === 'instructor';
    const actorName = senderName || (isInstructor ? 'ខូច គឿន' : 'Sophath');

    // 1. Record status change in chat_messages so it appears in the chat
    try {
      const chatMsg = this.chatRepo.create({
        submission: sub,
        senderName: actorName,
        sender: isInstructor ? ChatSenderEnum.INSTRUCTOR : ChatSenderEnum.STUDENT,
        text: `[SYSTEM_STATUS]:${targetStatus}:${statusKhmer}`,
      });
      await this.chatRepo.save(chatMsg);
    } catch (err) {
      this.logger.warn(`Failed to save chat status message: ${err}`);
    }

    // 2. Notify corresponding role
    try {
      const task = await this.homeworkTaskRepo.findOne({
        where: { id: taskId },
        relations: { homework: { course: true } },
      });
      const course = task?.homework?.course;
      const targetUrl = course
        ? `/trainee/programs/${course.id}/learning?taskId=${taskId}`
        : `/trainee/programs?taskId=${taskId}`;

      if (targetStatus === HomeworkStatusEnum.SUBMITTED) {
        await this.notifService.create({
          type: 'HOMEWORK_SUBMITTED',
          title: 'សំណើពិនិត្យកិច្ចការ',
          breadcrumb: `${course?.khmer_title || course?.title || 'វគ្គសិក្សា'} > កិច្ចការ`,
          message: `${actorName} បានស្នើពិនិត្យកិច្ចការ "${task?.title || 'កិច្ចការ'}"`,
          sender_name: actorName,
          avatar_url: '/e20220628.jpg',
          course_id: course?.id,
          course_title: course?.title,
          target_url: targetUrl,
          for_role: 'admin',
        });
      } else if (targetStatus === HomeworkStatusEnum.GRADED) {
        await this.notifService.create({
          type: 'HOMEWORK_REVIEWED',
          title: 'កិច្ចការត្រូវបានបញ្ចប់',
          breadcrumb: `${course?.khmer_title || course?.title || 'វគ្គសិក្សា'} > កិច្ចការ`,
          message: `ខូច គឿន បានពិនិត្យនិងបញ្ចប់កិច្ចការ "${task?.title || 'កិច្ចការ'}" របស់អ្នក`,
          sender_name: 'ខូច គឿន',
          avatar_url: '/e20220628.jpg',
          course_id: course?.id,
          course_title: course?.title,
          target_url: targetUrl,
          for_role: 'user',
        });
      } else {
        // Any other status change by student (DOING, NOT_SUBMITTED, etc.) -> notify admin
        await this.notifService.create({
          type: 'HOMEWORK_STATUS_UPDATE',
          title: 'បច្ចុប្បន្នភាពកិច្ចការ',
          breadcrumb: `${course?.khmer_title || course?.title || 'វគ្គសិក្សា'} > កិច្ចការ`,
          message: `${actorName} បានផ្លាស់ប្តូរស្ថានភាពកិច្ចការ "${task?.title || 'កិច្ចការ'}" ទៅជា "${statusKhmer}"`,
          sender_name: actorName,
          avatar_url: '/e20220628.jpg',
          course_id: course?.id,
          course_title: course?.title,
          target_url: targetUrl,
          for_role: 'admin',
        });
      }
    } catch (err) {
      this.logger.warn(`Failed to dispatch status notification: ${err}`);
    }

    return {
      id: sub.id,
      taskId: Number(taskId),
      status: sub.status,
      submittedAt: sub.submittedAt ? sub.submittedAt.toISOString() : null,
    };
  }

  async addTaskChatMessage(
    taskId: number,
    data: { text: string; senderName?: string; sender?: string },
    userId: string = '00000000-0000-0000-0000-000000000001'
  ) {
    const sub = await this.findOrCreateSubmission(taskId, userId);

    const chatMsg = this.chatRepo.create({
      submission: sub,
      senderName: data.senderName || 'Sophath',
      sender:
        data.sender?.toUpperCase() === 'INSTRUCTOR'
          ? ChatSenderEnum.INSTRUCTOR
          : ChatSenderEnum.STUDENT,
      text: data.text,
    });
    const savedChat = await this.chatRepo.save(chatMsg);

    // Notify other party of new chat message
    try {
      const task = await this.homeworkTaskRepo.findOne({
        where: { id: taskId },
        relations: { homework: { course: true } },
      });
      const course = task?.homework?.course;
      const isInstructor = data.sender?.toUpperCase() === 'INSTRUCTOR';

      await this.notifService.create({
        type: 'HOMEWORK_MESSAGE',
        title: isInstructor ? 'សារថ្មីពីអ្នកផ្ទៀងផ្ទាត់' : 'សារថ្មីអំពីកិច្ចការ',
        breadcrumb: `${course?.khmer_title || course?.title || 'វគ្គសិក្សា'} > ជជែក`,
        message: `${data.senderName || (isInstructor ? 'ខូច គឿន' : 'Sophath')}: "${data.text}"`,
        sender_name: data.senderName || (isInstructor ? 'ខូច គឿន' : 'Sophath'),
        avatar_url: '/e20220628.jpg',
        course_id: course?.id,
        course_title: course?.title,
        target_url: course ? `/trainee/programs/${course.id}/learning` : '/trainee/programs',
        for_role: isInstructor ? 'user' : 'admin',
      });
    } catch (err) {
      this.logger.warn(`Failed to dispatch chat message notification: ${err}`);
    }

    return {
      id: savedChat.id,
      senderName: savedChat.senderName,
      sender: savedChat.sender === ChatSenderEnum.STUDENT ? 'student' : 'instructor',
      text: savedChat.text,
      sentAt: savedChat.sentAt.toISOString(),
    };
  }
}
