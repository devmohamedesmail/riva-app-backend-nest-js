import { IsNumber, IsOptional, IsString, MinLength } from 'class-validator';

export class UpdateAddressDto {
    @IsOptional()
    @IsNumber()
    area_id?: number;

    @IsOptional()
    @IsNumber()
    latitude?: number;

    @IsOptional()
    @IsNumber()
    longitude?: number;

    @IsOptional()
    @IsString()
    phone?: string;

    @IsString()
    @MinLength(5)
    address!: string;
}