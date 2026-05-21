import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Length,
  MinLength,
} from 'class-validator';
import { Type } from 'class-transformer';
import { AuthMethod } from '../../generated/prisma/enums';

export class RegisterUserDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  name?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  @Length(11, 11)
  phone?: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(6)
  password?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  role_id?: number;

  @IsOptional()
  @IsEnum(AuthMethod)
  auth_method?: AuthMethod;

  @IsOptional()
  @IsString()
  referred_by_code?: string;
}