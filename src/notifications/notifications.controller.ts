import {  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,} from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { GetNotificationsDto } from './dto/get-notifications.dto';
import { MarkAsReadDto } from './dto/mark-as-read.dto';
import { CreateNotificationDto } from './dto/create-notification.dto';

@Controller('/api/v1/notifications')
export class NotificationsController {
    constructor(
    private readonly notificationService: NotificationsService,
  ) {}

  @Get()
  getNotifications(@Query() query: GetNotificationsDto) {
    return this.notificationService.getNotifications(query);
  }

  @Get('unread')
  getUnreadNotifications(@Query() query: GetNotificationsDto) {
    return this.notificationService.getUnreadNotifications(query);
  }

  @Put('read/:id')
  markAsRead(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: MarkAsReadDto,
  ) {
    return this.notificationService.markAsRead(id, dto);
  }

  @Delete(':id')
  deleteNotification(
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.notificationService.deleteNotification(id);
  }

  @Post('all')
  createForAll(@Body() dto: CreateNotificationDto) {
    return this.notificationService.createForAll(dto);
  }
}
