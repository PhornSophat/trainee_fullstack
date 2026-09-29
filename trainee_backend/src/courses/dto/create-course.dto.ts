import { IsNotEmpty, IsOptional, IsString, IsNumber } from "class-validator";

export class CreateCourseDto {
    @IsNotEmpty({ message: "Name in Latin is required!" })
    @IsString()
    title!: string;

    @IsNotEmpty({ message: "Name in Khmer is required!"})
    @IsString()
    khmerTitle!: string;

    @IsOptional()
    @IsNumber()
    categoryId?: number

    @IsOptional()
    @IsString()
    level?: string;

    @IsOptional()
    @IsString()
    description?: string;

    @IsOptional()
    @IsString()
    imageUrl?: string;

    @IsOptional()
    @IsNumber()
    duration?: number;

}