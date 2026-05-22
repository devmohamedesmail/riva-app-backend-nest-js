import {
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
} from 'class-validator';

export class CreateStoreTypeDto {
  @IsString()
  @MaxLength(255)
  name_en!: string;

  @IsString()
  @MaxLength(255)
  name_ar!: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;

  @IsOptional()
  @IsUrl()
  image?: string;
}