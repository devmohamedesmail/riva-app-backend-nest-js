import { Injectable,NotFoundException,BadRequestException } from '@nestjs/common';
import { GetNotificationsDto } from './dto/get-notifications.dto';
import { PrismaService } from '../prisma/prisma.service';
import { MarkAsReadDto } from './dto/mark-as-read.dto';
import { CreateNotificationDto } from './dto/create-notification.dto';

import { SocketGateway } from '../socket/socket.gateway';

@Injectable()
export class NotificationsService {
constructor(
    private prisma: PrismaService,
    private socketGateway: SocketGateway,
  ) {}

    async getNotifications(query: GetNotificationsDto) {
    const { target_type, target_id } = query;

    if (!target_type) {
      throw new BadRequestException('target_type is required');
    }

    const notifications = await this.prisma.notification.findMany({
      where: {
        OR: [
          {
            audiences: {
              some: {
                target_type,
                target_id: target_id ? Number(target_id) : null,
              },
            },
          },
          {
            audiences: {
              some: {
                target_type: 'all',
              },
            },
          },
        ],
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return {
      success: true,
      data: notifications,
    };
  }

  async getUnreadNotifications(query: GetNotificationsDto) {
    const { target_type, target_id, user_id } = query;

    if (!target_type) {
      throw new BadRequestException('target_type is required');
    }

    const userIdNum = user_id ? Number(user_id) : null;

    const notifications = await this.prisma.notification.findMany({
      where: {
        AND: [
          {
            OR: [
              {
                audiences: {
                  some: {
                    target_type,
                    target_id: target_id ? Number(target_id) : null,
                  },
                },
              },
              {
                audiences: {
                  some: {
                    target_type: 'all',
                  },
                },
              },
            ],
          },

          ...(userIdNum
            ? [
                {
                  NOT: {
                    reads: {
                      some: {
                        user_id: userIdNum,
                      },
                    },
                  },
                },
              ]
            : []),
        ],
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return {
      success: true,
      data: notifications,
    };
  }

  async markAsRead(id: number, dto: MarkAsReadDto) {
    const existing = await this.prisma.notificationRead.findUnique({
      where: {
        notification_id_user_id: {
          notification_id: id,
          user_id: dto.user_id,
        },
      },
    });

    if (!existing) {
      await this.prisma.notificationRead.create({
        data: {
          notification_id: id,
          user_id: dto.user_id,
          read_at: new Date(),
        },
      });
    } else {
      await this.prisma.notificationRead.update({
        where: {
          notification_id_user_id: {
            notification_id: id,
            user_id: dto.user_id,
          },
        },
        data: {
          read_at: new Date(),
        },
      });
    }

    return {
      success: true,
      message: `Notification ${id} marked as read`,
    };
  }

  async deleteNotification(id: number) {
    const notification = await this.prisma.notification.findUnique({
      where: {
        id,
      },
    });

    if (!notification) {
      throw new NotFoundException(`Notification ${id} not found`);
    }

    await this.prisma.notification.delete({
      where: {
        id,
      },
    });

    return {
      success: true,
      message: `Notification ${id} deleted`,
    };
  }

  async createForAll(dto: CreateNotificationDto) {
    const notification = await this.prisma.notification.create({
      data: {
        title: dto.title,
        message: dto.message,
        data: dto.data ?? null,

        audiences: {
          create: {
            target_type: 'all',
            target_id: null,
          },
        },
      },
    });

    this.socketGateway.server.emit(
      'new_notification',
      notification,
    );

    return {
      success: true,
      data: notification,
    };
  }
}
