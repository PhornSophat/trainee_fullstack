import { Expose, Transform } from 'class-transformer';

export class KeyLessonDto {
  @Expose() id?: number;
  @Expose() code!: string | null;
  @Expose() title!: string;
  @Expose() description!: string;
  @Expose() position?: number;

  @Expose()
  @Transform(({ obj }) => obj?.imageUrl ?? obj?.image_url ?? null)
  imageUrl?: string | null;
}
