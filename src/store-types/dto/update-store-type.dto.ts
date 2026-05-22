import {
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
} from 'class-validator';

export class UpdateStoreTypeDto {
  @IsOptional()
  @IsString()
  @MaxLength(255)
  name_en?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  name_ar?: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;

  @IsOptional()
  @IsUrl()
  image?: string;
}