import {
    IsInt,
    IsOptional,
    IsString,
    MaxLength,
    MinLength,
    IsUrl,
} from 'class-validator';

export class CreateCategoryDto {
    @IsString()
    @MinLength(2)
    @MaxLength(100)
    name!: string;

    @IsOptional()
    @IsString()
    @MaxLength(255)
    description?: string;

    @IsInt()
    store_type_id!: number;

    @IsOptional()
    @IsUrl()
    image?: string;
}