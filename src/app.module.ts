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


@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }), AuthModule, RoleModule, PermissionModule, CloudinaryModule, PrismaModule, SettingsModule, UsersModule, UserDevicesModule, BannersModule, PlacesModule, AreasModule, StoreTypesModule, CategoriesModule, ProductsModule, ProductAttributesModule, ReviewsModule, AddressModule, DeliveryLocationModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
