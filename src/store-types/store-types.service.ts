import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreateStoreTypeDto } from './dto/create-store-type.dto';
import { UpdateStoreTypeDto } from './dto/update-store-type.dto';

@Injectable()
export class StoreTypesService {
  constructor(
    private prisma: PrismaService,
    private cloudinary: CloudinaryService,
  ) { }



  async findAll() {
    const storeTypes = await this.prisma.storeType.findMany({
      orderBy: {
        name_en: 'asc',
      },
    });

    return {
      success: true,
      data: storeTypes,
    };
  }

  async findOne(id: number) {
    const storeType = await this.prisma.storeType.findUnique({
      where: { id },
    });

    if (!storeType) {
      throw new NotFoundException('Store type not found');
    }

    return {
      success: true,
      data: storeType,
    };
  }


  async create(
    dto: CreateStoreTypeDto,
    file?: Express.Multer.File,
  ) {
    let imageUrl = dto.image;

    if (file) {
      const uploadResult: any =
        await this.cloudinary.uploadImage(file);

      imageUrl = uploadResult.secure_url;
    }

    try {
      const storeType =
        await this.prisma.storeType.create({
          data: {
            name_en: dto.name_en,
            name_ar: dto.name_ar,
            description: dto.description,
            image: imageUrl,
          },
        });

      return {
        success: true,
        data: storeType,
      };
    } catch (error: any) {
      if (error.code === 'P2002') {
        throw new ConflictException(
          'Store type already exists',
        );
      }

      throw error;
    }
  }

  async update(
    id: number,
    dto: UpdateStoreTypeDto,
    file?: Express.Multer.File,
  ) {
    const storeType =
      await this.prisma.storeType.findUnique({
        where: { id },
      });

    if (!storeType) {
      throw new NotFoundException(
        'Store type not found',
      );
    }

    let imageUrl = storeType.image;

    if (file) {
      const uploadResult: any =
        await this.cloudinary.uploadImage(file);

      imageUrl = uploadResult.secure_url;
    }

    const updated =
      await this.prisma.storeType.update({
        where: { id },
        data: {
          name_en:
            dto.name_en ?? storeType.name_en,

          name_ar:
            dto.name_ar ?? storeType.name_ar,

          description:
            dto.description ??
            storeType.description,

          image: imageUrl,
        },
      });

    return {
      success: true,
      data: updated,
    };
  }



  async remove(id: number) {
    const storeType =
      await this.prisma.storeType.findUnique({
        where: { id },
      });

    if (!storeType) {
      throw new NotFoundException(
        'Store type not found',
      );
    }

    const storesCount =
      await this.prisma.store.count({
        where: {
          store_type_id: id,
        },
      });

    if (storesCount > 0) {
      throw new BadRequestException(
        `Cannot delete store type. ${storesCount} store(s) are using this type.`,
      );
    }

    await this.prisma.storeType.delete({
      where: { id },
    });

    return {
      success: true,
    };
  }


  async getStores(
    place_id: number,
    store_type_id: number,
  ) {
    const relationExists =
      await this.prisma.placeStoreType.findFirst({
        where: {
          place_id,
          store_type_id,
        },
      });

    if (!relationExists) {
      throw new NotFoundException(
        'This store type does not belong to this place',
      );
    }

    const stores = await this.prisma.store.findMany({
      where: {
        place_id,
        store_type_id,
        is_active: true,
      },

      orderBy: {
        createdAt: 'desc',
      },
    });

    const ratings =
      await this.prisma.review.groupBy({
        by: ['store_id'],
        _count: {
          _all: true,
        },
        _avg: {
          rating: true,
        },
      });

    const formattedStores = stores.map(
      (store) => {
        const rating = ratings.find(
          (r) => r.store_id === store.id,
        );

        return {
          ...store,
          total_reviews:
            rating?._count._all ?? 0,

          avg_rating: rating?._avg.rating
            ? Number(
              rating._avg.rating.toFixed(1),
            )
            : 0,
        };
      },
    );

    return {
      success: true,
      data: formattedStores,
    };
  }



  async getStoreTypesByPlaceId(placeId: number) {
    const storeTypes = await this.prisma.storeType.findMany({
      where: {
        places: {
          some: { place_id: placeId },
        },
      },
    });

    return {
      success: true,
      data: storeTypes,
    }
  }



}
