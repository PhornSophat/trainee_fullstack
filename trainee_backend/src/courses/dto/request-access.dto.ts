import { IsOptional, IsString } from 'class-validator';

export class RequestAccessDto {
  @IsOptional()
  @IsString()
  userId?: string;
}

