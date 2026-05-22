import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAddressDto } from './dto/create-address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';

@Injectable()
export class AddressService {
    constructor(private prisma: PrismaService) { }


    async create(userId: number, dto: CreateAddressDto) {
        const address = await this.prisma.address.create({
            data: {
                user_id: userId,
                address: dto.address,
                area_id: dto.area_id ?? null,
                latitude: dto.latitude ?? null,
                longitude: dto.longitude ?? null,
                phone: dto.phone ?? null,
            },
        });

        return {
            success: true,
            data: address,
        };
    }


    async getAll(userId: number) {
    const addresses = await this.prisma.address.findMany({
      where: { user_id: userId },
      include: {
        area: true,
      },
    });

    return {
      success: true,
      data: addresses,
    };
  }

  async getOne(id: number, userId: number) {
    const address = await this.prisma.address.findUnique({
      where: { id },
      include: {
        area: true,
      },
    });

    if (!address) {
      throw new NotFoundException('Address not found');
    }

    if (address.user_id !== userId) {
      throw new ForbiddenException('Access denied');
    }

    return {
      success: true,
      data: address,
    };
  }

  async update(id: number, userId: number, dto: UpdateAddressDto) {
    const existing = await this.prisma.address.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException('Address not found');
    }

    if (existing.user_id !== userId) {
      throw new ForbiddenException('Access denied');
    }

    const updated = await this.prisma.address.update({
      where: { id },
      data: {
        address: dto.address ?? existing.address,
        area_id: dto.area_id ?? existing.area_id,
        latitude: dto.latitude ?? existing.latitude,
        longitude: dto.longitude ?? existing.longitude,
        phone: dto.phone ?? existing.phone,
      },
    });

    return {
      success: true,
      data: updated,
    };
  }

  async remove(id: number, userId: number) {
    const existing = await this.prisma.address.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException('Address not found');
    }

    if (existing.user_id !== userId) {
      throw new ForbiddenException('Access denied');
    }

    await this.prisma.address.delete({
      where: { id },
    });

    return {
      success: true,
      message: 'Address deleted successfully',
    };
  }
}
