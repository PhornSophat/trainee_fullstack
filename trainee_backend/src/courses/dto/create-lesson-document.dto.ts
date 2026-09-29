import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateLessonDocumentDto {
  @IsString()
  @IsNotEmpty()
  title!: string;

  @IsString()
  @IsNotEmpty()
  fileUrl!: string;

  @IsOptional()
  @IsString()
  fileType?: string;

  @IsOptional()
  @IsString()
  fileSize?: string;
}
