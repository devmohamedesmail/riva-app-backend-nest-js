import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    ParseIntPipe,
    Post,
    Put,
    Req,
    UseGuards,
} from '@nestjs/common';
import { AddressService } from './address.service';
import { JwtAuthGuard } from '../auth/jwt/jwt.guard';
import { CreateAddressDto } from './dto/create-address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';

@Controller('/api/v1/address')
export class AddressController {
    constructor(private readonly addressService: AddressService) { }


    @UseGuards(JwtAuthGuard)
    @Post('create')
    create(@Req() req, @Body() dto: CreateAddressDto) {
        return this.addressService.create(req.user.id, dto);
    }

    @UseGuards(JwtAuthGuard)
    @Get()
    getAll(@Req() req) {
        return this.addressService.getAll(req.user.id);
    }

    @UseGuards(JwtAuthGuard)
    @Get(':id')
    getOne(
        @Req() req,
        @Param('id', ParseIntPipe) id: number,
    ) {
        return this.addressService.getOne(id, req.user.id);
    }

    @UseGuards(JwtAuthGuard)
    @Put(':id')
    update(
        @Req() req,
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: UpdateAddressDto,
    ) {
        return this.addressService.update(id, req.user.id, dto);
    }

    @UseGuards(JwtAuthGuard)
    @Delete(':id')
    remove(
        @Req() req,
        @Param('id', ParseIntPipe) id: number,
    ) {
        return this.addressService.remove(id, req.user.id);
    }
}
