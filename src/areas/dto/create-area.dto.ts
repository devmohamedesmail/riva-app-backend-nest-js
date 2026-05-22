import {
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateAreaDto {
  @IsString()
  name!: string;

  @IsOptional()
  @IsString()
  area_code?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsNumber()
  price!: number;

  @IsInt()
  place_id!: number;
}