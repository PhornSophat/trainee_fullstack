import { Expose, Transform, Type } from 'class-transformer';

export class LessonDocumentDto {
  @Expose() id!: number | string;
  @Expose() lessonId?: number | string;
  @Expose() title!: string;
  @Expose() fileUrl!: string;
  @Expose() fileType?: string;
  @Expose() fileSize?: string;
  @Expose() createdAt?: Date;
}

export class LessonDto {
  @Expose() id!: number | string;
  @Expose() title!: string;

  @Expose()
  @Transform(({ value }) => value)
  duration!: string;

  @Expose()
  @Transform(({ value }) => value)
  type!: string;

  @Expose()
  @Transform(({ value }) => value)
  progressPercentage!: number;

  @Expose()
  @Transform(({ value }) => value)
  lastPositionSeconds?: number;

  @Expose()
  @Transform(({ value }) => value)
  videoUrl!: string;

  @Expose()
  @Transform(({ value }) => value)
  playbackId!: string; // mux_playback_id

  @Expose()
  @Transform(({ value }) => value)
  description?: string;

  @Expose()
  @Type(() => LessonDocumentDto)
  documents?: LessonDocumentDto[];
}

