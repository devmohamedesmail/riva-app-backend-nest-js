import { Injectable ,UnauthorizedException,NotFoundException} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDeliveryLocationDto } from './dto/create-delivery-location.dto';

@Injectable()
export class DeliveryLocationService {
    constructor(private prisma: PrismaService) {}

  async upsertLocation(userId: number, dto: CreateDeliveryLocationDto) {
    if (!userId) {
      throw new UnauthorizedException('Unauthorized');
    }

    const locationData: any = {
      address: dto.address ?? null,
    };

    if (dto.latitude !== undefined) {
      locationData.latitude = dto.latitude;
    }

    if (dto.longitude !== undefined) {
      locationData.longitude = dto.longitude;
    }

    const location = await this.prisma.deliveryLocation.upsert({
      where: { userId },
      update: locationData,
      create: {
        userId,
        ...locationData,
      },
    });

    return {
      success: true,
      location,
    };
  }

  async getMyLocation(userId: number) {
    const location = await this.prisma.deliveryLocation.findUnique({
      where: { userId },
    });

    return {
      success: true,
      location,
    };
  }

  async deleteLocation(userId: number) {
    try {
      await this.prisma.deliveryLocation.delete({
        where: { userId },
      });

      return {
        success: true,
        message: 'Location deleted',
      };
    } catch (e: any) {
      if (e.code === 'P2025') {
        throw new NotFoundException('Location not found');
      }
      throw e;
    }
  }
}
