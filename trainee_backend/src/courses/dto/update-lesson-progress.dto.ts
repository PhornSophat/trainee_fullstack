import { IsNumber, Min, Max } from 'class-validator';

export class UpdateLessonProgressDto {
  @IsNumber()
  @Min(0, { message: 'Progress percentage must be at least 0' })
  @Max(100, { message: 'Progress percentage must not exceed 100' })
  progressPercentage: number;
}
