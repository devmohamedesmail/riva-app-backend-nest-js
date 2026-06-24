import { LoginUserDto } from './dto/login-user.dto';
import { Injectable, BadRequestException, UnauthorizedException, NotFoundException } from '@nestjs/common';
import { RegisterUserDto } from './dto/register-user.dto';

import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { nanoid } from 'nanoid';
import { PrismaService } from '../prisma/prisma.service';
import { AuthMethod } from '../generated/prisma/enums';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { Multer } from 'multer';



@Injectable()
export class AuthService {
    constructor(private readonly prisma: PrismaService, private readonly jwtService: JwtService, private cloudinary: CloudinaryService) { }


    /**
     * Register a new user
     * - Validate email/phone uniqueness
     * - Assign default role
     * - Generate referral code
     * - Hash password
     * - Return JWT token
     */
    async register(dto: RegisterUserDto) {
        const { name, email, phone, password, role_id, auth_method, referred_by_code } = dto;


        if (!email && !phone) {
            throw new BadRequestException('Email or phone is required');
        }
        const orConditions = [] as any[];
        // check user exists

        if (email) orConditions.push({ email });
        if (phone) orConditions.push({ phone });


        const existingUser = await this.prisma.user.findFirst({
            where: {
                OR: orConditions.length ? (orConditions as any) : undefined,
            },
        });

        if (existingUser) {
            throw new BadRequestException('User with this email or phone already exists');
        }

        // default role
        const defaultRole = await this.prisma.role.findUnique({
            where: { role: 'user' },
        });


        if (!defaultRole) {
            throw new BadRequestException('Default role not found');
        }

        let finalRoleId = defaultRole.id;

        if (role_id) {
            const allowedRoles = ['user', 'store_owner', 'delivery_man'];

            const requestedRole = await this.prisma.role.findUnique({
                where: { id: role_id },
            });

            if (requestedRole && allowedRoles.includes(requestedRole.role)) {
                finalRoleId = requestedRole.id;
            }
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const referral_code = nanoid(8);

        let referred_by: number | null = null;

        if (referred_by_code) {
            const referrer = await this.prisma.user.findUnique({
                where: { referral_code: referred_by_code },
            });
            if (referrer) referred_by = referrer.id;
        }

        const user = await this.prisma.user.create({
            data: {
                name,
                email: email ?? null,
                phone: phone ?? null,
                password: hashedPassword,
                role_id: finalRoleId,
                auth_method: auth_method ?? AuthMethod.email,
                referral_code,
                referred_by,
            },
            select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                role: {
                    select: {
                        id: true,
                        role: true,
                        slug: true,
                    },
                },
            },
        });

        if (referred_by) {
            await this.prisma.user.update({
                where: { id: referred_by },
                data: { points: { increment: 10 } },
            });
        }

        const token = this.jwtService.sign({
            sub: user.id,
            email: user.email,
        });

        return { success: true, user, token };
    }



    /**
     * Login user with email or phone
     * - Validate credentials
     * - Compare password hash
     * - Generate JWT token
     * - Return authenticated user
     */
    async login(loginUserDto: LoginUserDto) {
        const { email, phone, password } = loginUserDto;

        // validate email or phone
        if (!email && !phone) {
            throw new BadRequestException(
                'Email or phone is required',
            );
        }

        // build OR conditions
        const whereConditions: any[] = [];

        if (email) {
            whereConditions.push({ email });
        }

        if (phone) {
            whereConditions.push({ phone });
        }

        // find user
        const user = await this.prisma.user.findFirst({
            where: {
                OR: whereConditions,
            },
            select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                role_id: true,
                password: true,
                role: {
                    select: {
                        id: true,
                        role: true,
                    },
                },
            },
        });

        // check user exists
        if (!user || !user.password) {
            throw new UnauthorizedException(
                'Invalid credentials',
            );
        }

        // compare password
        const isPasswordValid = await bcrypt.compare(
            password,
            user.password,
        );

        if (!isPasswordValid) {
            throw new UnauthorizedException(
                'Invalid credentials',
            );
        }

        // generate token
        const token = this.jwtService.sign({
            sub: user.id,
            email: user.email,
        });

        // response
        return {
            success: true,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                role: user.role,
            },
            token,
        };
    }



    /**
     * Get authenticated user profile
     * - Load user with relations
     * - Include role, store and vehicle
     */
    // async profile(user: any) {


    //     const fullUser = await this.prisma.user.findUnique({
    //         where: {
    //             id: user.id,
    //         },

    //         include: {
    //             role: true,
    //             store: {
    //                 include: {
    //                     reviews: true,
    //                 },
    //             },
    //             vehicle: true,
    //         },
    //     });

    //     if (!fullUser) {
    //         throw new NotFoundException('User not found');
    //     }

    //     return { success: true, data: fullUser };
    // }


    async profile(user: any) {

        const fullUser = await this.prisma.user.findUnique({
            where: {
                id: user.id,
            },
            select: {
                id: true,
                email: true,
                phone: true,
                name: true,
                avatar: true,
                email_verified: true,
                phone_verified: true,
                auth_method: true,
                is_active: true,
                points: true,
                wallet_balance: true,

                role: {
                    select: {
                        id: true,
                        role: true,
                        slug: true,
                        title_ar: true,
                        title_en: true,
                    }
                },

                store: {
                    include: {
                        reviews: true,
                    },
                },

                vehicle: true,
            },
        });


        if (!fullUser) {
            throw new NotFoundException('User not found');
        }

        return {
            success: true,
            data: fullUser,
        };
    }


    /**
     * Update authenticated user profile
     * - Update name/email/phone
     * - Validate unique email & phone
     * - Upload avatar to Cloudinary
     * - Save avatar URL
     */
    async updateProfile(
        userId: number,
        body: any,
        file?: Express.Multer.File,
    ) {
        const { name, email, phone } = body;

        // find user
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
        });

        if (!user) {
            throw new NotFoundException(
                'User not found',
            );
        }

        const updateData: any = {};

        // update name
        if (name) {
            updateData.name = name;
        }

        // update email
        if (email && email !== user.email) {
            const existingEmail =
                await this.prisma.user.findUnique({
                    where: { email },
                });

            if (existingEmail) {
                throw new BadRequestException(
                    'This email is already taken',
                );
            }

            updateData.email = email;
        }

        // update phone
        if (phone && phone !== user.phone) {
            const existingPhone =
                await this.prisma.user.findUnique({
                    where: { phone },
                });

            if (existingPhone) {
                throw new BadRequestException(
                    'This phone is already taken',
                );
            }

            updateData.phone = phone;
        }

        // upload avatar
        if (file) {
            const uploadResult: any =
                await this.cloudinary.uploadImage(
                    file,
                );

            updateData.avatar =
                uploadResult.secure_url;
        }

        // update user
        const updatedUser =
            await this.prisma.user.update({
                where: { id: userId },
                data: updateData,
                select: {
                    id: true,
                    name: true,
                    email: true,
                    phone: true,
                    avatar: true,
                    role: {
                        select: {
                            id: true,
                            role: true,
                        },
                    },
                },
            });

        return {
            success: true,
            user: updatedUser,
        };
    }



    /**
     * Delete authenticated user account
     * - Validate password
     * - Compare password hash
     * - Permanently delete account
     */
    async deleteAccount(userId: number, password: string) {
        if (!password) {
            throw new BadRequestException(
                'Password is required',
            );
        }

        const user = await this.prisma.user.findUnique({
            where: { id: userId },
        });

        if (!user) {
            throw new NotFoundException('User not found');
        }

        const isPasswordValid = await bcrypt.compare(
            password,
            user.password,
        );

        if (!isPasswordValid) {
            throw new UnauthorizedException(
                'Password is incorrect',
            );
        }

        await this.prisma.user.delete({
            where: { id: userId },
        });

        return {
            success: true,
            message: 'User account deleted successfully',
        };
    }


    /**
     * Forget password
     * - Generate new random password
     * - Hash password
     * - Update database
     * - Send password to email
     */

    async forgetPassword(email: string) {
        if (!email) {
            throw new BadRequestException(
                'Email is required',
            );
        }

        const user = await this.prisma.user.findUnique({
            where: { email },
        });

        if (!user) {
            throw new NotFoundException('User not found');
        }

        // generate random password
        const newPassword = Math.random()
            .toString(36)
            .slice(-8);

        // hash password
        const hashedPassword = await bcrypt.hash(
            newPassword,
            10,
        );

        // update password
        await this.prisma.user.update({
            where: { email },
            data: {
                password: hashedPassword,
            },
        });

        // send email here
        // await sendMail(...)

        return {
            success: true,
            message:
                'New password has been sent to your email',
            // remove in production
            newPassword,
        };
    }


    /**
     * Social login / register
     * - Login with provider
     * - Create user if not exists
     * - Assign allowed role
     * - Generate JWT token
     * - Support referral system
     */
    async socialLogin(body: any) {
        const {
            email,
            name,
            avatar,
            provider,
            provider_id,
            role_id,
            referred_by_code,
        } = body;

        if (!email || !provider || !provider_id) {
            throw new BadRequestException(
                'Email, provider and provider_id are required',
            );
        }

        // check user
        let user = await this.prisma.user.findUnique({
            where: { email },
            select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                avatar: true,
                role: {
                    select: {
                        id: true,
                        role: true,
                    },
                },
            },
        });

        // default role
        const defaultRole =
            await this.prisma.role.findUnique({
                where: { role: 'user' },
            });

        if (!defaultRole) {
            throw new BadRequestException(
                'Default role not found',
            );
        }

        let finalRoleId = defaultRole.id;

        // validate role
        if (role_id) {
            const allowedRoles = [
                'user',
                'store_owner',
            ];

            const requestedRole =
                await this.prisma.role.findUnique({
                    where: {
                        id: Number(role_id),
                    },
                });

            if (
                requestedRole &&
                allowedRoles.includes(requestedRole.role)
            ) {
                finalRoleId = requestedRole.id;
            }
        }

        // referral
        const referral_code = nanoid(8);

        let referred_by: number | null = null;

        if (referred_by_code) {
            const referrer =
                await this.prisma.user.findUnique({
                    where: {
                        referral_code: referred_by_code,
                    },
                });

            if (referrer) {
                referred_by = referrer.id;
            }
        }

        // create user
        if (!user) {
            user = await this.prisma.user.create({
                data: {
                    email,
                    name,
                    avatar,
                    provider_name: provider,
                    provider_id,
                    email_verified: true,
                    role_id: finalRoleId,
                    password: await bcrypt.hash(
                        '123456789',
                        10,
                    ),
                    referral_code,
                    referred_by,
                },
                select: {
                    id: true,
                    name: true,
                    email: true,
                    phone: true,
                    avatar: true,
                    role: {
                        select: {
                            id: true,
                            role: true,
                        },
                    },
                },
            });
        }

        // add referral points
        if (referred_by) {
            await this.prisma.user.update({
                where: {
                    id: referred_by,
                },
                data: {
                    points: {
                        increment: 10,
                    },
                },
            });
        }

        // generate token
        const token = this.jwtService.sign({
            sub: user.id,
            email: user.email,
        });

        return {
            success: true,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                role: user.role,
            },
            token,
        };
    }





}
