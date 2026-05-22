import {  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query, } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateGroupOrderDto } from './dto/create-group-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';

@Controller('orders')
export class OrdersController {
    constructor(
    private readonly ordersService: OrdersService,
  ) {}

  @Get()
  index(@Query() query: any) {
    return this.ordersService.index(query);
  }

  @Get('statistics')
  statistics(@Query() query: any) {
    return this.ordersService.statistics(query);
  }

  @Get(':id')
  find(@Param('id') id: string) {
    return this.ordersService.find(Number(id));
  }

  @Get('user/:user_id')
  getUserOrders(
    @Param('user_id') user_id: string,
    @Query() query: any,
  ) {
    return this.ordersService.getUserOrders(
      Number(user_id),
      query,
    );
  }

  @Post('create-group')
  createGroupOrder(
    @Body() dto: CreateGroupOrderDto,
  ) {
    return this.ordersService.createGroupOrder(
      dto,
    );
  }

  @Patch(':id/status')
  updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateOrderStatusDto,
  ) {
    return this.ordersService.updateStatus(
      Number(id),
      dto,
    );
  }

  @Delete(':id')
  destroy(@Param('id') id: string) {
    return this.ordersService.destroy(
      Number(id),
    );
  }
}
