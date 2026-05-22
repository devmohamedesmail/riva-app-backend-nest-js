import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { UpdateVehicleDto } from './dto/update-vehicle.dto';
import { CloudinaryService } from '../cloudinary/cloudinary.service';

@Injectable()
export class VehiclesService {
    constructor(
        private prisma: PrismaService,
        private cloudinary: CloudinaryService,
    ) { }

    /**
     * Create vehicle
     */
    async createVehicle(
        userId: number,
        dto: CreateVehicleDto,
        file?: Express.Multer.File,
    ) {
        let imageUrl: string | undefined;

        if (file) {
            const upload: any =
                await this.cloudinary.uploadImage(file);

            imageUrl = upload.secure_url;
        } else if (dto.image) {
            imageUrl = dto.image;
        }

        const vehicle = await this.prisma.vehicle.create({
            data: {
                userId,

                plateNumber: dto.plateNumber,
                type: dto.type,
                area_id: dto.area_id,
                place_id: dto.place_id,
                model: dto.model,
                capacity: dto.capacity,
                license: dto.license,
                color: dto.color,
                insurance: dto.insurance,

                insurance_date: dto.insurance_date
                    ? new Date(dto.insurance_date)
                    : null,

                is_active: dto.is_active,
                is_verified: dto.is_verified,
                is_available: dto.is_available,

                image: imageUrl ?? null,
            },
        });

        return {
            success: true,
            data: vehicle,
        };
    }

    /**
     * Get all vehicles
     */
    async getVehicles() {
        const vehicles = await this.prisma.vehicle.findMany({
            orderBy: { id: 'desc' },
        });

        return {
            success: true,
            data: vehicles,
        };
    }

    /**
     * Get single vehicle
     */
    async getVehicle(id: number) {
        const vehicle = await this.prisma.vehicle.findUnique({
            where: { id },
        });

        if (!vehicle) {
            throw new NotFoundException('Vehicle not found');
        }

        return {
            success: true,
            data: vehicle,
        };
    }

    /**
     * Update vehicle
     */
    async updateVehicle(
        id: number,
        dto: UpdateVehicleDto,
        file?: Express.Multer.File,
    ) {
        const vehicle = await this.prisma.vehicle.findUnique({
            where: { id },
        });

        if (!vehicle) {
            throw new NotFoundException('Vehicle not found');
        }

        let imageUrl = vehicle.image;

        if (file) {
            const upload: any =
                await this.cloudinary.uploadImage(file);

            imageUrl = upload.secure_url;
        }

        const data: any = {};

        if (dto.plateNumber !== undefined) data.plateNumber = dto.plateNumber;
        if (dto.type !== undefined) data.type = dto.type;
        if (dto.area_id !== undefined) data.area_id = dto.area_id;
        if (dto.place_id !== undefined) data.place_id = dto.place_id;
        if (dto.model !== undefined) data.model = dto.model;
        if (dto.capacity !== undefined) data.capacity = dto.capacity;
        if (dto.license !== undefined) data.license = dto.license;
        if (dto.color !== undefined) data.color = dto.color;
        if (dto.insurance !== undefined) data.insurance = dto.insurance;

        if (dto.insurance_date !== undefined) {
            data.insurance_date = dto.insurance_date
                ? new Date(dto.insurance_date)
                : null;
        }

        if (dto.is_active !== undefined) data.is_active = dto.is_active;
        if (dto.is_verified !== undefined) data.is_verified = dto.is_verified;
        if (dto.is_available !== undefined) data.is_available = dto.is_available;

        data.image = imageUrl;

        const updated = await this.prisma.vehicle.update({
            where: { id },
            data,
        });

        return {
            success: true,
            data: updated,
        };
    }

    /**
     * Delete vehicle
     */
    async deleteVehicle(id: number) {
        try {
            await this.prisma.vehicle.delete({
                where: { id },
            });

            return {
                success: true,
                message: 'Vehicle deleted',
            };
        } catch {
            throw new NotFoundException('Vehicle not found');
        }
    }
}
