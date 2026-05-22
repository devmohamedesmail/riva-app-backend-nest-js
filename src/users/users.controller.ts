import { Controller, Get, Delete, Param, ParseIntPipe, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt/jwt.guard';
import { UsersService } from './users.service';
@Controller('/api/v1/users')
export class UsersController {
    constructor(private readonly userService: UsersService) { }

    @UseGuards(JwtAuthGuard)
    @Get()
    findAll() {
        return this.userService.findAll();
    }




    @UseGuards(JwtAuthGuard)
    @Get('statistics')
    getStatistics() {
        return this.userService.getStatistics();
    }

    @Get('profile/:id')
    getProfile(@Param('id', ParseIntPipe) id: number) {
        return this.userService.getProfile(id);
    }

    @UseGuards(JwtAuthGuard)
    @Get('role/:role_name')
    getByRole(@Param('role_name') role_name: string) {
        return this.userService.getByRole(role_name);
    }

    @UseGuards(JwtAuthGuard)
    @Get(':id')
    findOne(@Param('id', ParseIntPipe) id: number) {
        return this.userService.findOne(id);
    }

    @UseGuards(JwtAuthGuard)
    @Delete(':id')
    remove(@Param('id', ParseIntPipe) id: number) {
        return this.userService.remove(id);
    }
}
