import { Injectable, NotFoundException } from '@nestjs/common';

import { CreatePersonalizedFieldDto } from './dto/create-personalized-fields.dto';
import { UpdatePersonalizedFieldDto } from './dto/update-personalized-fields.dto';
import { PersonalizedFieldRepository } from './personalized-fields.repository';

@Injectable()
export class PersonalizedFieldService {
  constructor(private readonly repository: PersonalizedFieldRepository) {}

  async create(createDto: CreatePersonalizedFieldDto) {
    return this.repository.createPersonalizedField(createDto);
  }

  async findAllByTicketType(ticketTypeId: string) {
    return this.repository.findAllByTicketType(ticketTypeId);
  }

  async update(id: string, updateDto: UpdatePersonalizedFieldDto) {
    const personalizedField =
      await this.repository.findPersonalizedFieldById(id);
    if (!personalizedField) {
      throw new NotFoundException(`PersonalizedField with id ${id} not found`);
    }

    const updated = await this.repository.updatePersonalizedField(
      id,
      updateDto,
    );

    return updated;
  }

  async delete(id: string) {
    const personalizedField =
      await this.repository.findPersonalizedFieldById(id);

    if (!personalizedField) {
      throw new NotFoundException(`PersonalizedField with id ${id} not found`);
    }

    await this.repository.deletePersonalizedField(id);

    return { message: 'PersonalizedField deleted successfully' };
  }
}
