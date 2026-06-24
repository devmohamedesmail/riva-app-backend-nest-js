import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAreaDto } from './dto/create-area.dto';
import { UpdateAreaDto } from './dto/update-area.dto';

@Injectable()
export class AreasService {
    constructor(private prisma: PrismaService) { }

    async create(dto: CreateAreaDto) {
        const area = await this.prisma.area.create({
            data: dto,
        });

        return {
            success: true,
            data: area,
        };
    }


    async findAll(
        search?: string,
        place_id?: number,
        page = 1,
        limit = 10,
    ) {
        const where: any = {};

        if (search) {
            where.OR = [
                {
                    name: {
                        contains: search,
                    },
                },
                {
                    area_code: {
                        contains: search,
                    },
                },
            ];
        }

        if (place_id) {
            where.place_id = place_id;
        }

        const total = await this.prisma.area.count({
            where,
        });

        const totalPages = Math.ceil(total / limit);

        if (page > totalPages && totalPages > 0) {
            page = 1;
        }

        const skip = (page - 1) * limit;

        const areas = await this.prisma.area.findMany({
            where,
            skip,
            take: limit,
            include: {
                place: true,
            },
            orderBy: {
                id: 'desc',
            },
        });

        return {
            success: true,
            data: areas,
            meta: {
                page,
                limit,
                total,
                totalPages,
            },
        };
    }


    async findOne(id: number) {
        const area = await this.prisma.area.findUnique({
            where: { id },
            include: {
                place: true,
            },
        });

        if (!area) {
            throw new NotFoundException('Area not found');
        }

        return {
            success: true,
            data: area,
        };
    }



    async update(id: number, dto: UpdateAreaDto) {
        const area = await this.prisma.area.findUnique({
            where: { id },
        });

        if (!area) {
            throw new NotFoundException('Area not found');
        }

        const updated = await this.prisma.area.update({
            where: { id },
            data: dto,
        });

        return {
            success: true,
            data: updated,
        };
    }


    async remove(id: number) {
        const area = await this.prisma.area.findUnique({
            where: { id },
        });

        if (!area) {
            throw new NotFoundException('Area not found');
        }

        await this.prisma.area.delete({
            where: { id },
        });

        return {
            success: true,
            message: 'Area deleted successfully',
        };
    }


    async getByPlaceId(place_id: number) {
        const areas = await this.prisma.area.findMany({
            where: {
                place_id,
            },
        });

        return {
            success: true,
            data: areas,
        };
    }
}
