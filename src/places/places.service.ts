import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePlaceDto } from './dto/create-place.dto';
import { UpdatePlaceDto } from './dto/update-place.dto';

@Injectable()
export class PlacesService {
    constructor(private prisma: PrismaService) { }


    async findAll() {
        const places = await this.prisma.place.findMany({
            include: { storeTypes: { include: { storeType: true } } },
            orderBy: { createdAt: 'desc' },
        });
        return {
            success: true,
            data: places,
        };
    }


    async findOne(id: number) {
        const place = await this.prisma.place.findUnique({
            where: { id },
            include: { storeTypes: { include: { storeType: true } } },
        });

        if (!place) throw new NotFoundException('Place not found');

        return { success: true, data: place };
    }



    async create(dto: CreatePlaceDto) {
        const storeTypes = await this.prisma.storeType.findMany({
            where: { id: { in: dto.store_type_ids } },
        });

        if (storeTypes.length !== dto.store_type_ids.length) {
            throw new BadRequestException('Some store types not exist');
        }

        const place = await this.prisma.place.create({
            data: {
                name: dto.name,
                address: dto.address,
                latitude: dto.latitude,
                longitude: dto.longitude,
                storeTypes: {
                    create: dto.store_type_ids.map((id) => ({
                        storeType: { connect: { id } },
                    })),
                },
            },
            include: { storeTypes: { include: { storeType: true } } },
        });

        return { success: true, data: place };
    }


    async update(id: number, dto: UpdatePlaceDto) {
        const place = await this.prisma.place.findUnique({ where: { id } });
        if (!place) throw new NotFoundException('Place not found');

        const data: any = {
            name: dto.name ?? place.name,
            address: dto.address ?? place.address,
            latitude: dto.latitude ?? place.latitude,
            longitude: dto.longitude ?? place.longitude,
        };

        if (dto.store_type_ids) {
            const storeTypes = await this.prisma.storeType.findMany({
                where: { id: { in: dto.store_type_ids } },
            });

            if (storeTypes.length !== dto.store_type_ids.length) {
                throw new BadRequestException('Some store types not exist');
            }

            data.storeTypes = {
                deleteMany: {},
                create: dto.store_type_ids.map((id) => ({
                    storeType: { connect: { id } },
                })),
            };
        }

        const updated = await this.prisma.place.update({
            where: { id },
            data,
            include: { storeTypes: { include: { storeType: true } } },
        });

        return { success: true, data: updated };
    }


    async remove(id: number) {
        const place = await this.prisma.place.findUnique({ where: { id } });
        if (!place) throw new NotFoundException('Place not found');

        await this.prisma.place.delete({ where: { id } });

        return { success: true };
    }

    async search(query: string) {
        if (!query) throw new BadRequestException('Search query required');

        const places = await this.prisma.place.findMany({
            where: {
                OR: [
                    { name: { contains: query } },
                    { address: { contains: query } },
                ],
            },
            include: { storeTypes: true },
        });

        return { success: true, data: places };
    }



    async getStoreTypes(placeId: number) {
        return this.prisma.storeType.findMany({
            where: {
                places: {
                    some: { place_id: placeId },
                },
            },
        });
    }



    calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
        const R = 6371;
        const dLat = this.toRad(lat2 - lat1);
        const dLon = this.toRad(lon2 - lon1);

        const a =
            Math.sin(dLat / 2) ** 2 +
            Math.cos(this.toRad(lat1)) *
            Math.cos(this.toRad(lat2)) *
            Math.sin(dLon / 2) ** 2;

        return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
    }

    private toRad(v: number) {
        return (v * Math.PI) / 180;
    }
}
