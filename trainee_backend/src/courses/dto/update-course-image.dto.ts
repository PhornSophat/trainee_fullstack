import { IsNotEmpty, IsUrl } from 'class-validator';

export class UpdateCourseImageDto {
    @IsNotEmpty()
    @IsUrl()
    imageUrl: string;
}