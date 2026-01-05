import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { CreateProductDto, UpdateProductDto, ProductFilterDto } from './dtos';

@Injectable()
export class ProductsService {
  constructor(
    private prisma: PrismaService,
    private cloudinaryService: CloudinaryService,
  ) {}

  async findAll(filters?: ProductFilterDto) {
    const where: any = {};

    if (filters?.id_category) {
      where.id_category = filters.id_category;
    }

    if (filters?.status) {
      where.status = filters.status;
    }

    if (filters?.search) {
      where.OR = [
        { name: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    return this.prisma.product.findMany({
      where,
      include: {
        category: true,
      },
      orderBy: {
        created_at: 'desc',
      },
    });
  }

  async findById(id: number) {
    const product = await this.prisma.product.findUnique({
      where: { id_product: id },
      include: {
        category: true,
      },
    });

    if (!product) {
      throw new NotFoundException('Producto no encontrado');
    }

    return product;
  }

  async findByCategory(id_category: number) {
    return this.prisma.product.findMany({
      where: {
        id_category,
        status: 'ACTIVE',
      },
      include: {
        category: true,
      },
    });
  }

  async create(createProductDto: CreateProductDto, file?: Express.Multer.File) {
    // Verificar que la categoría existe
    const category = await this.prisma.category.findUnique({
      where: { id_category: createProductDto.id_category },
    });

    if (!category) {
      throw new NotFoundException('Categoría no encontrada');
    }

    let imageUrl = createProductDto.image_url;

    // Si se proporcionó un archivo, subirlo a Cloudinary
    if (file) {
      this.cloudinaryService.validateImage(file);
      const uploadResult = await this.cloudinaryService.uploadImage(file, 'products');
      imageUrl = uploadResult.url;
    }

    return this.prisma.product.create({
      data: {
        name: createProductDto.name,
        description: createProductDto.description,
        price: parseFloat(createProductDto.price),
        stock: createProductDto.stock || 0,
        image_url: imageUrl,
        id_category: createProductDto.id_category,
      },
      include: {
        category: true,
      },
    });
  }

  async update(id: number, updateProductDto: UpdateProductDto, file?: Express.Multer.File) {
    // Verificar que el producto existe
    const existingProduct = await this.findById(id);

    // Si se actualiza la categoría, verificar que existe
    if (updateProductDto.id_category) {
      const category = await this.prisma.category.findUnique({
        where: { id_category: updateProductDto.id_category },
      });

      if (!category) {
        throw new NotFoundException('Categoría no encontrada');
      }
    }

    const data: any = { ...updateProductDto };
    if (data.price) {
      data.price = parseFloat(data.price);
    }

    // Si se proporcionó un nuevo archivo, actualizar la imagen en Cloudinary
    if (file) {
      this.cloudinaryService.validateImage(file);
      const uploadResult = await this.cloudinaryService.updateImage(
        file,
        existingProduct.image_url ?? undefined,
        'products',
      );
      data.image_url = uploadResult.url;
    }

    return this.prisma.product.update({
      where: { id_product: id },
      data,
      include: {
        category: true,
      },
    });
  }

  async delete(id: number) {
    const product = await this.findById(id);

    // Eliminar la imagen de Cloudinary si existe
    if (product.image_url) {
      try {
        const publicId = this.cloudinaryService.extractPublicId(product.image_url);
        await this.cloudinaryService.deleteImage(publicId);
      } catch (error) {
        console.error('Error al eliminar la imagen de Cloudinary:', error);
        // No lanzamos error para no bloquear la eliminación del producto
      }
    }

    return this.prisma.product.delete({
      where: { id_product: id },
    });
  }
}
