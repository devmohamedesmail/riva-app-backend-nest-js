import { IsString, IsOptional, IsBoolean, MaxLength } from 'class-validator';

export class CreateBannerDto {
  @IsString()
  @MaxLength(255)
  title!: string;

  @IsString()
  @MaxLength(255)
  slug?: string;

  @IsString()
  @MaxLength(2000)
  content?: string;

  @IsOptional()
  @IsBoolean()
  is_published?: boolean;

  @IsOptional()
  @IsString()
  link?: string;
}