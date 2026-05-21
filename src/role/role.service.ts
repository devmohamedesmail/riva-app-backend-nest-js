
import { Injectable, BadRequestException, InternalServerErrorException, NotFoundException, ConflictException } from '@nestjs/common';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { PrismaService } from '../prisma/prisma.service';




// import { PrismaService } from '../prisma.service';
@Injectable()
export class RoleService {
    constructor(private prisma: PrismaService) { }


    /**
      * Retrieve all roles ordered by latest created.
      *
      * @returns List of system roles
      */
    async allRoles() {
        try {
            const roles = await this.prisma.role.findMany({
                orderBy: {
                    createdAt: 'desc',
                },
            });

            return {
                success: true,
                count: roles.length,
                data: roles,
            };
        } catch (error) {
            return {
                success: false,
                message: 'Failed to retrieve roles',
                error: error?.message,
            }
        }
    }


    /**
    * Create a new role.
    *
    * Automatically generates a slug if not provided.
    *
    * @param body Create role payload
    * @returns Newly created role
    * @throws ConflictException
    */
    async create(body: CreateRoleDto) {
        try {
            const {
                role,
                slug,
                title_ar,
                title_en,
            } = body;

            const existingRole = await this.prisma.role.findUnique({
                where: {
                    role,
                },
            });

            if (existingRole) {
                throw new ConflictException(
                    `Role '${role}' already exists`,
                );
            }

            const generatedSlug =
                slug || this.generateSlug(role);

            const existingSlug = await this.prisma.role.findFirst({
                where: {
                    slug: generatedSlug,
                },
            });

            if (existingSlug) {
                throw new ConflictException(
                    `Slug '${generatedSlug}' already exists`,
                );
            }

            const newRole = await this.prisma.role.create({
                data: {
                    role,
                    slug: generatedSlug,
                    title_ar,
                    title_en,
                },
            });

            return {
                success: true,
                message: 'Role created successfully',
                data: newRole,
            };
        } catch (error) {
            throw error;
        }
    }

    /**
    * Update an existing role.
    *
    * @param id Role ID
    * @param body Update payload
    * @returns Updated role
    * @throws NotFoundException
    * @throws ConflictException
    */
    async update(id: number, body: UpdateRoleDto) {
        try {
            const existingRole = await this.prisma.role.findUnique({
                where: { id },
            });

            if (!existingRole) {
                throw new NotFoundException(
                    `Role with ID ${id} was not found`,
                );
            }

            if (body.role) {
                const duplicateRole = await this.prisma.role.findFirst({
                    where: {
                        role: body.role,
                        NOT: {
                            id,
                        },
                    },
                });

                if (duplicateRole) {
                    throw new ConflictException(
                        `Role '${body.role}' already exists`,
                    );
                }
            }

            let generatedSlug: string | undefined;

            if (body.role) {
                generatedSlug =
                    body.slug || this.generateSlug(body.role);

                const duplicateSlug = await this.prisma.role.findFirst({
                    where: {
                        slug: generatedSlug,
                        NOT: {
                            id,
                        },
                    },
                });

                if (duplicateSlug) {
                    throw new BadRequestException(
                        'Slug already exists',
                    );
                }
            }

            const updatedRole = await this.prisma.role.update({
                where: { id },
                data: {
                    role: body.role,
                    slug: generatedSlug,
                    title_ar: body.title_ar,
                    title_en: body.title_en,
                },
            });

            return {
                success: true,
                message: 'Role updated successfully',
                data: updatedRole,
            };
        } catch (error) {
            throw error;
        }
    }


    /**
       * Delete a role.
       *
       * Prevent deletion if users are assigned.
       *
       * @param id Role ID
       * @returns Success response
       * @throws NotFoundException
       * @throws BadRequestException
       */
    async delete(id: number) {
        try {
            const role = await this.prisma.role.findUnique({
                where: { id },
            });

            if (!role) {
                throw new NotFoundException('Role not found');
            }

            const userCount = await this.prisma.user.count({
                where: {
                    role_id: id,
                },
            });

            if (userCount > 0) {
                throw new BadRequestException(
                    `Cannot delete role. ${userCount} user(s) assigned to this role`,
                );
            }

            await this.prisma.role.delete({
                where: { id },
            });

            return {
                success: true,
                message: 'Role deleted successfully',
            };
        } catch (error) {
            throw error;
        }
    }

    /**
       * Retrieve a single role by ID including assigned users.
       *
       * @param id Role ID
       * @returns Role details with users
       * @throws NotFoundException
       */
    async find(id: number) {
        try {
            const role = await this.prisma.role.findUnique({
                where: { id },
                include: {
                    users: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                            phone: true,
                            createdAt: true,
                        },
                    },
                },
            });

            if (!role) {
                throw new NotFoundException(`Role with ID ${id} was not found`,);
            }

            return {
                success: true,
                data: role,
            };
        } catch (error) {
            throw error;
        }
    }



    /**
   * Retrieve paginated users assigned to a role.
   *
   * @param id Role ID
   * @param page Current page
   * @param limit Items per page
   * @returns Paginated users
   * @throws NotFoundException
   */
    async getUsersByRole(
        id: number,
        page = 1,
        limit = 10,
    ) {
        try {
            const skip = (page - 1) * limit;

            const role = await this.prisma.role.findUnique({
                where: { id },
            });

            if (!role) {
                throw new NotFoundException(
                    `Role with ID ${id} was not found`,
                );
            }

            const [users, total] = await Promise.all([
                this.prisma.user.findMany({
                    where: {
                        role_id: id,
                    },
                    skip,
                    take: limit,
                    orderBy: {
                        createdAt: 'desc',
                    },
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        phone: true,
                        createdAt: true,
                    },
                }),

                this.prisma.user.count({
                    where: {
                        role_id: id,
                    },
                }),
            ]);

            return {
                success: true,
                message: `Users with role '${role.role}' retrieved successfully`,
                data: {
                    role: role.role,
                    users,
                    pagination: {
                        currentPage: page,
                        totalPages: Math.ceil(total / limit),
                        totalUsers: total,
                        usersPerPage: limit,
                    },
                },
            };
        } catch (error) {
            throw error;
        }
    }



    /**
    * Retrieve role statistics with user counts.
    *
    * @returns Role statistics
    */
    async statistics() {
        try {
            const roles = await this.prisma.role.findMany({
                include: {
                    _count: {
                        select: {
                            users: true,
                        },
                    },
                },
            });

            return {
                success: true,
                data: {
                    totalRoles: roles.length,
                    roles: roles.map((r) => ({
                        id: r.id,
                        role: r.role,
                        slug: r.slug,
                        userCount: r._count.users,
                        createdAt: r.createdAt,
                    })),
                },
            };
        } catch (error: any) {
            throw new InternalServerErrorException(
                error.message,
            );
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
