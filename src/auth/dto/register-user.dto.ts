import { IsNotEmpty, IsString } from "class-validator";

export class RegisterUserDto {
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsNotEmpty()
    @IsString()
    identifier: string;

    @IsNotEmpty()
    @IsString()
    password: string;
}