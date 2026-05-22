import { IsBoolean, IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdateVehicleDto {
  @IsString()
  plateNumber!: string;

  @IsOptional()
  @IsString()
  type?: string;

  @IsOptional()
  @IsNumber()
  area_id?: number;

  @IsOptional()
  @IsNumber()
  place_id?: number;

  @IsOptional()
  @IsString()
  model?: string;

  @IsOptional()
  @IsNumber()
  capacity?: number;

  @IsOptional()
  @IsString()
  license?: string;

  @IsOptional()
  @IsString()
  color?: string;

  @IsOptional()
  @IsString()
  insurance?: string;

  @IsOptional()
  insurance_date?: string;

  @IsOptional()
  @IsBoolean()
  is_active?: boolean;

  @IsOptional()
  @IsBoolean()
  is_verified?: boolean;

  @IsOptional()
  @IsBoolean()
  is_available?: boolean;

  @IsOptional()
  @IsString()
  image?: string;
}