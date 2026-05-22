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


@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }), AuthModule, RoleModule, PermissionModule, CloudinaryModule, PrismaModule, SettingsModule, UsersModule, UserDevicesModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
