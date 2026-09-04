import { IsString, IsUUID, IsNotEmpty } from 'class-validator';

export class RequestAccessDto {
  @IsString()
  @IsUUID('4', { message: 'userId must be a valid UUID v4' })
  @IsNotEmpty()
  userId: string;
}
