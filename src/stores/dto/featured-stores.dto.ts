import { IsInt } from 'class-validator';
import { Type } from 'class-transformer';

export class FeaturedStoresDto {
  @Type(() => Number)
  @IsInt()
  place_id!: number;
}