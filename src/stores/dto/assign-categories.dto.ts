import {
  ArrayNotEmpty,
  IsArray,
  IsInt,
} from 'class-validator';
import { Type } from 'class-transformer';

export class AssignCategoriesDto {
  @IsArray()
  @ArrayNotEmpty()
  @Type(() => Number)
  @IsInt({ each: true })
  category_ids!: number[];
}