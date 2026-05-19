import { IsOptional, IsString } from "class-validator";

export class UpdateRoleDto {
    @IsString()
    name: string;

    @IsString()
    description:string

    @IsOptional()
    slug:string
}