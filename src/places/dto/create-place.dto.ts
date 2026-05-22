import {
    IsString,
    IsOptional,
    IsNumber,
    IsArray,
    ArrayMinSize,
    IsInt,
    Min,
    Max,
} from 'class-validator';

export class CreatePlaceDto {
    @IsString()
    name!: string;

    @IsOptional()
    @IsString()
    address?: string;

    @IsNumber()
    @Min(-90)
    @Max(90)
    latitude?: number;

    @IsNumber()
    @Min(-180)
    @Max(180)
    longitude?: number;

    @IsArray()
    @ArrayMinSize(1)
    @IsInt({ each: true })
    store_type_ids!: number[];
}