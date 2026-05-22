import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  UploadedFile,
  UseInterceptors,
  UseGuards
} from '@nestjs/common';

import { FileInterceptor } from '@nestjs/platform-express';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { JwtAuthGuard } from '../auth/jwt/jwt.guard';

@Controller('/api/v1/products')
export class ProductsController {
  constructor(
    private readonly service: ProductsService,
  ) { }



  /**
   * Get all
   */
  @Get()
  findAll(
    @Query('page') page = 1,
    @Query('limit') limit = 10,
  ) {
    return this.service.findAll(
      Number(page),
      Number(limit),
    );
  }

  /**
   * Create New Product
   */
  @UseGuards(JwtAuthGuard)
  @Post()
  @UseInterceptors(
    FileInterceptor('image'),
  )
  create(
    @Body()
    dto: CreateProductDto,

    @UploadedFile()
    file?: Express.Multer.File,
  ) {
    return this.service.create(dto, file);
  }

  /**
   * Find one
   */
  @Get('item/:id')
  findOne(
    @Param('id', ParseIntPipe)
    id: number,
  ) {
    return this.service.findOne(id);
  }

  /**
   * Update
   */
  @UseGuards(JwtAuthGuard)
  @Put(':id')
  @UseInterceptors(
    FileInterceptor('image'),
  )
  update(
    @Param('id', ParseIntPipe)
    id: number,

    @Body()
    dto: UpdateProductDto,

    @UploadedFile()
    file?: Express.Multer.File,
  ) {
    return this.service.update(
      id,
      dto,
      file,
    );
  }

  /**
   * Delete
   */
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(
    @Param('id', ParseIntPipe)
    id: number,
  ) {
    return this.service.remove(id);
  }

  /**
   * By category
   */
  @Get('categories/:category_id')
  getByCategory(
    @Param(
      'category_id',
      ParseIntPipe,
    )
    category_id: number,
  ) {
    return this.service.getByCategory(
      category_id,
    );
  }

  /**
   * Sale products
   */
  @Get('sale/products')
  saleProducts(
    @Query('page') page = 1,
    @Query('limit') limit = 10,
    @Query('place_id')
    place_id?: string,
  ) {
    return this.service.saleProducts(
      Number(page),
      Number(limit),
      place_id
        ? Number(place_id)
        : undefined,
    );
  }

  /**
   * Search
   */
  @Get('search/products')
  searchProducts(
    @Query('q') q: string,

    @Query('page') page = 1,

    @Query('limit') limit = 10,

    @Query('place_id')
    place_id?: string,
  ) {
    return this.service.searchProducts(
      q,
      Number(page),
      Number(limit),
      place_id
        ? Number(place_id)
        : undefined,
    );
  }
}
