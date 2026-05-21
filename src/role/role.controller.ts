import { Controller, Post, Body, Patch, Param, Get, Delete, Query } from '@nestjs/common';
import { RoleService } from './role.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt/jwt.guard';
// import { JwtAuthGuard } from 'src/auth/jwt/jwt.guard';  
// import { JwtAuthGuard } from 'src/auth/jwt/jwt.guard';   

@Controller('/api/v1/roles')
export class RoleController {
    constructor(private readonly roleService: RoleService) { }
   

     
    @Get('all')
    async allRoles() {
        return this.roleService.allRoles();
    }
@UseGuards(JwtAuthGuard)
    @Post('create')
    async createRole(@Body() body: CreateRoleDto) {
        return this.roleService.create(body);
    }


@UseGuards(JwtAuthGuard)
    @Patch('update/:id')
    async update(@Param('id') id: string, @Body() body: UpdateRoleDto) {
        return this.roleService.update(+id, body)
    }


    @UseGuards(JwtAuthGuard)
    @Get('statistics')
    statistics() {
        return this.roleService.statistics();
    }

    @UseGuards(JwtAuthGuard)
    @Get(':id')
    find(@Param('id') id: string) {
        return this.roleService.find(Number(id));
    }


    @UseGuards(JwtAuthGuard)
    @Delete(':id')
    delete(@Param('id') id: string) {
        return this.roleService.delete(Number(id));
    }


    @UseGuards(JwtAuthGuard)
    @Get(':id/users')
    getUsersByRole(
        @Param('id') id: string,
        @Query('page') page = '1',
        @Query('limit') limit = '10',
    ) {
        return this.roleService.getUsersByRole(
            Number(id),
            Number(page),
            Number(limit),
        );
    }
}
