import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { RoleModule } from './role/role.module';
import { ConfigModule } from '@nestjs/config';
import { PermissionModule } from './permission/permission.module';
import { CloudinaryModule } from './cloudinary/cloudinary.module';
import { PrismaModule } from './prisma/prisma.module';
import { SettingsModule } from './settings/settings.module';
import { UsersModule } from './users/users.module';
import { UserDevicesModule } from './user-devices/user-devices.module';
import { BannersModule } from './banners/banners.module';
import { PlacesModule } from './places/places.module';
import { AreasModule } from './areas/areas.module';
import { StoreTypesModule } from './store-types/store-types.module';
import { CategoriesModule } from './categories/categories.module';
import { ProductsModule } from './products/products.module';
import { ProductAttributesModule } from './product-attributes/product-attributes.module';
import { ReviewsModule } from './reviews/reviews.module';
import { AddressModule } from './address/address.module';
import { DeliveryLocationModule } from './delivery-location/delivery-location.module';
import { NotificationsModule } from './notifications/notifications.module';
import { SocketModule } from './socket/socket.module';
import { OrdersModule } from './orders/orders.module';
import { SendMailService } from './send-mail/send-mail.service';
import { PushNotificationService } from './push-notification/push-notification.service';
import { PushNotificationModule } from './push-notification/push-notification.module';
import { SendMailModule } from './send-mail/send-mail.module';
import { VehiclesModule } from './vehicles/vehicles.module';
import { StoresModule } from './stores/stores.module';


@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }), AuthModule, RoleModule, PermissionModule, CloudinaryModule, PrismaModule, SettingsModule, UsersModule, UserDevicesModule, BannersModule, PlacesModule, AreasModule, StoreTypesModule, CategoriesModule, ProductsModule, ProductAttributesModule, ReviewsModule, AddressModule, DeliveryLocationModule, NotificationsModule,SocketModule, OrdersModule, PushNotificationModule, SendMailModule, VehiclesModule, StoresModule],
  controllers: [AppController],
  providers: [AppService, SendMailService, PushNotificationService],
})
export class AppModule { }
