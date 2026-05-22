// src/user/dto/create-user.dto.ts
import { IsString, MinLength, MaxLength, IsOptional, IsInt } from 'class-validator';

export class CreateUserDto {
  @IsString()
  @MinLength(3)
  @MaxLength(30)
  name?: string;

  @IsString()
  identifier?: string;

  @IsString()
  @MinLength(6)
  password?: string;

  @IsOptional()
  @IsInt()
  role_id?: number;
}