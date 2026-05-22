import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoriesService {
    constructor(
        private prisma: PrismaService,
        private cloudinary: CloudinaryService,
    ) { }


    async findAll() {
        const categories =
            await this.prisma.category.findMany({
                orderBy: {
                    createdAt: 'desc',
                },
            });

        return {
            success: true,
            data: categories,
        };
    }


    /**
    * Find category
    */
    async findOne(id: number) {
        const category =
            await this.prisma.category.findUnique({
                where: { id },
            });

        if (!category) {
            throw new NotFoundException(
                'Category not found',
            );
        }

        return {
            success: true,
            data: category,
        };
    }



    /**
     * Create category
     */
    async create(
        dto: CreateCategoryDto,
        file?: Express.Multer.File,
    ) {
        const storeType =
            await this.prisma.storeType.findUnique({
                where: {
                    id: dto.store_type_id,
                },
            });

        if (!storeType) {
            throw new NotFoundException(
                'Store type not found',
            );
        }

        const existingCategory =
            await this.prisma.category.findFirst({
                where: {
                    name: dto.name,
                    store_type_id: dto.store_type_id,
                },
            });

        if (existingCategory) {
            throw new ConflictException(
                'Category already exists for this store type',
            );
        }

        let imageUrl = dto.image;

        if (file) {
            const upload: any =
                await this.cloudinary.uploadImage(
                    file,
                );

            imageUrl = upload.secure_url;
        }

        const category =
            await this.prisma.category.create({
                data: {
                    name: dto.name,
                    description: dto.description,
                    store_type_id: dto.store_type_id,
                    image: imageUrl,
                },
            });

        return {
            success: true,
            data: category,
        };
    }



    /**
     * Update category
     */
    async update(
        id: number,
        dto: UpdateCategoryDto,
        file?: Express.Multer.File,
    ) {
        const category =
            await this.prisma.category.findUnique({
                where: { id },
            });

        if (!category) {
            throw new NotFoundException(
                'Category not found',
            );
        }

        if (dto.store_type_id) {
            const storeType =
                await this.prisma.storeType.findUnique({
                    where: {
                        id: dto.store_type_id,
                    },
                });

            if (!storeType) {
                throw new NotFoundException(
                    'Store type not found',
                );
            }
        }

        if (dto.name || dto.store_type_id) {
            const existingCategory =
                await this.prisma.category.findFirst({
                    where: {
                        name:
                            dto.name ?? category.name,

                        store_type_id:
                            dto.store_type_id ??
                            category.store_type_id,

                        NOT: {
                            id,
                        },
                    },
                });

            if (existingCategory) {
                throw new ConflictException(
                    'Category already exists for this store type',
                );
            }
        }

        let imageUrl =
            dto.image ?? category.image;

        if (file) {
            const upload: any =
                await this.cloudinary.uploadImage(
                    file,
                );

            imageUrl = upload.secure_url;
        }

        const updated =
            await this.prisma.category.update({
                where: { id },

                data: {
                    name:
                        dto.name ?? category.name,

                    description:
                        dto.description ??
                        category.description,

                    store_type_id:
                        dto.store_type_id ??
                        category.store_type_id,

                    image: imageUrl,
                },
            });

        return {
            success: true,
            data: updated,
        };
    }



    /**
   * Delete category
   */
    async remove(id: number) {
        const category =
            await this.prisma.category.findUnique({
                where: { id },
            });

        if (!category) {
            throw new NotFoundException(
                'Category not found',
            );
        }

        await this.prisma.category.delete({
            where: { id },
        });

        return {
            success: true,
        };
    }


    /**
     * Get categories by store
     */
    async getByStore(store_id: number) {
        const store =
            await this.prisma.store.findUnique({
                where: { id: store_id },

                include: {
                    storeCategories: {
                        include: {
                            category: true,
                        },
                    },

                    storeType: true,
                },
            });

        if (!store) {
            throw new NotFoundException(
                'Store not found',
            );
        }

        let categories: any[] = [];

        if (
            store.storeCategories &&
            store.storeCategories.length > 0
        ) {
            categories =
                store.storeCategories.map(
                    (sc) => sc.category,
                );
        } else {
            categories =
                await this.prisma.category.findMany({
                    where: {
                        store_type_id:
                            store.storeType.id,
                    },

                    orderBy: {
                        createdAt: 'desc',
                    },
                });
        }

        return {
            success: true,
            data: categories,
        };
    }
    /**
      * Get categories by store type
      */
    async getByStoreType(
        store_type_id: number,
    ) {
        const storeType =
            await this.prisma.storeType.findUnique({
                where: {
                    id: store_type_id,
                },
            });

        if (!storeType) {
            throw new NotFoundException(
                'Store type not found',
            );
        }

        const categories =
            await this.prisma.category.findMany({
                where: {
                    store_type_id,
                },

                include: {
                    products: true,
                },

                orderBy: {
                    createdAt: 'desc',
                },
            });

        return {
            success: true,
            message:
                'Categories retrieved successfully',

            storeType: {
                id: storeType.id,
                name: storeType.name_en,
            },

            count: categories.length,

            data: categories,
        };
    }

}
