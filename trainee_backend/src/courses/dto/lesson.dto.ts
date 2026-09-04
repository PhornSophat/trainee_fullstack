/* eslint-disable @typescript-eslint/no-unsafe-return */
import { Expose, Transform } from 'class-transformer';

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
  videoUrl!: string;

  @Expose()
  @Transform(({ value }) => value)
  playbackId!: string; // mux_playback_id
}
