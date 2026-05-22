import { IsString, IsOptional } from 'class-validator';

export class RegisterDeviceDto {
    @IsString()
    pushToken!: string;

    @IsOptional()
    @IsString()
    platform?: string;

    @IsOptional()
    @IsString()
    deviceId?: string;
}