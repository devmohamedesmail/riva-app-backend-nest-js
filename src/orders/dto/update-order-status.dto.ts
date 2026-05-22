import {
  IsIn,
  IsString,
} from 'class-validator';

export class UpdateOrderStatusDto {
  @IsString()
  @IsIn([
    'pending',
    'accepted',
    'preparing',
    'on_the_way',
    'delivered',
    'cancelled',
  ])
  status!: string;
}