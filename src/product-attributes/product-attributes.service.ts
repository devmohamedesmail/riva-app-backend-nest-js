import { Injectable, InternalServerErrorException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAttributeDto } from './dto/create-attribute.dto';
@Injectable()
export class ProductAttributesService {
    constructor(private prisma: PrismaService) { }


    /**
  * Create Attribute
  */
    async create(dto: CreateAttributeDto) {
        try {
            if (!dto.name) {
                throw new BadRequestException('name is required');
            }

            const attribute = await this.prisma.attribute.create({
                data: {
                    name: dto.name,
                },
            });

            return {
                success: true,
                data: attribute,
            };
        } catch (error: any) {
            throw new InternalServerErrorException(error.message);
        }
    }



    /**
     * Get All Attributes
     */
    async findAll() {
        try {
            const attributes = await this.prisma.attribute.findMany();

            return {
                success: true,
                attributes,
            };
        } catch (error: any) {
            throw new InternalServerErrorException(error.message);
        }
    }
}
