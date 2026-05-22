import { Module } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { SocketModule } from '../socket/socket.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { SendMailModule } from '../send-mail/send-mail.module';
import { PushNotificationModule } from '../push-notification/push-notification.module';

@Module({
   imports: [
      SocketModule,
      NotificationsModule,
      SendMailModule,
      PushNotificationModule,
    ],
  providers: [OrdersService],
  controllers: [OrdersController]
})
export class OrdersModule {}
