import { Controller,Get,UseGuards,Req ,Delete,Post,Body} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt/jwt.guard';
import { CreateDeliveryLocationDto } from './dto/create-delivery-location.dto';
import { DeliveryLocationService } from './delivery-location.service';

@Controller('/api/v1/delivery-locations')
export class DeliveryLocationController {
    constructor(
    private readonly deliveryLocationService: DeliveryLocationService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Post('location')
  upsertLocation(@Req() req, @Body() dto: CreateDeliveryLocationDto) {
    return this.deliveryLocationService.upsertLocation(req.user.id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('location')
  getMyLocation(@Req() req) {
    return this.deliveryLocationService.getMyLocation(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  deleteLocation(@Req() req) {
    return this.deliveryLocationService.deleteLocation(req.user.id);
  }
}
