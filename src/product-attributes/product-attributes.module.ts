import { Module } from '@nestjs/common';
import { ProductAttributesService } from './product-attributes.service';
import { ProductAttributesController } from './product-attributes.controller';

@Module({
  providers: [ProductAttributesService],
  controllers: [ProductAttributesController]
})
export class ProductAttributesModule {}
