import {
    BadRequestException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';



@Injectable()
export class ProductsService {
    constructor(
        private prisma: PrismaService,
        private cloudinary: CloudinaryService,
    ) { }



    /**
    * Get all products
    */
    async findAll(page = 1, limit = 10) {
        const products =
            await this.prisma.product.findMany({
                skip: (page - 1) * limit,
                take: limit,

                include: {
                    category: true,

                    attributeValues: {
                        include: {
                            attribute: true,
                        },
                    },
                },

                orderBy: {
                    id: 'desc',
                },
            });

        return {
            success: true,
            page,
            limit,
            data: products,
        };
    }





    /**
     * Create product
     */
    async create(
        dto: CreateProductDto,
        file?: Express.Multer.File,
    ) {
        let imageUrl: string | undefined;

        if (file) {
            const upload: any =
                await this.cloudinary.uploadImage(
                    file,
                );

            imageUrl = upload.secure_url;
        }

        const product =
            await this.prisma.product.create({
                data: {
                    store: {
                        connect: {
                            id: dto.store_id,
                        },
                    },

                    category: {
                        connect: {
                            id: dto.category_id,
                        },
                    },

                    name: dto.name,
                    description: dto.description,
                    price: dto.price,
                    sale_price: dto.sale_price,
                    on_sale: !!dto.sale_price,
                    image: imageUrl,
                    product_type:
                        dto.product_type ?? 'simple',
                },
            });

        /**
         * No attributes
         */
        if (
            !dto.values ||
            dto.values.length === 0
        ) {
            return {
                success: true,
                data: product,
            };
        }

        /**
         * Validate attributes
         */
        const attributeIds = [
            ...new Set(
                dto.values.map(
                    (v) => v.attribute_id,
                ),
            ),
        ];

        const attributes =
            await this.prisma.attribute.findMany({
                where: {
                    id: {
                        in: attributeIds,
                    },
                },

                select: {
                    id: true,
                },
            });

        if (
            attributes.length !==
            attributeIds.length
        ) {
            throw new BadRequestException(
                'One or more attributes not found',
            );
        }

        /**
         * Product Attributes
         */
        await this.prisma.productAttribute.createMany(
            {
                data: attributeIds.map(
                    (attribute_id) => ({
                        product_id: product.id,
                        attribute_id,
                    }),
                ),

                skipDuplicates: true,
            },
        );

        /**
         * Attribute values
         */
        await this.prisma.attributeValue.createMany(
            {
                data: dto.values.map((v) => ({
                    product_id: product.id,
                    attribute_id: v.attribute_id,
                    value: v.value,
                    price: v.price ?? null,
                })),
            },
        );

        return {
            success: true,
            data: product,
        };
    }



     /**
   * Find one
   */
  async findOne(id: number) {
    const product =
      await this.prisma.product.findUnique({
        where: { id },

        include: {
          category: true,

          attributeValues: {
            include: {
              attribute: true,
            },
          },
        },
      });

    if (!product) {
      throw new NotFoundException(
        'Product not found',
      );
    }

    return {
      success: true,
      data: product,
    };
  }



   /**
   * Update product
   */
  async update(
    id: number,
    dto: UpdateProductDto,
    file?: Express.Multer.File,
  ) {
    const product =
      await this.prisma.product.findUnique({
        where: { id },
      });

    if (!product) {
      throw new NotFoundException(
        'Product not found',
      );
    }

    let imageUrl = product.image;

    if (file) {
      const upload: any =
        await this.cloudinary.uploadImage(
          file,
        );

      imageUrl = upload.secure_url;
    }

    const updateData: any = {};

    if (dto.store_id) {
      updateData.store = {
        connect: {
          id: dto.store_id,
        },
      };
    }

    if (dto.category_id) {
      updateData.category = {
        connect: {
          id: dto.category_id,
        },
      };
    }

    if (dto.name) {
      updateData.name = dto.name;
    }

    if (dto.description !== undefined) {
      updateData.description =
        dto.description;
    }

    if (dto.price !== undefined) {
      updateData.price = dto.price;
    }

    if (dto.product_type !== undefined) {
      updateData.product_type =
        dto.product_type;
    }

    if (dto.sale_price !== undefined) {
      updateData.sale_price =
        dto.sale_price;

      updateData.on_sale =
        !!dto.sale_price;
    }

    updateData.image = imageUrl;

    await this.prisma.product.update({
      where: { id },
      data: updateData,
    });

    /**
     * No attributes
     */
    if (
      !dto.values ||
      dto.values.length === 0
    ) {
      const updatedProduct =
        await this.prisma.product.findUnique(
          {
            where: { id },

            include: {
              category: true,

              attributeValues: {
                include: {
                  attribute: true,
                },
              },
            },
          },
        );

      return {
        success: true,
        message:
          'Product updated successfully',

        data: updatedProduct,
      };
    }

    /**
     * Validate attributes
     */
    const attributeIds = [
      ...new Set(
        dto.values.map(
          (v) => v.attribute_id,
        ),
      ),
    ];

    const existingAttributes =
      await this.prisma.attribute.findMany({
        where: {
          id: {
            in: attributeIds,
          },
        },

        select: {
          id: true,
        },
      });

    if (
      existingAttributes.length !==
      attributeIds.length
    ) {
      throw new BadRequestException(
        'One or more attributes not found',
      );
    }

    /**
     * Replace product attributes
     */
    await this.prisma.productAttribute.deleteMany(
      {
        where: {
          product_id: id,
        },
      },
    );

    await this.prisma.productAttribute.createMany(
      {
        data: attributeIds.map(
          (attribute_id) => ({
            product_id: id,
            attribute_id,
          }),
        ),

        skipDuplicates: true,
      },
    );

    /**
     * Replace values
     */
    await this.prisma.attributeValue.deleteMany(
      {
        where: {
          product_id: id,
        },
      },
    );

    await this.prisma.attributeValue.createMany(
      {
        data: dto.values.map((v) => ({
          product_id: id,
          attribute_id: v.attribute_id,
          value: v.value,
          price: v.price ?? null,
        })),
      },
    );

    const updatedProduct =
      await this.prisma.product.findUnique({
        where: { id },

        include: {
          category: true,

          productAttributes: {
            include: {
              attribute: true,
            },
          },

          attributeValues: {
            include: {
              attribute: true,
            },
          },
        },
      });

    return {
      success: true,
      message:
        'Product updated successfully',

      data: updatedProduct,
    };
  }




    /**
   * Delete
   */
  async remove(id: number) {
    await this.prisma.product.delete({
      where: { id },
    });

    return {
      success: true,
      message:
        'Product deleted successfully',
    };
  }




  /**
   * Products by category
   */
  async getByCategory(
    category_id: number,
  ) {
    const products =
      await this.prisma.product.findMany({
        where: {
          category_id,
        },

        include: {
          category: true,

          attributeValues: {
            include: {
              attribute: true,
            },
          },
        },

        orderBy: {
          id: 'desc',
        },
      });

    return {
      success: true,
      data: products,
    };
  }



  /**
   * Sale products
   */
  async saleProducts(
    page = 1,
    limit = 10,
    place_id?: number,
  ) {
    const skip = (page - 1) * limit;

    const where: any = {
      sale_price: {
        not: null,
      },
    };

    if (place_id) {
      where.store = {
        place_id,
      };
    }

    const [products, total] =
      await Promise.all([
        this.prisma.product.findMany({
          where,

          include: {
            attributeValues: {
              include: {
                attribute: true,
              },
            },

            category: {
              select: {
                id: true,
                name: true,
              },
            },

            store: {
              select: {
                id: true,
                name: true,
                logo: true,
                rating: true,
              },
            },
          },

          orderBy: {
            createdAt: 'desc',
          },

          skip,
          take: limit,
        }),

        this.prisma.product.count({
          where,
        }),
      ]);

    return {
      success: true,
      data: products,

      pagination: {
        currentPage: page,
        totalPages: Math.ceil(
          total / limit,
        ),
        totalItems: total,
        itemsPerPage: limit,
      },
    };
  }



  /**
   * Search products
   */
  async searchProducts(
    q: string,
    page = 1,
    limit = 10,
    place_id?: number,
  ) {
    const skip = (page - 1) * limit;

    const where: any = {
      OR: [
        {
          name: {
            contains: q,
          },
        },

        {
          description: {
            contains: q,
          },
        },

        {
          store: {
            place: {
              OR: [
                {
                  name: {
                    contains: q,
                  },
                },

                {
                  address: {
                    contains: q,
                  },
                },
              ],
            },
          },
        },
      ],
    };

    if (place_id) {
      where.store = {
        place_id,
      };
    }

    const [products, total] =
      await Promise.all([
        this.prisma.product.findMany({
          where,

          orderBy: {
            createdAt: 'desc',
          },

          skip,
          take: limit,

          include: {
            category: {
              select: {
                id: true,
                name: true,
              },
            },

            store: {
              select: {
                id: true,
                name: true,
                logo: true,
                rating: true,
              },
            },

            attributeValues: {
              include: {
                attribute: true,
              },
            },
          },
        }),

        this.prisma.product.count({
          where,
        }),
      ]);

    return {
      success: true,
      data: products,

      pagination: {
        currentPage: page,

        totalPages: Math.ceil(
          total / limit,
        ),

        totalItems: total,

        itemsPerPage: limit,

        hasNextPage:
          page * limit < total,

        hasPrevPage: page > 1,
      },
    };
  }

}
