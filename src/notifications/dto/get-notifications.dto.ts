// notification/dto/get-notifications.dto.ts
import { IsEnum, IsNumberString, IsOptional } from 'class-validator';

export enum TargetType {
  STORE = 'store',
  USER = 'user',
  ROLE = 'role',
  ALL = 'all',
}

export class GetNotificationsDto {
  @IsEnum(TargetType)
  target_type!: TargetType;

  @IsOptional()
  @IsNumberString()
  target_id?: string;

  @IsOptional()
  @IsNumberString()
  user_id?: string;
}