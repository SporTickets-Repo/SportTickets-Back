import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateTicketTypeDto } from './dto/create-ticket-type.dto';
import { UpdateTicketTypeDto } from './dto/update-ticket-type.dto';
import { TicketTypeRepository } from './ticket-types.repository';

@Injectable()
export class TicketTypeService {
  constructor(private readonly ticketTypeRepository: TicketTypeRepository) {}

  async create(createDto: CreateTicketTypeDto) {
    return this.ticketTypeRepository.createTicketType(createDto);
  }

  async findOne(id: string) {
    const ticketType = await this.ticketTypeRepository.findTicketTypeById(id);
    if (!ticketType) {
      throw new NotFoundException(`TicketType with id ${id} not found`);
    }
    return ticketType;
  }

  async findAll(query: { skip?: number; take?: number }) {
    const skip = query.skip ? Number(query.skip) : 0;
    const take = query.take ? Number(query.take) : 10;
    return this.ticketTypeRepository.findAllTicketTypes(skip, take);
  }

  async findAllByEvent(eventId: string) {
    return this.ticketTypeRepository.findAllTicketTypesByEvent(eventId);
  }

  async update(id: string, updateDto: UpdateTicketTypeDto) {
    const updated = await this.ticketTypeRepository.updateTicketType(
      id,
      updateDto,
    );
    if (!updated) {
      throw new NotFoundException(`TicketType with id ${id} not found`);
    }
    return updated;
  }

  async delete(id: string) {
    const deleted = await this.ticketTypeRepository.deleteTicketType(id);
    if (!deleted) {
      throw new NotFoundException(`TicketType with id ${id} not found`);
    }
    return { message: 'TicketType deleted successfully' };
  }
}
