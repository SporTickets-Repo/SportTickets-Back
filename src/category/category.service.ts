import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { CategoryRepository } from './category.repository';

@Injectable()
export class CategoryService {
  constructor(private readonly categoryRepository: CategoryRepository) {}

  async create(createDto: CreateCategoryDto) {
    return this.categoryRepository.createCategory(createDto);
  }

  async findOne(id: string) {
    const category = await this.categoryRepository.findCategoryById(id);
    if (!category) {
      throw new NotFoundException(`Category with id ${id} not found`);
    }
    return category;
  }

  async findAll(query: { skip?: number; take?: number }) {
    const skip = query.skip ? Number(query.skip) : 0;
    const take = query.take ? Number(query.take) : 10;
    return this.categoryRepository.findAllCategories(skip, take);
  }

  async findAllByTicketType(ticketTypeId: string) {
    return this.categoryRepository.findAllCategoriesByTicketType(ticketTypeId);
  }

  async update(id: string, updateDto: UpdateCategoryDto) {
    const updated = await this.categoryRepository.updateCategory(id, updateDto);
    if (!updated) {
      throw new NotFoundException(`Category with id ${id} not found`);
    }
    return updated;
  }

  async delete(id: string) {
    const deleted = await this.categoryRepository.deleteCategory(id);
    if (!deleted) {
      throw new NotFoundException(`Category with id ${id} not found`);
    }
    return { message: 'Category deleted successfully' };
  }
}
