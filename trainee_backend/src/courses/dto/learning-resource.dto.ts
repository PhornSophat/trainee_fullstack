import { Expose } from 'class-transformer';

export class LearningResourceDto {
  @Expose()
  id!: number;

  @Expose()
  title!: string;

  @Expose()
  url?: string;

  @Expose()
  icon!: string;

  @Expose()
  position!: number;
}
