import { Controller, UseGuards, Post, Body, Delete, Req } from '@nestjs/common';
import { UserDevicesService } from './user-devices.service';
import { JwtAuthGuard } from '../auth/jwt/jwt.guard';
import { RegisterDeviceDto } from './dto/register-device.dto';
import { RemoveDeviceDto } from './dto/remove-device.dto';

@Controller('/api/v1/devices')
export class UserDevicesController {
    constructor(private readonly service: UserDevicesService) { }


    @UseGuards(JwtAuthGuard)
    @Post('register')
    registerDevice(@Req() req: any, @Body() dto: RegisterDeviceDto) {
        const userId = req.user?.id;
        return this.service.registerDevice(userId, dto);
    }

    @UseGuards(JwtAuthGuard)
    @Delete('logout')
    removeDevice(@Req() req: any, @Body() dto: RemoveDeviceDto) {
        const userId = req.user?.id;
        return this.service.removeDevice(userId, dto.pushToken);
    }
}
