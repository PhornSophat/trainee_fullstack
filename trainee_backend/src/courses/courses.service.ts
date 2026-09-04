/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Course } from './entities/course.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Chapter } from './entities/chapter.entity';
import { CourseCardItemDto } from './dto/course-card-item.dto';
import { plainToInstance } from 'class-transformer';
import { ChapterDto } from './dto/chapter.dto';

@Injectable()
export class CoursesService {
  private cache: { data: CourseCardItemDto[]; ts: number } | null = null;

  constructor(
    @InjectRepository(Course) private courseRepo: Repository<Course>,
    @InjectRepository(Chapter) private chapterRepo: Repository<Chapter>,
  ) {}

  async findAll(): Promise<CourseCardItemDto[]> {
    // Fix A: return cached data if it's still fresh (<30s)
    if (this.cache && Date.now() - this.cache.ts < 30_000) {
      return this.cache.data;
    }

    // Fix B: one query instead of N+1 (relations fired separately before)
    const rows = await this.courseRepo
      .createQueryBuilder('course')
      .leftJoinAndSelect('course.instructors', 'instructors')
      .leftJoinAndSelect('course.skills', 'skills')
      .leftJoinAndSelect('course.technologies', 'technologies')
      .leftJoinAndSelect('course.keyLessons', 'keyLessons')
      .leftJoinAndSelect('course.faqs', 'faqs')
      .orderBy('course.created_at', 'DESC')
      .getMany();

    const stats = await this.getCourseStats();
    const dtos = plainToInstance(CourseCardItemDto, rows);
    for (const dto of dtos) {
      const s = stats.get(dto.id);
      if (s) Object.assign(dto, s);
    }

    this.cache = { data: dtos, ts: Date.now() };
    return dtos;
  }

  async getCurriculum(courseId: number): Promise<ChapterDto[]> {
    if (isNaN(courseId)) {
      return [];
    }
    const chapters = await this.chapterRepo
      .createQueryBuilder('chapter')
      .leftJoinAndSelect('chapter.lessons', 'lesson')
      .where('chapter.course_id = :courseId', { courseId })
      .orderBy('chapter.position', 'ASC')
      .addOrderBy('lesson.position', 'ASC')
      .getMany();

    const result: ChapterDto[] = chapters.map((chapter) => {
      const lessonDtos = chapter.lessons.map((lesson) => ({
        id: lesson.id,
        title: lesson.title,
        duration: lesson.duration || '',
        type: lesson.type,
        videoUrl: lesson.video_url || '',
        playbackId: lesson.mux_playback_id || '',
        progressPercentage: 0,
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

  async requestAccess(courseId: number, userId: string) {
    const course = await this.courseRepo.findOne({ where: { id: courseId } });

    if (!course) throw new NotFoundException('Course not found!');
    if (course.approval_status === 'APPROVED')
      return { message: 'Already approved', status: 'APPROVED' };

    course.approval_status = 'PENDING'; // Request sent, awaiting admin approval
    await this.courseRepo.save(course);
    return { message: 'Request sent', status: 'PENDING' };
  }

  async setApprovalStatus(courseId: number, status: string) {
    const allowed = ['APPROVED', 'REJECTED', 'PENDING', 'NOT_REQUESTED'];
    if (!allowed.includes(status))
      throw new BadRequestException('Invalid Status!');

    const course = await this.courseRepo.findOne({ where: { id: courseId } });
    if (!course) throw new NotFoundException('Course not found!');
    course.approval_status = status;
    await this.courseRepo.save(course);
    return { message: `Status set to ${status}`, status };
  }

  async updateCourseImage( courseId: number, imageUrl: string ) {
    const course = await this.courseRepo.findOne({ where: { id: courseId } });
    if (!course) throw new NotFoundException('Course not found!');

    course.image_url = imageUrl;
    await this.courseRepo.save(course);

    this.cache = null;

    return { message: 'Thumbnail updated successfully', imageUrl };
  }
}
