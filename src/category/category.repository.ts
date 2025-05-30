import { Injectable } from '@nestjs/common';
import { Category } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoryRepository {
  constructor(private readonly prisma: PrismaService) {}

  async createCategory(data: CreateCategoryDto): Promise<Category> {
    return this.prisma.category.create({
      data: {
        ticketTypeId: data.ticketTypeId,
        title: data.title,
        quantity: data.quantity,
      },
    });
  }

  async findCategoryById(id: string): Promise<Category | null> {
    return this.prisma.category.findUnique({
      where: { id },
    });
  }

  async findAllCategories(skip: number, take: number): Promise<Category[]> {
    return this.prisma.category.findMany({
      skip,
      take,
    });
  }

  async findAllCategoriesByTicketType(
    ticketTypeId: string,
  ): Promise<Category[]> {
    return this.prisma.category.findMany({
      where: { ticketTypeId },
    });
  }

  async updateCategory(
    id: string,
    data: UpdateCategoryDto,
  ): Promise<Category | null> {
    return this.prisma.category.update({
      where: { id },
      data,
    });
  }

  async deleteCategory(id: string): Promise<Category | null> {
    return this.prisma.category.delete({
      where: { id },
    });
  }
}
