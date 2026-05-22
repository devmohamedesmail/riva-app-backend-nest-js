import { IsNumber } from 'class-validator';

export class MarkAsReadDto {
  @IsNumber()
  user_id!: number;
}