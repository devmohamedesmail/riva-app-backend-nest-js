import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UseGuards
} from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { JwtAuthGuard } from '../auth/jwt/jwt.guard';

@Controller('/api/v1/reviews')
export class ReviewsController {
    constructor(private readonly reviewService: ReviewsService) {}


    /**
   * Get All Reviews
   */
  @Get()
  findAll() {
    return this.reviewService.findAll();
  }

  /**
   * Get Reviews By Store
   */
  @Get('store/:store_id')
  getByStore(@Param('store_id') store_id: string) {
    return this.reviewService.getByStore(Number(store_id));
  }

  /**
   * Get Reviews By User
   */
  @UseGuards(JwtAuthGuard)
  @Get('user/:user_id')
  getByUser(@Param('user_id') user_id: string) {
    return this.reviewService.getByUser(Number(user_id));
  }

  /**
   * Find Review By ID
   */
  @UseGuards(JwtAuthGuard)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.reviewService.findOne(Number(id));
  }

  /**
   * Create Review
   */
  @UseGuards(JwtAuthGuard)
  @Post('create')
  create(@Body() dto: CreateReviewDto) {
    return this.reviewService.create(dto);
  }

  /**
   * Update Review
   */
  @UseGuards(JwtAuthGuard)
  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateReviewDto,
  ) {
    return this.reviewService.update(Number(id), dto);
  }

  /**
   * Delete Review
   */
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.reviewService.remove(Number(id));
  }
}
