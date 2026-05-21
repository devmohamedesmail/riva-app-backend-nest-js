import {
  IsEmail,
  IsOptional,
  IsString,
  Length,
  MinLength,
} from 'class-validator';

export class LoginUserDto {
  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  @Length(11, 11)
  phone?: string;

  @IsString()
  @MinLength(6)
  password?: string;
}