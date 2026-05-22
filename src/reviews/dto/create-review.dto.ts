// dto/create-review.dto.ts

import {
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

export class CreateReviewDto {
  @IsInt()
  @IsNotEmpty()
  user_id!: number;

  @IsInt()
  @IsNotEmpty()
  store_id!: number;

  @IsNumber()
  @Min(1)
  @Max(5)
  rating!: number;

  @IsOptional()
  @IsString()
  comment?: string;
}