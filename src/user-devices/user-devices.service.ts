import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UserDevicesService {

    constructor(private prisma: PrismaService) { }

    /**
       * Register or update a user device
       * - If pushToken exists → update device info
       * - If not → create new device record
       *
       * @param userId - ID of authenticated user
       * @param dto - device data (pushToken, platform, deviceId)
       * @returns created or updated device record
       */
    async registerDevice(userId: number, dto: any) {
        const { pushToken, platform, deviceId } = dto;

        if (!userId || !pushToken) {
            throw new BadRequestException('userId and pushToken required');
        }

        const device = await this.prisma.userDevice.upsert({
            where: { pushToken },
            update: { userId, platform, deviceId },
            create: { userId, pushToken, platform, deviceId },
        });

        return { success: true, device };
    }


    /**
      * Remove a user device (logout from device)
      * - Deletes device by pushToken + userId
      *
      * @param userId - ID of authenticated user
      * @param pushToken - device push notification token
      * @returns success message after deletion
      */
    async removeDevice(userId: number, pushToken: string) {
        if (!userId || !pushToken) {
            throw new BadRequestException('userId and pushToken required');
        }

        await this.prisma.userDevice.deleteMany({
            where: { pushToken, userId },
        });

        return { success: true, message: 'Device removed' };
    }
}
