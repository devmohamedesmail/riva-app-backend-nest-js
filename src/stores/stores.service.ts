import {
    Injectable, BadRequestException,
    ForbiddenException,
    NotFoundException
} from '@nestjs/common';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreateStoreDto } from './dto/create-store.dto';
import { UpdateStoreDto } from './dto/update-store.dto';


@Injectable()
export class StoresService {

    constructor(
        private prisma: PrismaService,
        private cloudinary: CloudinaryService,
    ) { }



    async findAll(query: any) {
        const page = Number(query.page ?? 1);
        const limit = Number(query.limit ?? 10);

        const stores = await this.prisma.store.findMany({
            orderBy: {
                createdAt: 'desc',
            },
            include: {
                storeType: true,
                user: true,
                reviews: {
                    include: {
                        user: true,
                    },
                },
            },
            skip: (page - 1) * limit,
            take: limit,
        });

        const total = await this.prisma.store.count();

        return {
            success: true,
            data: stores,
            total,
            page,
            limit,
        };
    }


    async findOne(id: number) {
        const store = await this.prisma.store.findUnique({
            where: { id },
            include: {
                storeType: true,
                user: true,
                reviews: {
                    include: {
                        user: true,
                    },
                },
            },
        });

        if (!store) {
            throw new NotFoundException('Store not found');
        }

        return {
            success: true,
            data: store,
        };
    }

    async create(
        dto: CreateStoreDto,
        userId: number,
        files?: {
            logo?: Express.Multer.File[];
            banner?: Express.Multer.File[];
        },
    ) {
        const placeId = Number(dto.place_id);
        const storeTypeId = Number(dto.store_type_id);

        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            include: {
                role: true,
            },
        });

        if (!user) {
            throw new NotFoundException('User not found');
        }

        const allowedRoles = ['admin', 'store_owner'];

        if (!allowedRoles.includes(user.role.role)) {
            throw new ForbiddenException(
                "You don't have permission to create a store.",
            );
        }

        const storeType =
            await this.prisma.placeStoreType.findUnique({
                where: {
                    place_id_store_type_id: {
                        place_id: placeId,
                        store_type_id: storeTypeId,
                    },
                },
            });

        if (!storeType) {
            throw new BadRequestException(
                'This store type is not available in the selected place',
            );
        }

        const existingStore =
            await this.prisma.store.findUnique({
                where: {
                    user_id: userId,
                },
            });

        if (existingStore) {
            throw new BadRequestException(
                'Each user can only own one store.',
            );
        }

        let logoUrl: string | null = null;
        let bannerUrl: string | null = null;

        if (files?.logo?.[0]) {
            const uploadResult: any =
                await this.cloudinary.uploadImage(files.logo[0]);

            logoUrl = uploadResult.secure_url;
        }

        if (files?.banner?.[0]) {
            const uploadResult: any =
                await this.cloudinary.uploadImage(files.banner[0]);

            bannerUrl = uploadResult.secure_url;
        }

        try {
            if (files?.logo?.[0]) {
                const uploadResult: any =
                    await this.cloudinary.uploadImage(
                        files.logo[0],
                    );

                logoUrl = uploadResult.secure_url;
            }

            if (files?.banner?.[0]) {
                const uploadResult: any =
                    await this.cloudinary.uploadImage(
                        files.banner[0],
                    );

                bannerUrl = uploadResult.secure_url;
            }
        } catch (error) {
            throw new BadRequestException(
                'Failed to upload images',
            );
        }

        const store = await this.prisma.store.create({
            data: {
                name: dto.name,
                logo: logoUrl,
                banner: bannerUrl,
                address: dto.address,
                phone: dto.phone,
                start_time: dto.start_time,
                end_time: dto.end_time,
                user_id: userId,
                store_type_id: storeTypeId,
                place_id: placeId,
                latitude: dto.latitude,
                longitude: dto.longitude,
            },
        });

        return {
            success: true,
            data: store,
        };
    }


    async update(
        id: number,
        dto: UpdateStoreDto,
        userId: number,
        files?: {
            logo?: Express.Multer.File[];
            banner?: Express.Multer.File[];
        },
    ) {
        const store = await this.prisma.store.findUnique({
            where: { id },
        });

        if (!store) {
            throw new NotFoundException('Store not found');
        }

        const updatingUser = await this.prisma.user.findUnique({
            where: { id: userId },
            include: {
                role: true,
            },
        });

        if (!updatingUser) {
            throw new NotFoundException('User not found');
        }

        const allowedRoles = ['admin', 'store_owner'];

        if (!allowedRoles.includes(updatingUser.role.role)) {
            throw new ForbiddenException(
                "You don't have permission to update this store",
            );
        }

        let logoUrl = store.logo;
        let bannerUrl = store.banner;

        try {
            if (files?.logo?.[0]) {
                const uploadResult: any =
                    await this.cloudinary.uploadImage(
                        files.logo[0],
                    );

                logoUrl = uploadResult.secure_url;
            }

            if (files?.banner?.[0]) {
                const uploadResult: any =
                    await this.cloudinary.uploadImage(
                        files.banner[0],
                    );

                bannerUrl = uploadResult.secure_url;
            }
        } catch (error) {
            throw new BadRequestException(
                'Failed to upload images',
            );
        }

        const updatedStore = await this.prisma.store.update({
            where: { id },
            data: {
                name: dto.name ?? store.name,
                logo: logoUrl,
                banner: bannerUrl,
                address: dto.address ?? store.address,
                phone: dto.phone ?? store.phone,
                start_time:
                    dto.start_time ?? store.start_time,
                end_time:
                    dto.end_time ?? store.end_time,
                store_type_id:
                    dto.store_type_id
                        ? Number(dto.store_type_id)
                        : store.store_type_id,
                latitude:
                    dto.latitude ?? store.latitude,
                longitude:
                    dto.longitude ?? store.longitude,
            },
        });

        return {
            success: true,
            data: updatedStore,
        };
    }

    async remove(id: number) {
        const store = await this.prisma.store.findUnique({
            where: { id },
        });

        if (!store) {
            throw new NotFoundException('Store not found');
        }

        await this.prisma.store.delete({
            where: { id },
        });

        return {
            success: true,
            message: 'Store deleted successfully',
        };
    }


    async getCategories(storeId: number) {
        const store = await this.prisma.store.findUnique({
            where: {
                id: storeId,
            },
        });

        if (!store) {
            throw new NotFoundException('Store not found');
        }

        const storeCategories =
            await this.prisma.storeCategory.findMany({
                where: {
                    store_id: storeId,
                },
                include: {
                    category: {
                        include: {
                            products: true,
                        },
                    },
                },
                orderBy: {
                    createdAt: 'desc',
                },
            });

        const categories = storeCategories.map(
            (item) => item.category,
        );

        return {
            success: true,
            count: categories.length,
            data: categories,
        };
    }



    async assignCategories(
        storeId: number,
        categoryIds: number[],
    ) {
        const store = await this.prisma.store.findUnique({
            where: {
                id: storeId,
            },
            include: {
                storeType: true,
            },
        });

        if (!store) {
            throw new NotFoundException(
                'Store not found',
            );
        }

        const categories =
            await this.prisma.category.findMany({
                where: {
                    id: {
                        in: categoryIds,
                    },
                    store_type_id: store.storeType.id,
                },
            });

        if (categories.length !== categoryIds.length) {
            throw new BadRequestException(
                'Some categories do not exist or do not belong to the store type',
            );
        }

        await this.prisma.storeCategory.deleteMany({
            where: {
                store_id: storeId,
            },
        });

        const storeCategories =
            await this.prisma.storeCategory.createMany({
                data: categoryIds.map((categoryId) => ({
                    store_id: storeId,
                    category_id: categoryId,
                })),
            });

        return {
            success: true,
            data: storeCategories,
        };
    }


    async getProducts(storeId: number) {
        const store = await this.prisma.store.findUnique({
            where: {
                id: storeId,
            },
        });

        if (!store) {
            throw new NotFoundException(
                'Store not found',
            );
        }

        const products =
            await this.prisma.product.findMany({
                where: {
                    store_id: storeId,
                },
                include: {
                    category: {
                        select: {
                            id: true,
                            name: true,
                            description: true,
                        },
                    },
                    attributeValues: {
                        include: {
                            attribute: true,
                        },
                    },
                },
                orderBy: {
                    createdAt: 'desc',
                },
            });

        const transformedProducts = products.map(
            (product) => {
                const {
                    attributeValues,
                    ...productData
                } = product;

                const attributesMap = new Map();

                attributeValues.forEach((av) => {
                    if (
                        !attributesMap.has(
                            av.attribute_id,
                        )
                    ) {
                        attributesMap.set(
                            av.attribute_id,
                            {
                                id: av.attribute.id,
                                name: av.attribute.name,
                                createdAt:
                                    av.attribute.createdAt,
                                updatedAt:
                                    av.attribute.updatedAt,
                                values: [],
                            },
                        );
                    }

                    const {
                        attribute,
                        ...valueData
                    } = av;

                    attributesMap
                        .get(av.attribute_id)
                        .values.push(valueData);
                });

                return {
                    ...productData,
                    attributes: Array.from(
                        attributesMap.values(),
                    ),
                };
            },
        );

        return {
            success: true,
            store: {
                id: store.id,
                name: store.name,
            },
            count: transformedProducts.length,
            data: transformedProducts,
        };
    }



    async getByStoreType(storeTypeId: number) {
        const storeType =
            await this.prisma.storeType.findUnique({
                where: {
                    id: storeTypeId,
                },
            });

        if (!storeType) {
            throw new NotFoundException(
                'Store type not found',
            );
        }

        const stores =
            await this.prisma.store.findMany({
                where: {
                    store_type_id: storeTypeId,
                    is_active: true,
                },
                orderBy: [
                    {
                        is_featured: 'desc',
                    },
                    {
                        rating: 'desc',
                    },
                    {
                        createdAt: 'desc',
                    },
                ],
                include: {
                    storeType: true,
                    user: true,
                    reviews: {
                        take: 5,
                    },
                },
            });

        return {
            success: true,
            message:
                'Stores retrieved successfully',
            data: {
                storeType,
                stores,
                total: stores.length,
            },
        };
    }



    async toggleStatus(id: number) {
        const store = await this.prisma.store.findUnique({
            where: { id },
        });

        if (!store) {
            throw new NotFoundException(
                'Store not found',
            );
        }

        const updated = await this.prisma.store.update({
            where: { id },
            data: {
                is_active: !store.is_active,
            },
        });

        return {
            success: true,
            message: `Store ${updated.is_active
                ? 'activated'
                : 'deactivated'
                } successfully`,
            data: {
                is_active: updated.is_active,
            },
        };
    }



    async verifyStore(id: number) {
        const store = await this.prisma.store.findUnique({
            where: { id },
        });

        if (!store) {
            throw new NotFoundException(
                'Store not found',
            );
        }

        const updated = await this.prisma.store.update({
            where: { id },
            data: {
                is_verified: !store.is_verified,
            },
        });

        return {
            success: true,
            message: `Store ${updated.is_verified
                ? 'verified'
                : 'unverified'
                } successfully`,
            data: {
                is_verified: updated.is_verified,
            },
        };
    }


    async toggleFeatured(id: number) {
        const store = await this.prisma.store.findUnique({
            where: { id },
        });

        if (!store) {
            throw new NotFoundException(
                'Store not found',
            );
        }

        const updated = await this.prisma.store.update({
            where: { id },
            data: {
                is_featured: !store.is_featured,
            },
        });

        return {
            success: true,
            message: `Store ${updated.is_featured
                ? 'featured'
                : 'unfeatured'
                } successfully`,
            data: {
                id: store.id,
                name: store.name,
                is_featured: updated.is_featured,
            },
        };
    }



    async getFeaturedStores(placeId: number) {
        if (!placeId) {
            throw new BadRequestException(
                'place_id is required',
            );
        }

        const stores = await this.prisma.store.findMany({
            where: {
                place_id: placeId,
                is_active: true,
                is_featured: true,
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
}
