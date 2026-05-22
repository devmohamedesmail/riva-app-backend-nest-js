import {
    IsArray,
    IsInt,
    IsNumber,
    IsOptional,
    IsPositive,
    IsString,
    MaxLength,
    MinLength,
    ValidateNested,
} from 'class-validator';

import { Type } from 'class-transformer';

class ProductValueDto {
    @IsInt()
    attribute_id!: number;

    @IsString()
    value!: string;

    @IsOptional()
    @IsNumber()
    @IsPositive()
    price?: number;
}

export class CreateProductDto {
    @IsInt()
    store_id!: number;

    @IsInt()
    category_id!: number;

    @IsString()
    @MinLength(3)
    @MaxLength(100)
    name!: string;

    @IsOptional()
    @IsNumber()
    @IsPositive()
    price?: number;

    @IsOptional()
    @IsNumber()
    @IsPositive()
    sale_price?: number;

    @IsOptional()
    @IsString()
    description?: string;

    @IsOptional()
    @IsArray()
    attributes?: number[];

    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => ProductValueDto)
    values?: ProductValueDto[];

    @IsOptional()
    @IsString()
    product_type?: string;
}