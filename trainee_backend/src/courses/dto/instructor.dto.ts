import { Expose } from 'class-transformer';

export class InstructorDto {
  @Expose() id!: number;
  @Expose() name!: string;
  @Expose() avatarUrl!: string | null;
}
