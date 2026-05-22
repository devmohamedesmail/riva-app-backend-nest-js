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

export class UpdatePlaceDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsNumber()
  @Min(-90)
  @Max(90)
  latitude?: number;

  @IsOptional()
  @IsNumber()
  @Min(-180)
  @Max(180)
  longitude?: number;

  @IsOptional()
  @IsArray()
  @ArrayMinSize(1)
  @IsInt({ each: true })
  store_type_ids?: number[];
}