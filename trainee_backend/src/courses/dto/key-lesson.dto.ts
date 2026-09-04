import { Expose } from 'class-transformer';

export class KeyLessonDto {
  @Expose() code!: string | null;
  @Expose() title!: string;
  @Expose() description!: string;
}
