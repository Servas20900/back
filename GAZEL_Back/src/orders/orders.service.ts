import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CartService } from '../cart/cart.service';
import { CreateOrderDto, CreateGuestOrderDto, UpdateOrderStatusDto } from './dtos';

@Injectable()
export class OrdersService {
  constructor(
    private prisma: PrismaService,
    private cartService: CartService,
  ) {}

  async createOrder(id_user: number, createOrderDto: CreateOrderDto) {
    const {
      id_cart,
      full_name,
      identification,
      phone,
      email,
      province,
      canton,
      district,
      address_details,
      delivery_notes,
      shipping_method,
      payment_method,
      total_amount,
    } = createOrderDto;

    // Obtener carrito
    const cart = await this.prisma.cart.findUnique({
      where: { id_cart },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!cart || cart.id_user !== id_user) {
      throw new BadRequestException('Carrito no válido');
    }

    if (cart.items.length === 0) {
      throw new BadRequestException('El carrito está vacío');
    }

    // Verificar stock de todos los productos
    for (const item of cart.items) {
      if (item.product.stock < item.quantity) {
        throw new BadRequestException(
          `Stock insuficiente para ${item.product.name}`,
        );
      }
    }

    // Crear la orden en una transacción
    const order = await this.prisma.$transaction(async (prisma: any) => {
      // Crear orden
      const newOrder = await prisma.order.create({
        data: {
          id_user,
          total_amount: parseFloat(total_amount),
          status: 'PENDING',
          items: {
            create: cart.items.map((item: any) => ({
              id_product: item.id_product,
              quantity: item.quantity,
              unit_price: parseFloat(item.unit_price.toString()),
            })),
          },
        },
        include: {
          items: {
            include: {
              product: true,
            },
          },
        },
      });

      // Crear info de envío
      await prisma.shippingInfo.create({
        data: {
          id_order: newOrder.id_order,
          full_name,
          identification,
          phone,
          email,
          province,
          canton,
          district,
          address_details,
          delivery_notes,
          shipping_method,
        },
      });

      // Crear pago
      await prisma.payment.create({
        data: {
          id_order: newOrder.id_order,
          payment_method,
          amount: parseFloat(total_amount),
        },
      });

      // Reducir stock de productos
      for (const item of cart.items) {
        await prisma.product.update({
          where: { id_product: item.id_product },
          data: {
            stock: {
              decrement: item.quantity,
            },
          },
        });
      }

      // Marcar carrito como procesado
      await prisma.cart.update({
        where: { id_cart },
        data: { status: 'CHECKED_OUT' },
      });

      return newOrder;
    });

    return order;
  }

  async getOrderById(id_order: number, id_user: number) {
    const order = await this.prisma.order.findUnique({
      where: { id_order },
      include: {
        items: {
          include: {
            product: true,
          },
        },
        shipping: true,
        payments: true,
        user: {
          select: {
            id_user: true,
            email: true,
            full_name: true,
          },
        },
      },
    });

    if (!order) {
      throw new NotFoundException('Orden no encontrada');
    }

    if (order.id_user !== id_user) {
      throw new BadRequestException('No tienes acceso a esta orden');
    }

    return order;
  }

  async getUserOrders(id_user: number) {
    return this.prisma.order.findMany({
      where: { id_user },
      include: {
        items: {
          include: {
            product: true,
          },
        },
        shipping: true,
        payments: true,
      },
      orderBy: {
        order_date: 'desc',
      },
    });
  }

  async getAllOrders() {
    return this.prisma.order.findMany({
      include: {
        user: {
          select: {
            full_name: true,
            email: true,
            phone: true,
          },
        },
        items: {
          include: {
            product: true,
          },
        },
        shipping: true,
        payments: true,
      },
      orderBy: {
        order_date: 'desc',
      },
    });
  }

  async updateOrderStatus(id_order: number, updateOrderStatusDto: UpdateOrderStatusDto) {
    const order = await this.prisma.order.findUnique({
      where: { id_order },
    });

    if (!order) {
      throw new NotFoundException('Orden no encontrada');
    }

    return this.prisma.order.update({
      where: { id_order },
      data: { status: updateOrderStatusDto.status as any },
      include: {
        items: {
          include: {
            product: true,
          },
        },
        shipping: true,
        payments: true,
      },
    });
  }

  async createGuestOrder(createGuestOrderDto: CreateGuestOrderDto) {
    const {
      full_name,
      phone,
      email,
      address,
      items,
      total_amount,
      payment_method = 'CASH_ON_DELIVERY',
    } = createGuestOrderDto;

    // Verificar que todos los productos existen y tienen stock suficiente
    for (const item of items) {
      const product = await this.prisma.product.findUnique({
        where: { id_product: item.id_product },
      });

      if (!product) {
        throw new BadRequestException(`Producto ${item.id_product} no encontrado`);
      }

      if (product.stock < item.quantity) {
        throw new BadRequestException(
          `Stock insuficiente para ${product.name}. Disponible: ${product.stock}, solicitado: ${item.quantity}`,
        );
      }
    }

    // Crear la orden sin usuario (id_user = null para invitados)
    const order = await this.prisma.$transaction(async (prisma: any) => {
      // Crear orden sin id_user
      const newOrder = await prisma.order.create({
        data: {
          id_user: null, // NULL para órdenes de invitados
          total_amount: total_amount,
          status: 'PENDING',
          items: {
            create: items.map((item: any) => ({
              id_product: item.id_product,
              quantity: item.quantity,
              unit_price: item.unit_price,
            })),
          },
        },
        include: {
          items: {
            include: {
              product: true,
            },
          },
        },
      });

      // Crear info de envío básica para invitados
      await prisma.shippingInfo.create({
        data: {
          id_order: newOrder.id_order,
          full_name,
          phone,
          email,
          province: 'N/A', // Valor por defecto para invitados
          canton: 'N/A',
          district: 'N/A',
          address_details: address,
          shipping_method: 'STANDARD',
        },
      });

      // Crear pago
      await prisma.payment.create({
        data: {
          id_order: newOrder.id_order,
          payment_method: payment_method,
          amount: total_amount,
        },
      });

      // Reducir stock de productos
      for (const item of items) {
        await prisma.product.update({
          where: { id_product: item.id_product },
          data: {
            stock: {
              decrement: item.quantity,
            },
          },
        });
      }

      return newOrder;
    });

    return order;
  }
}
