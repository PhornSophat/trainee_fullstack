import { IsNumber, Min, Max, IsOptional } from 'class-validator';

export class UpdateLessonProgressDto {
  @IsNumber()
  @Min(0, { message: 'Progress percentage must be at least 0' })
  @Max(100, { message: 'Progress percentage must not exceed 100' })
  progressPercentage: number;

  @IsOptional()
  @IsNumber()
  @Min(0, { message: 'Last position seconds must be at least 0' })
  lastPositionSeconds?: number;
}

