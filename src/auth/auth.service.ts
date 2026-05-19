import { LoginUserDto } from './dto/login-user.dto';
import { Injectable, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { RegisterUserDto } from './dto/register-user.dto';
import { PrismaService } from 'src/prisma.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
    constructor(private readonly prisma: PrismaService, private readonly jwtService: JwtService) { }


    async register(registerUserDto: RegisterUserDto) {
        try {
            const existingUser = await this.prisma.user.findUnique({
                where: {
                    identifier: registerUserDto.identifier
                }
            });

            if (existingUser) {
                throw new BadRequestException('Email or username already exists');
            }

            // generate username from name
            const baseUsername = registerUserDto.name
                .toLowerCase()
                .replace(/\s+/g, '');

            let username = baseUsername;
            let counter = 1;

            while (true) {
                const user = await this.prisma.user.findUnique({
                    where: { username }
                });

                if (!user) break;

                username = `${baseUsername}${counter}`;
                counter++;
            }

            // hash password
            const hashedPassword = await bcrypt.hash(registerUserDto.password, 10);

            const newUser = await this.prisma.user.create({
                data: {
                    name: registerUserDto.name,
                    identifier: registerUserDto.identifier,
                    username: username,
                    password: hashedPassword,
                    roleId: 2
                }
            });

            const payload = {
                sub: newUser.id,
                username: newUser.username,
            };

            const token = this.jwtService.sign(payload);

            // const { password, ...result } = newUser;

            return {
                success: true,
                user: {
                    id: newUser.id,
                    name: newUser.name,
                    roleId: newUser.roleId,
                },
                token,
                
            };


        } catch (error) {
            throw error;
        }
    }



    async login(loginUserDto: LoginUserDto) {
        try {
            // 1. find user by identifier (email/phone)
            const user = await this.prisma.user.findUnique({
                where: {
                    identifier: loginUserDto.identifier,
                },
            });

            if (!user) {
                throw new UnauthorizedException('Invalid credentials');
            }

            // 2. check password
            const isPasswordValid = await bcrypt.compare(
                loginUserDto.password,
                user.password,
            );

            if (!isPasswordValid) {
                throw new UnauthorizedException('Invalid credentials');
            }


            // 3. generate JWT token
            const payload = {
                sub: user.id,
                username: user.username,
            };

            const token = this.jwtService.sign(payload);

            // 4. return only token + username
            return {
                success: true,
                token,
                username: user.username,
            };
        } catch (error) {
            throw error
        }
    }


    async profile(user: any) {
        try {
            const fullUser = await this.prisma.user.findUnique({
                where: {
                    id: user.userId || user.sub,
                },
                select: {
                    id: true,
                    name: true,
                    username: true,
                    identifier: true,
                    phone: true,
                    address: true,
                    gender: true,
                    avatar: true,
                    roleId: true,
                    isActive: true,
                    createdAt: true,
                    lastLoginAt: true,
                },
            });

            return fullUser;

        } catch (error) {
            throw error
        }
    }
}
