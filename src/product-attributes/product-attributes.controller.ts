import { Body, Controller, Get, Post,UseGuards } from '@nestjs/common';
import { ProductAttributesService } from './product-attributes.service';
import { CreateAttributeDto } from './dto/create-attribute.dto';
import { JwtAuthGuard } from '../auth/jwt/jwt.guard';

@Controller('/api/v1/product-attributes')
export class ProductAttributesController {
constructor(private readonly attributeService: ProductAttributesService) {}

     /**
   * Create Attribute
   */
    @UseGuards(JwtAuthGuard)
  @Post('create')
  create(@Body() dto: CreateAttributeDto) {
    return this.attributeService.create(dto);
  }

  /**
   * Get All Attributes
   */
  @Get()
  findAll() {
    return this.attributeService.findAll();
  }
}
