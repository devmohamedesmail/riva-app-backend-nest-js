import { IsNotEmpty, IsOptional, IsString, IsNumber ,IsEnum } from "class-validator";
import { AuthMethod } from "../../generated/prisma/enums";

export class RegisterUserDto {
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsOptional()
    @IsString()
    email: string;

    @IsOptional()
    @IsString()
    phone: string;

    @IsOptional()
    @IsString()
    password: string;

    @IsOptional()
    @IsNumber()
    role_id: number;

    @IsOptional()
    @IsEnum(AuthMethod)
    auth_method: AuthMethod;

    @IsOptional()
    @IsString()
    referred_by_code: string;
}