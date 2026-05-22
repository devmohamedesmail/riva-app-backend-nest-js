// src/user/dto/update-user.dto.ts
import { IsString, MinLength, MaxLength, IsOptional, IsInt } from 'class-validator';

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(30)
  name?: string;

  @IsOptional()
  @IsString()
  identifier?: string;

  @IsOptional()
  @IsString()
  @MinLength(6)
  password?: string;

  @IsOptional()
  @IsInt()
  role_id?: number;
}