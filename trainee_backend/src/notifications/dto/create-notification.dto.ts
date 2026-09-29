import { IsBoolean, IsInt, IsOptional, IsString } from 'class-validator';

export class CreateNotificationDto {
  @IsString()
  title!: string;

  @IsString()
  message!: string;

  @IsOptional()
  @IsString()
  type?: string;

  @IsOptional()
  @IsString()
  breadcrumb?: string;

  @IsOptional()
  @IsString()
  sender_name?: string;

  @IsOptional()
  @IsString()
  avatar_url?: string;

  @IsOptional()
  @IsBoolean()
  read?: boolean;

  @IsOptional()
  @IsString()
  target_url?: string;

  @IsOptional()
  @IsInt()
  course_id?: number;

  @IsOptional()
  @IsString()
  course_title?: string;

  @IsOptional()
  @IsString()
  for_role?: string;
}
