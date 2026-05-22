import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBannerDto } from './dto/create-banner.dto';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { UpdateBannerDto } from './dto/update-banner.dto';

@Injectable()
export class BannersService {
    constructor(private prisma: PrismaService, private cloudinary: CloudinaryService) { }

    /**
  * Get all banners
  * - Returns list of banners ordered by newest first
  */
   async findAll() {
    const banners = await this.prisma.banner.findMany({
        orderBy: { createdAt: 'desc' },
    });

    return {
        success: true,
        data: banners,
    };
}



    /**
     * Get single banner by ID
     * - Throws error if banner not found
     */
    async findOne(id: number) {
        const banner = await this.prisma.banner.findUnique({
            where: { id },
        });

        if (!banner) {
            throw new NotFoundException('Banner not found');
        }

        return {
            success: true,
            data: banner,
        };
    }

    /**
     * Create a new banner
     * - Stores banner data in DB
     * - Image is passed from controller after Cloudinary upload
     */
    async create(dto: CreateBannerDto, file?: Express.Multer.File) {
        let imageUrl: string | null = null;

        if (file) {
            const uploadResult: any =
                await this.cloudinary.uploadImage(file);

            imageUrl = uploadResult.secure_url;
        }

        // ✅ GUARANTEE required fields
        if (!dto.title || !dto.slug || !dto.content) {
            throw new Error('Missing required fields');
        }

        const banner = await this.prisma.banner.create({
            data: {
                title: dto.title,
                slug: dto.slug,
                content: dto.content,
                is_published: dto.is_published ?? true,
                link: dto.link ?? null,
                image: imageUrl,
            },
        });
        return {
            success: true,
            data: banner,
        };
    }

    /**
     * Update existing banner
     * - Only updates provided fields
     * - Throws error if banner not found
     */
    /**
   * Update banner
   * - Handles validation
   * - Handles Cloudinary upload
   * - Handles Prisma update
   * - Keeps old values if not provided
   */
    async update(
        id: number,
        dto: UpdateBannerDto,
        file?: Express.Multer.File,
    ) {
        // 1. Check banner exists
        const banner = await this.prisma.banner.findUnique({
            where: { id },
        });

        if (!banner) {
            throw new NotFoundException('Banner not found');
        }

        // 2. Upload image if exists
        let imageUrl: string | undefined;

        if (file) {
            const uploadResult: any =
                await this.cloudinary.uploadImage(file);

            imageUrl = uploadResult.secure_url;
        }

        // 3. Build update data safely
        const data = {
            title: dto.title ?? banner.title,
            slug: dto.slug ?? banner.slug,
            content: dto.content ?? banner.content,
            is_published: dto.is_published ?? banner.is_published,
            link: dto.link ?? banner.link,
            image: imageUrl ?? banner.image,
        };

        // 4. Update in DB
        const updatedBanner = await this.prisma.banner.update({
            where: { id },
            data,
        });

        return {
            success: true,
            data: updatedBanner,
        }
    }

    /**
     * Delete banner by ID
     * - Removes banner permanently from database
     */
    async remove(id: number) {
        const banner = await this.prisma.banner.findUnique({ where: { id } });

        if (!banner) {
            throw new NotFoundException('Banner not found');
        }

        await this.prisma.banner.delete({ where: { id } });

        return { message: 'Banner deleted successfully' };
    }
}
