import { Expose, Type } from 'class-transformer';
import { LessonDto } from './lesson.dto';

export class ChapterDto {
  @Expose() id!: number | string;
  @Expose() title!: string;

  @Expose()
  @Type(() => LessonDto)
  lessons!: LessonDto[];
}
