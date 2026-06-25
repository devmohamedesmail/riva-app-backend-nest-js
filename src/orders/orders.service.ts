import {
    BadRequestException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SocketGateway } from '../socket/socket.gateway';
import { NotificationsService } from '../notifications/notifications.service';
import { SendMailService } from '../send-mail/send-mail.service';
import { PushNotificationService } from '../push-notification/push-notification.service';
import { CreateGroupOrderDto } from './dto/create-group-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';


@Injectable()
export class OrdersService {

    constructor(
        private prisma: PrismaService,
        private socketGateway: SocketGateway,
        private notificationService: NotificationsService,
        private mailService: SendMailService,
        private pushService: PushNotificationService,
    ) { }

    /**
     * Create Group Order
     */
    async createGroupOrder(dto: CreateGroupOrderDto) {
        const {
            stores,
            customer_name,
            phone,
            delivery_address,
            area_id,
            area_name,
            user_id,
            delivery_fee,
        } = dto;

        const groupCode =
            'RIVA-' + Math.random().toString(36).substring(2, 8).toUpperCase();

        const result = await this.prisma.$transaction(async (tx) => {
            // 1. Create Order Group
            const orderGroup = await tx.orderGroup.create({
                data: {
                    group_code: groupCode,
                    user_id: user_id ?? null,
                    customer_name: customer_name ?? null,
                    phone: phone ?? null,
                    delivery_address: delivery_address ?? null,
                    area_id: area_id ?? null,
                    area_name: area_name ?? null,
                    delivery_fee: delivery_fee ?? 0,
                },
            });

            const orders: any[] = [];

            // 2. Loop Stores
            for (const store of stores ?? []) {
                if (!store?.store_id) continue;

                // 2.1 Create Order
                const order = await tx.order.create({
                    data: {
                        order_group_id: orderGroup.id,
                        store_id: store.store_id,
                        user_id: user_id ?? null,
                        total_price: store.total_price ?? 0,
                        status: 'pending',
                    },
                });

                // 2.2 Create Items safely
                const items = (store.items ?? [])
                    .filter((item) => item && item.name)
                    .map((item) => ({
                        order_id: order.id,
                        name: item.name ?? '',
                        price: item.price ?? 0,
                        quantity: item.quantity ?? 1,
                        image: item.image ?? null,
                        attribute_name: item.selectedAttribute?.name ?? null,
                        attribute_value: item.selectedAttribute?.value ?? null,
                        attribute_price: item.selectedAttribute?.price ?? null,
                    }));

                if (items.length > 0) {
                    await tx.orderItem.createMany({
                        data: items,
                    });
                }

                // orders.push(order);
                orders.push({
                    ...order,
                    items,
                });
            }

            return { orderGroup, orders };
        });

        // 3. Notifications (outside transaction)
        // if (!user_id) {
        //     throw new Error('user_id is required');
        // }
        // try {
        //     for (const order of result.orders) {
        //         await this.sendOrderNotification(
        //             order,
        //             user_id,
        //             customer_name,
        //             order.store_id,
        //         );
        //     }
        // } catch (err) {
        //     console.error('Socket notification error:', err);
        // }

        try {
            if (user_id) {
                for (const order of result.orders) {
                    await this.sendOrderNotification(
                        order,
                        user_id,
                        customer_name,
                        order.store_id,
                    );
                }
            }
            console.log('Socket notifications sent successfully');
        } catch (err) {
            console.log('Socket notification error:', err);
        }

      

        await this.handleOrderEmail(
            result.orderGroup,
            result.orders,
        );

        return {
            success: true,
            order_group: result.orderGroup,
            orders: result.orders,
        };
    }

    /**
     * Get Orders
     */
    async index(query: any) {
        const page = Number(query.page) || 1;
        const per_page = Number(query.per_page) || 10;

        const skip = (page - 1) * per_page;

        const status = query.status;
        const store_id = query.store_id
            ? Number(query.store_id)
            : undefined;

        const where: any = {};

        if (status || store_id) {
            where.orders = {
                some: {
                    ...(status && { status }),
                    ...(store_id && { store_id }),
                },
            };
        }

        const total = await this.prisma.orderGroup.count({
            where,
        });

        const orderGroups =
            await this.prisma.orderGroup.findMany({
                where,

                select: {
                    id: true,
                    group_code: true,
                    customer_name: true,
                    phone: true,
                    delivery_address: true,
                    area_name: true,
                    delivery_fee: true,
                    payment_method: true,
                    createdAt: true,
                    status: true,

                    orders: {
                        select: {
                            id: true,
                            total_price: true,
                            status: true,
                            store_id: true,
                            delivered_at: true,

                            store: {
                                select: {
                                    id: true,
                                    name: true,
                                    address: true,
                                    phone: true,
                                },
                            },

                            user: {
                                select: {
                                    id: true,
                                    name: true,
                                    email: true,
                                    phone: true,
                                },
                            },

                            orderItems: {
                                select: {
                                    id: true,
                                    name: true,
                                    image: true,
                                    price: true,
                                    quantity: true,
                                    attribute_name: true,
                                    attribute_value: true,
                                    attribute_price: true,
                                },
                            },
                        },
                    },
                },

                orderBy: {
                    createdAt: 'desc',
                },

                skip,
                take: per_page,
            });

        const formatted = orderGroups.map((group) => {
            const total_price = group.orders.reduce(
                (sum, order) => sum + order.total_price,
                0,
            );

            return {
                order_group_id: group.id,
                group_code: group.group_code,
                customer_name: group.customer_name,
                phone: group.phone,
                delivery_address: group.delivery_address,
                area_name: group.area_name,
                delivery_fee: group.delivery_fee,
                payment_method: group.payment_method,
                status: group.status,
                createdAt: group.createdAt,
                total_price,
                orders: group.orders,
            };
        });

        return {
            success: true,
            data: {
                orders: formatted,
                pagination: {
                    current_page: page,
                    per_page,
                    total_orders: total,
                    total_pages: Math.ceil(total / per_page),
                },
            },
        };
    }



    async getDailyOrders(query: any) {
        const page = Number(query.page) || 1;
        const limit = Number(query.limit) || 10;

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const orderGroups = await this.prisma.orderGroup.findMany({
            where: {
                createdAt: {
                    gte: today,
                    lt: tomorrow,
                },
            },

            include: {
                orders: {
                    select: {
                        id: true,
                        total_price: true,
                        status: true,
                        createdAt: true,

                        store: {
                            select: {
                                id: true,
                                name: true,
                                address: true,
                                phone: true,
                            },
                        },

                        orderItems: {
                            select: {
                                id: true,
                                name: true,
                                image: true,
                                price: true,
                                quantity: true,
                                attribute_name: true,
                                attribute_value: true,
                                attribute_price: true,
                            },
                        },
                    },
                },
            },

            orderBy: {
                createdAt: 'desc',
            },
        });

        const formatted = orderGroups.map((group) => {
            const total_price = group.orders.reduce(
                (sum, order) => sum + order.total_price,
                0,
            );

            return {
                order_group_id: group.id,
                group_code: group.group_code,
                customer_name: group.customer_name,
                phone: group.phone,
                delivery_address: group.delivery_address,
                createdAt: group.createdAt,
                area_name: group.area_name,
                delivery_fee: group.delivery_fee,
                status: group.status,
                total_price,
                orders: group.orders,
            };
        });

        return {
            success: true,
            data: formatted,
            pagination: {
                current_page: page,
                per_page: limit,
                total_orders: formatted.length,
                total_pages: Math.ceil(formatted.length / limit),
            },
        };
    }

    /**
     * Find Order
     */
    async find(id: number) {
        const order = await this.prisma.order.findUnique({
            where: { id },

            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        phone: true,
                    },
                },

                store: {
                    select: {
                        id: true,
                        name: true,
                        address: true,
                        phone: true,
                    },
                },
            },
        });

        if (!order) {
            throw new NotFoundException(
                'Order not found',
            );
        }

        return {
            success: true,
            data: order,
        };
    }

    /**
     * Get User Orders
     */
    async getUserOrders(
        user_id: number,
        query: any,
    ) {
        const page = Number(query.page ?? 1);

        const limit = Number(query.limit ?? 10);

        const status = query.status;

        const where: any = { user_id };

        if (status) {
            where.status = status;
        }

        const [orders, total] = await Promise.all([
            this.prisma.order.findMany({
                where,

                skip: (page - 1) * limit,

                take: limit,

                include: {
                    store: {
                        select: {
                            id: true,
                            name: true,
                            address: true,
                            phone: true,
                        },
                    },
                },
            }),

            this.prisma.order.count({ where }),
        ]);

        return {
            success: true,

            data: {
                orders,

                pagination: {
                    current_page: page,
                    per_page: limit,
                    total_orders: total,
                    total_pages: Math.ceil(total / limit),
                },
            },
        };
    }


    async getStoreOrders(
        store_id: number,
        query: any,
    ) {
        const page = Number(query.page) || 1;
        const per_page = Number(query.per_page) || 10;

        const skip = (page - 1) * per_page;

        const total = await this.prisma.orderGroup.count({
            where: {
                orders: {
                    some: {
                        store_id,
                    },
                },
            },
        });

        const orders = await this.prisma.orderGroup.findMany({
            where: {
                orders: {
                    some: {
                        store_id,
                    },
                },
            },

            select: {
                id: true,
                group_code: true,
                customer_name: true,
                phone: true,
                delivery_address: true,
                area_name: true,
                delivery_fee: true,
                status: true,

                orders: {
                    where: {
                        store_id,
                    },

                    select: {
                        id: true,
                        total_price: true,
                        status: true,

                        orderItems: {
                            select: {
                                id: true,
                                name: true,
                                image: true,
                                price: true,
                                quantity: true,
                                attribute_name: true,
                                attribute_value: true,
                                attribute_price: true,
                            },
                        },
                    },
                },
            },

            orderBy: {
                createdAt: 'desc',
            },

            skip,
            take: per_page,
        });

        return {
            success: true,
            data: orders,
            pagination: {
                current_page: page,
                per_page,
                total_orders: total,
                total_pages: Math.ceil(total / per_page),
            },
        };
    }

    /**
     * Update Order Status
     */
    async updateStatus(
        id: number,
        dto: UpdateOrderStatusDto,
    ) {
        const validStatuses = [
            'pending',
            'accepted',
            'preparing',
            'on_the_way',
            'delivered',
            'cancelled',
        ];

        if (!validStatuses.includes(dto.status)) {
            throw new BadRequestException(
                `Invalid status: ${dto.status}`,
            );
        }

        const data: any = {
            status: dto.status,
        };

        if (dto.status === 'delivered') {
            data.delivered_at = new Date();
        }

        const order = await this.prisma.order.update({
            where: { id },
            data,
        });

        // create notification
        const notification =
            await this.prisma.notification.create({
                data: {
                    title:
                        'notification.order_status.title',

                    message:
                        'notification.order_status.message',

                    data: {
                        order_id: order.id,
                        status: dto.status,
                    },
                },
            });

        await this.prisma.notificationAudience.create({
            data: {
                notification_id: notification.id,
                target_type: 'user',
                target_id: order.user_id,
            },
        });

        // socket
        this.socketGateway.server
            .to(`user_${order.user_id}`)
            .emit('order_status_updated', {
                notification,
                order,
            });

        return {
            success: true,
            data: order,
        };
    }

    /**
     * Delete Order
     */
    async destroy(id: number) {
        await this.prisma.order.delete({
            where: { id },
        });

        return {
            success: true,
            message: 'Order deleted successfully',
        };
    }

    /**
     * Statistics
     */
    async statistics(query: any) {
        const store_id = query.store_id
            ? Number(query.store_id)
            : undefined;

        const user_id = query.user_id
            ? Number(query.user_id)
            : undefined;

        const where: any = {};

        if (store_id) {
            where.store_id = store_id;
        }

        if (user_id) {
            where.user_id = user_id;
        }

        const totalOrders =
            await this.prisma.order.count({
                where,
            });

        return {
            success: true,
            data: {
                total_orders: totalOrders,
            },
        };
    }

    /**
     * Send Order Notification
     */
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


    async getTodayStoreOrders(
        store_id: number,
        query: any,
    ) {
        const page = Number(query.page) || 1;
        const per_page = Number(query.per_page) || 10;
        const skip = (page - 1) * per_page;

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const total = await this.prisma.orderGroup.count({
            where: {
                createdAt: {
                    gte: today,
                    lt: tomorrow,
                },
                orders: {
                    some: {
                        store_id,
                    },
                },
            },
        });

        const orders = await this.prisma.orderGroup.findMany({
            where: {
                createdAt: {
                    gte: today,
                    lt: tomorrow,
                },
                orders: {
                    some: {
                        store_id,
                    },
                },
            },

            select: {
                id: true,
                group_code: true,
                customer_name: true,
                phone: true,
                delivery_address: true,
                area_name: true,
                delivery_fee: true,
                createdAt: true,
                status: true,

                orders: {
                    where: {
                        store_id,
                    },

                    select: {
                        total_price: true,
                        status: true,

                        orderItems: {
                            select: {
                                id: true,
                                name: true,
                                image: true,
                                price: true,
                                quantity: true,
                                attribute_name: true,
                                attribute_value: true,
                                attribute_price: true,
                            },
                        },
                    },
                },
            },

            orderBy: {
                createdAt: 'desc',
            },

            skip,
            take: per_page,
        });

        return {
            success: true,
            data: orders,
            pagination: {
                current_page: page,
                per_page,
                total_orders: total,
                total_pages: Math.ceil(total / per_page),
            },
        };
    }


    // =========================== extra services ===========================
    private async handleOrderEmail(
        orderGroup: any,
        orders: any[],
    ): Promise<void> {
        try {
            await this.mailService.sendOrderEmail({
                orderGroup,
                orders,
            });

            // this.logger.log('Order email sent successfully');
            console.log('Order email sent successfully');
        } catch (error) {
            // this.logger.error(
            //     'Order email failed',
            //     error?.stack,
            // );
            console.log('Order email failed', error);
        }
    }
}
