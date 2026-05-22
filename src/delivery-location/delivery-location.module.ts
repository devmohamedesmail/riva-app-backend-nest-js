import { Module } from '@nestjs/common';
import { DeliveryLocationService } from './delivery-location.service';
import { DeliveryLocationController } from './delivery-location.controller';

@Module({
  providers: [DeliveryLocationService],
  controllers: [DeliveryLocationController]
})
export class DeliveryLocationModule {}
