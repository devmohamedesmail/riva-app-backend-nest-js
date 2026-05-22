import { BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException, } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';

@Injectable()
export class ReviewsService {

    constructor(private prisma: PrismaService) {}


    /**
   * Get All Reviews
   */
  async findAll() {
    try {
      const reviews = await this.prisma.review.findMany({
        orderBy: { createdAt: 'desc' },
      });

      return {
        success: true,
        data: reviews,
      };
    } catch (error: any) {
      throw new InternalServerErrorException(error.message);
    }
  }

  /**
   * Create Review
   */
  async create(dto: CreateReviewDto) {
    try {
      const { user_id, store_id, rating, comment } = dto;

      if (!user_id || !rating) {
        throw new BadRequestException(
          'User ID and rating are required',
        );
      }

      if (!store_id) {
        throw new BadRequestException('store_id is required');
      }

      if (rating < 1 || rating > 5) {
        throw new BadRequestException(
          'Rating must be between 1 and 5',
        );
      }

      const user = await this.prisma.user.findUnique({
        where: { id: user_id },
      });

      if (!user) {
        throw new NotFoundException('User not found');
      }

      const store = await this.prisma.store.findUnique({
        where: { id: store_id },
      });

      if (!store) {
        throw new NotFoundException('Store not found');
      }

      const existingReview = await this.prisma.review.findFirst({
        where: { user_id, store_id },
      });

      if (existingReview) {
        throw new BadRequestException(
          'You have already reviewed this store',
        );
      }

      const review = await this.prisma.review.create({
        data: {
          user_id,
          store_id,
          rating,
          comment,
        },
      });

      return {
        success: true,
        data: review,
      };
    } catch (error: any) {
      throw error;
    }
  }

  /**
   * Find Review By ID
   */
  async findOne(id: number) {
    try {
      const review = await this.prisma.review.findUnique({
        where: { id },
      });

      if (!review) {
        throw new NotFoundException('Review not found');
      }

      return {
        success: true,
        data: review,
      };
    } catch (error: any) {
      throw error;
    }
  }

  /**
   * Update Review
   */
  async update(id: number, dto: UpdateReviewDto) {
    try {
      const { rating, comment } = dto;

      if (rating && (rating < 1 || rating > 5)) {
        throw new BadRequestException(
          'Rating must be between 1 and 5',
        );
      }

      const review = await this.prisma.review.findUnique({
        where: { id },
      });

      if (!review) {
        throw new NotFoundException('Review not found');
      }

      const updatedReview = await this.prisma.review.update({
        where: { id },
        data: {
          rating: rating ?? review.rating,
          comment: comment ?? review.comment,
        },
      });

      return {
        success: true,
        data: updatedReview,
      };
    } catch (error: any) {
      throw error;
    }
  }

  /**
   * Delete Review
   */
  async remove(id: number) {
    try {
      await this.prisma.review.delete({
        where: { id },
      });

      return {
        success: true,
      };
    } catch (error: any) {
      throw new InternalServerErrorException(error.message);
    }
  }

  /**
   * Get Reviews By Store
   */
  async getByStore(store_id: number) {
    try {
      const store = await this.prisma.store.findUnique({
        where: { id: store_id },
      });

      if (!store) {
        throw new NotFoundException('Store not found');
      }

      const reviews = await this.prisma.review.findMany({
        where: { store_id },
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              name: true,
              email: true,
              phone: true,
              avatar: true,
            },
          },
        },
      });

      return {
        success: true,
        data: reviews,
      };
    } catch (error: any) {
      throw error;
    }
  }

  /**
   * Get Reviews By User
   */
  async getByUser(user_id: number) {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id: user_id },
      });

      if (!user) {
        throw new NotFoundException('User not found');
      }

      const reviews = await this.prisma.review.findMany({
        where: { user_id },
        orderBy: { createdAt: 'desc' },
      });

      return {
        success: true,
        data: reviews,
      };
    } catch (error: any) {
      throw error;
    }
  }
}
