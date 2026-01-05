import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { CreateCategoryDto, UpdateCategoryDto } from './dtos';

@Injectable()
export class CategoriesService {
  constructor(
    private prisma: PrismaService,
    private cloudinary: CloudinaryService,
  ) {}

  async findAll() {
    return this.prisma.category.findMany({
      orderBy: {
        name: 'asc',
      },
    });
  }

  async findById(id: number) {
    const category = await this.prisma.category.findUnique({
      where: { id_category: id },
    });

    if (!category) {
      throw new NotFoundException('Categoría no encontrada');
    }

    return category;
  }

  async create(createCategoryDto: CreateCategoryDto, file?: Express.Multer.File) {
    let image_url = createCategoryDto.image_url;

    if (file) {
      const uploadResult = await this.cloudinary.uploadImage(file);
      image_url = uploadResult.url;
    }

    return this.prisma.category.create({
      data: {
        ...createCategoryDto,
        image_url,
      },
    });
  }

  async update(id: number, updateCategoryDto: UpdateCategoryDto, file?: Express.Multer.File) {
    await this.findById(id);

    let image_url = updateCategoryDto.image_url;

    if (file) {
      const uploadResult = await this.cloudinary.uploadImage(file);
      image_url = uploadResult.url;
    }

    return this.prisma.category.update({
      where: { id_category: id },
      data: {
        ...updateCategoryDto,
        image_url,
      },
    });
  }

  async delete(id: number) {
    await this.findById(id);

    return this.prisma.category.delete({
      where: { id_category: id },
    });
  }
}
