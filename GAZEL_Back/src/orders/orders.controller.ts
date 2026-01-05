import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  UseGuards,
  Param,
  ParseIntPipe,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto, CreateGuestOrderDto, UpdateOrderStatusDto } from './dtos';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { AdminGuard } from '../common/guards/admin.guard';
import { GetUser } from '../common/decorators/get-user.decorator';

@Controller('orders')
export class OrdersController {
  constructor(private ordersService: OrdersService) {}

  @Post('guest')
  async createGuestOrder(@Body() createGuestOrderDto: CreateGuestOrderDto) {
    return this.ordersService.createGuestOrder(createGuestOrderDto);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  async createOrder(
    @GetUser('id_user') id_user: number,
    @Body() createOrderDto: CreateOrderDto,
  ) {
    return this.ordersService.createOrder(id_user, createOrderDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  async getUserOrders(@GetUser('id_user') id_user: number) {
    return this.ordersService.getUserOrders(id_user);
  }

  @Get('admin/all')
  @UseGuards(JwtAuthGuard, AdminGuard)
  async getAllOrders() {
    return this.ordersService.getAllOrders();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async getOrderById(
    @GetUser('id_user') id_user: number,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.ordersService.getOrderById(id, id_user);
  }

  @Put(':id/status')
  @UseGuards(JwtAuthGuard, AdminGuard)
  async updateOrderStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateOrderStatusDto: UpdateOrderStatusDto,
  ) {
    return this.ordersService.updateOrderStatus(id, updateOrderStatusDto);
  }
}
