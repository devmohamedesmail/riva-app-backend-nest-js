import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
    constructor(private prisma: PrismaService) { }


    async findAll() {
        return this.prisma.user.findMany({
            include: { role: true, store: true },
            orderBy: { createdAt: 'desc' },
        });
    }

    async findOne(id: number) {
        const user = await this.prisma.user.findUnique({
            where: { id },
            include: {
                role: true,
                store: {
                    include: { reviews: { include: { user: true } } },
                },
            },
        });

        if (!user) throw new NotFoundException('User not found');
        return user;
    }



    async remove(id: number) {
        const user = await this.prisma.user.findUnique({ where: { id } });
        if (!user) throw new NotFoundException('User not found');

        const store = await this.prisma.store.findFirst({
            where: { user_id: id },
        });

        if (store) {
            throw new BadRequestException('Cannot delete user. User owns a store.');
        }

        await this.prisma.user.delete({ where: { id } });

        return { message: 'User deleted successfully' };
    }


    async getByRole(role_name: string) {
        const role = await this.prisma.role.findFirst({
            where: { role: role_name },
        });

        if (!role) throw new NotFoundException('Role not found');

        const users = await this.prisma.user.findMany({
            where: { role_id: role.id },
            include: { role: true },
            orderBy: { createdAt: 'desc' },
        });

        return {
            message: `Users with role '${role_name}'`,
            count: users.length,
            data: users,
        };
    }



    async getStatistics() {
        const totalUsers = await this.prisma.user.count();
        const roles = await this.prisma.role.findMany();

        const usersByRole: Record<string, number> = {};

        for (const role of roles) {
            usersByRole[role.role] = await this.prisma.user.count({
                where: { role_id: role.id },
            });
        }

        const usersWithStore = await this.prisma.store.count();

        return {
            total_users: totalUsers,
            users_by_role: usersByRole,
            users_with_store: usersWithStore,
        };
    }

    async getProfile(id: number) {
        const user = await this.prisma.user.findUnique({
            where: { id },
            include: {
                role: true,
                store: {
                    include: {
                        reviews: { include: { user: true } },
                    },
                },
            },
        });

        if (!user) throw new NotFoundException('User not found');

        return user;
    }
}
