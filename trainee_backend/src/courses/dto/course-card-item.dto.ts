/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import { Expose, Transform, Type } from 'class-transformer';
import { InstructorDto } from './instructor.dto';
import { TechnologyDto } from './technology.dto';
import { KeyLessonDto } from './key-lesson.dto';
import { FaqDto } from './faq.dto';

export class CourseCardItemDto {
  @Expose() id!: number;
  @Expose() title!: string;

  @Expose({ name: 'khmer_title' })
  khmerTitle!: string;

  @Expose()
  @Transform(({ value }) => value)
  description!: string;

  @Expose({ name: 'image_url' })
  imageUrl!: string;

  @Expose()
  @Transform(({ value }) => value)
  level!: string;

  @Expose()
  @Transform(({ value }) => value)
  duration!: string;

  @Expose({ name: 'approval_status' })
  approvalStatus!: string;

  @Expose({ name: 'created_at' })
  createdAt!: Date;

  @Expose()
  @Type(() => InstructorDto)
  instructor!: InstructorDto[];

  @Expose()
  @Transform(({ value }) => (value ?? []).map((s: any) => s.text))
  skills!: string[];

  @Expose()
  @Type(() => KeyLessonDto)
  keyLessons!: KeyLessonDto[];

  @Expose()
  @Type(() => TechnologyDto)
  technologies!: TechnologyDto[];

  @Expose()
  @Type(() => FaqDto)
  faqs!: FaqDto[];

  @Expose() rating!: number;
  @Expose() reviewCount!: number;
  @Expose() lessons!: number;
  @Expose() tasks!: number;
  @Expose() quizzes!: number;
  @Expose() totalEnrollments!: number;
  @Expose() totalCompletions!: number;
  @Expose() totalLikes!: number;
  @Expose() totalDislikes!: number;
  @Expose() isFavorite: boolean = false;
}
