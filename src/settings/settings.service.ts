import { Injectable, BadRequestException } from '@nestjs/common';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SettingsService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly cloudinary: CloudinaryService,
    ) { }



    async create(body: any, files: any) {
        let logoUrl: string | undefined;
        let bannerUrl: string | undefined;

        // upload logo
        if (files?.logo?.[0]) {
            const uploadResult: any =
                await this.cloudinary.uploadImage(
                    files.logo[0],
                );

            logoUrl = uploadResult.secure_url;
        }

        // upload banner
        if (files?.banner?.[0]) {
            const uploadResult: any =
                await this.cloudinary.uploadImage(
                    files.banner[0],
                );

            bannerUrl = uploadResult.secure_url;
        }

        const setting =
            await this.prisma.setting.create({
                data: {
                    ...body,
                    logo: logoUrl,
                    banner: bannerUrl,
                },
            });

        return {
            success: true,
            data: setting,
        };
    }



    async get() {
        const setting =
            await this.prisma.setting.findFirst();

        return {
            success: true,
            data: setting,
        };
    }



    async update(
        id: number,
        body: any,
        files: any,
    ) {
        if (Number.isNaN(id)) {
            throw new BadRequestException(
                'Invalid setting id',
            );
        }

        const data: Record<string, any> = {
            ...body,
        };

        /**
         * normalize booleans
         */
        const booleanFields = [
            'maintenance_mode',
            'user_force_update',
            'vendor_force_update',
        ];

        booleanFields.forEach((field) => {
            if (typeof data[field] === 'string') {
                data[field] =
                    data[field] === 'true';
            }
        });

        /**
         * remove empty values
         */
        Object.keys(data).forEach((key) => {
            if (
                data[key] === '' ||
                data[key] === undefined
            ) {
                delete data[key];
            }
        });

        /**
         * upload logo
         */
        if (files?.logo?.[0]) {
            const uploadResult: any =
                await this.cloudinary.uploadImage(
                    files.logo[0],
                );

            data.logo = uploadResult.secure_url;
        }

        /**
         * upload banner
         */
        if (files?.banner?.[0]) {
            const uploadResult: any =
                await this.cloudinary.uploadImage(
                    files.banner[0],
                );

            data.banner = uploadResult.secure_url;
        }

        /**
         * update settings
         */
        const setting =
            await this.prisma.setting.update({
                where: { id },
                data,
            });

        return {
            success: true,
            data: setting,
        };
    }

    /**
     * Toggle maintenance mode
     */
    async toggleMaintenance(
        id: number,
        body: any,
    ) {
        const {
            maintenance_mode,
            maintenance_message,
        } = body;

        const setting =
            await this.prisma.setting.update({
                where: { id },
                data: {
                    maintenance_mode,
                    maintenance_message,
                },
            });

        return {
            success: true,
            data: setting,
        };
    }

}
