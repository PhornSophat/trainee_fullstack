import { IsNumber, IsOptional, IsString, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class KeyLessonItemDto {
  @IsOptional()
  id?: any;

  @IsOptional()
  position?: any;

  @IsOptional()
  @IsString()
  code?: string;

  @IsString()
  title!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  imageUrl?: string;
}

export class TechnologyItemDto {
  @IsOptional()
  id?: any;

  @IsString()
  name!: string;

  @IsOptional()
  @IsString()
  icon?: string;
}

export class FaqItemDto {
  @IsOptional()
  id?: any;

  @IsOptional()
  position?: any;

  @IsString()
  question!: string;

  @IsOptional()
  @IsString()
  answer?: string;
}

export class LearningResourceItemDto {
  @IsOptional()
  id?: any;

  @IsOptional()
  position?: any;

  @IsString()
  title!: string;

  @IsOptional()
  @IsString()
  url?: string;

  @IsOptional()
  @IsString()
  icon?: string;
}

export class UpdateCourseDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  khmerTitle?: string;

  @IsOptional()
  @IsNumber()
  categoryId?: number;

  @IsOptional()
  @IsString()
  categoryName?: string;

  @IsOptional()
  @IsString()
  level?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  skills?: string[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => KeyLessonItemDto)
  keyLessons?: KeyLessonItemDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TechnologyItemDto)
  technologies?: TechnologyItemDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FaqItemDto)
  faqs?: FaqItemDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => LearningResourceItemDto)
  learningResources?: LearningResourceItemDto[];
}
