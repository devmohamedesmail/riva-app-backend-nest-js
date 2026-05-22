import { Module } from '@nestjs/common';
import { UserDevicesService } from './user-devices.service';
import { UserDevicesController } from './user-devices.controller';

@Module({
  providers: [UserDevicesService],
  controllers: [UserDevicesController]
})
export class UserDevicesModule {}
