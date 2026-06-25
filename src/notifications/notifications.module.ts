import { Module } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { NotificationsController } from './notifications.controller';
import { SocketModule } from '../socket/socket.module';
import { OrderNotificationService } from './order-notification/order-notification.service';
import { PushNotificationService } from './push-notification/push-notification.service';

@Module({
  imports: [
    SocketModule,
  ],
  providers: [NotificationsService, OrderNotificationService, PushNotificationService],
  controllers: [NotificationsController],
  exports: [
    NotificationsService,
    PushNotificationService,
    OrderNotificationService],
})
export class NotificationsModule {}
