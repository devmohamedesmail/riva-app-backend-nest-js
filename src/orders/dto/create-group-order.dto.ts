// dto/create-group-order.dto.ts

import {
  IsArray,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
  Min,
} from 'class-validator';

import { Type } from 'class-transformer';

class SelectedAttributeDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  value?: string;

  @IsOptional()
  @IsNumber()
  price?: number;
}

class OrderItemDto {
  @IsString()
  name?: string;

  @IsString()
  image?: string;

  @IsNumber()
  @Min(0)
  price?: number;

  @IsNumber()
  @Min(1)
  quantity?: number;

  @IsOptional()
  @ValidateNested()
  @Type(() => SelectedAttributeDto)
  selectedAttribute?: SelectedAttributeDto;
}

class StoreOrderDto {
  @IsNumber()
  store_id!: number;

  @IsNumber()
  @Min(0)
  total_price?: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items?: OrderItemDto[];
}

export class CreateGroupOrderDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => StoreOrderDto)
  stores!: StoreOrderDto[];

  @IsString()
  customer_name!: string;

  @IsString()
  phone?: string;

  @IsString()
  delivery_address?: string;

  @IsOptional()
  @IsNumber()
  area_id?: number;

  @IsOptional()
  @IsString()
  area_name?: string;

  @IsNumber()
  user_id!: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  delivery_fee?: number;
}