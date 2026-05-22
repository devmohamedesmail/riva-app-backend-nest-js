import { IsString } from 'class-validator';

export class RemoveDeviceDto {
    @IsString()
    pushToken!: string;
}