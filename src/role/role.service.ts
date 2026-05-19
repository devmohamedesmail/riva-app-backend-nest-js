
import { Injectable, BadRequestException } from '@nestjs/common';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { PrismaService } from 'src/prisma.service';



// import { PrismaService } from '../prisma.service';
@Injectable()
export class RoleService {
    constructor(private prisma: PrismaService) { }



    async allRoles() {
        try {
            const roles = await this.prisma.role.findMany();
            return {
                success: true,
                message: 'Roles fetched successfully',
                data: roles,
            };
        } catch (error) {
            throw error;
        }
    }


    async create(body: CreateRoleDto) {
        try {
            const { name, description } = body;

            const existingRole = await this.prisma.role.findUnique({
                where: { name },
            });

            if (existingRole) {
                throw new BadRequestException('Role already exists');
            }

            const slug = this.generateSlug(name);
            const role = await this.prisma.role.create({
                data: {
                    name,
                    description,
                    slug
                },
            });

            return {
                success: true,
                message: 'Role created successfully',
                data: role,
            };


        } catch (error) {
            throw error;
        }

    }

    async update(id: number, body: UpdateRoleDto) {
        try {
            const { name, description } = body;

            const existingRole = await this.prisma.role.findFirst({
                where: { name, NOT: { id } }
            });
            if (existingRole) {
                return {
                    success: false,
                    message: "Role update failed",
                    error: `Another role with name "${name}" already exists`,
                };
            }
            const role = await this.prisma.role.update({
                where: { id },
                data: { name, description }
            });

            return {
                success: true,
                message: "Role updated successfully",
                data: role
            };
        } catch (error) {
            throw error;
        }
    }



    private generateSlug(name: string): string {
    return name
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-')        
        .replace(/[^\w\-]+/g, '') 
        .replace(/\-\-+/g, '-');    
}
}
