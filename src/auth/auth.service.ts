import { LoginUserDto } from './dto/login-user.dto';
import { Injectable, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { RegisterUserDto } from './dto/register-user.dto';

import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { nanoid } from 'nanoid';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuthService {
    constructor(private readonly prisma: PrismaService, private readonly jwtService: JwtService) { }


    async register(registerUserDto: RegisterUserDto) {
        // try {



        //     const {
        //         name,
        //         email,
        //         phone,
        //         password,
        //         role_id,
        //         auth_method,
        //         referred_by_code,
        //     } = registerUserDto;

        //     // check if user exists by email or phone
        //     const orConditions = [] as any[];

        //     if (email) orConditions.push({ email });
        //     if (phone) orConditions.push({ phone });


        //     const existingUser = await this.prisma.user.findFirst({
        //         where: {
        //             OR: orConditions.length ? (orConditions as any) : undefined,
        //         },
        //     });

        //     if (existingUser) {
        //         return {
        //             success: false,
        //             message: "User with this email or phone already exists",
        //         };
        //     }


        //     // 🔍 default role
        //     const defaultRole = await this.prisma.role.findUnique({
        //         where: { role: 'user' },
        //     });

        //     if (!defaultRole) {
        //         return {
        //             success: false,
        //             message: 'Default role not found',
        //         };
        //     }

        //     // 4️⃣ Validate role_id (allow only safe roles)
        //     let finalRoleId = defaultRole.id;

        //     if (role_id) {
        //         const allowedRoles = ['user', 'store_owner', 'delivery_man'];
        //         const requestedRole = await this.prisma.role.findUnique({
        //             where: { id: Number(role_id) },
        //         });

        //         if (requestedRole && allowedRoles.includes(requestedRole.role)) {
        //             finalRoleId = requestedRole.id;
        //         }
        //     }

        //     const hashedPassword = await bcrypt.hash(password, 10);
        //     // generate referral code
        //     const referral_code = nanoid(8);


        //     let referred_by: number | undefined = undefined;
        //     if (referred_by_code) {
        //         const referrer = await this.prisma.user.findUnique({ where: { referral_code: referred_by_code } });
        //         if (referrer) referred_by = referrer.id;
        //     }



        //     const newUser = await this.prisma.user.create({
        //         data: {
        //             name,
        //             email: email ?? null,
        //             phone: phone ?? null,
        //             password: hashedPassword,
        //             role_id: finalRoleId,
        //             auth_method: auth_method ?? 'email',
        //             referral_code,
        //             referred_by: referred_by ?? null
        //         },
        //         select: {
        //             id: true,
        //             name: true,
        //             email: true,
        //             phone: true,
        //             role: {
        //                 select: {
        //                     id: true,
        //                     role: true,
        //                 },
        //             },
        //         },
        //     });

        //     const token = this.jwtService.sign(payload);

        //     if (referred_by) {
        //         await this.prisma.user.update({
        //             where: { id: referred_by },
        //             data: {
        //                 points: { increment: 10 }
        //             }
        //         })
        //     }
        //     return {
        //         success: true,
        //         user: newUser,
        //         token,
        //     };

        // } catch (error: any) {
        //     return {
        //         success: false,
        //         message: error.message,
        //     };
        // }
    }



    async login(loginUserDto: LoginUserDto) {
       
    }


    async profile(user: any) {
        // try {
        //     const fullUser = await this.prisma.user.findUnique({
        //         where: {
        //             id: user.userId || user.sub,
        //         },
        //         select: {
        //             id: true,
        //             name: true,
        //             username: true,
        //             identifier: true,
        //             phone: true,
        //             address: true,
        //             gender: true,
        //             avatar: true,
        //             roleId: true,
        //             isActive: true,
        //             createdAt: true,
        //             lastLoginAt: true,
        //         },
        //     });

        //     return fullUser;

        // } catch (error) {
        //     throw error
        // }
    }
}
