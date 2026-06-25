import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { SocketGateway } from '../../socket/socket.gateway';
import { PushNotificationService } from '../push-notification/push-notification.service';

@Injectable()
export class OrderNotificationService {




    constructor(
        private prisma: PrismaService,
        private socketGateway: SocketGateway,
        private pushService: PushNotificationService,
    ) { }




    async sendOrderNotification(
        order: any,
        user_id: number,
        customer_name: string,
        store_id: number,
    ) {
        try {
            const notification =
                await this.prisma.notification.create({
                    data: {
                        title:
                            'notifications.new_order_title',

                        message:
                            'notifications.new_order_message',

                        data: {
                            order_id: order.id,
                            user_id,
                            customer_name,
                        },
                    },
                });

            const [store, admins, drivers] =
                await Promise.all([
                    this.prisma.store.findUnique({
                        where: {
                            id: Number(store_id),
                        },

                        include: {
                            user: {
                                include: {
                                    userDevices: true,
                                },
                            },
                        },
                    }),

                    this.prisma.user.findMany({
                        where: {
                            role: {
                                role: 'admin',
                            },
                        },

                        include: {
                            userDevices: true,
                        },
                    }),

                    this.prisma.user.findMany({
                        where: {
                            vehicle: {
                                is_active: true,
                            },
                        },

                        include: {
                            userDevices: true,
                        },
                    }),
                ]);

            await this.prisma.notificationAudience.create({
                data: {
                    notification_id: notification.id,
                    target_type: 'store',
                    target_id: Number(store?.user?.id),
                },
            });

            this.socketGateway.server
                .to(`store_${store_id}`)
                .emit('new_order', {
                    notification,
                    order,
                });

            // push notification
            const storeTokens =
                store?.user?.userDevices.map(
                    (d) => d.pushToken,
                ) ?? [];

            const adminTokens = admins.flatMap((u) =>
                u.userDevices.map((d) => d.pushToken),
            );

            const driverTokens = drivers.flatMap((u) =>
                u.userDevices.map((d) => d.pushToken),
            );

            const uniqueTokens = [
                ...new Set([
                    ...storeTokens,
                    ...adminTokens,
                    ...driverTokens,
                ]),
            ];

            await this.pushService.sendPushNotification(
                uniqueTokens,
                'New Order',
                `New order from ${customer_name}`,
                {
                    order_id: order.id,
                },
            );
        } catch (error) {
            console.log(error);
        }
    }
}
