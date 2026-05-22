import { IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdateDeliveryLocationDto {
  @IsOptional()
  @IsNumber()
  latitude?: number;

  @IsOptional()
  @IsNumber()
  longitude?: number;

  @IsOptional()
  @IsString()
  address?: string;
}