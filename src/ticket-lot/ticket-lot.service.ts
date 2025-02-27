import { Injectable, NotFoundException } from '@nestjs/common';

import { TicketTypeRepository } from 'src/ticket-types/ticket-types.repository';
import { CreateTicketLotDto } from './dto/create-ticket-lot.dto';
import { PaginationQueryDto } from './dto/pagination-query.dto';
import { UpdateTicketLotDto } from './dto/update-ticket-lot.dto';
import { TicketLotRepository } from './ticket-lot.repository';

@Injectable()
export class TicketLotService {
  constructor(
    private readonly ticketLotRepository: TicketLotRepository,
    private readonly ticketTypeRepository: TicketTypeRepository,
  ) {}

  async create(createDto: CreateTicketLotDto) {
    const ticketTypeExist = await this.ticketTypeRepository.findTicketTypeById(
      createDto.ticketTypeId,
    );

    if (!ticketTypeExist) {
      throw new NotFoundException(
        `TicketType with id ${createDto.ticketTypeId} not found`,
      );
    }

    return this.ticketLotRepository.createTicketLot(createDto);
  }

  async findOne(id: string) {
    const ticketLot = await this.ticketLotRepository.findTicketLotById(id);
    if (!ticketLot) {
      throw new NotFoundException(`TicketLot with id ${id} not found`);
    }
    return ticketLot;
  }

  async findAll(query: PaginationQueryDto) {
    return this.ticketLotRepository.findAllTicketLots(query);
  }

  async findAllByTicketType(ticketTypeId: string) {
    return this.ticketLotRepository.findTicketLotsByTicketType(ticketTypeId);
  }

  async update(id: string, updateDto: UpdateTicketLotDto) {
    const updated = await this.ticketLotRepository.updateTicketLot(
      id,
      updateDto,
    );
    if (!updated) {
      throw new NotFoundException(`TicketLot with id ${id} not found`);
    }
    return updated;
  }

  async delete(id: string) {
    const ticketLotExist = await this.ticketLotRepository.findTicketLotById(id);

    if (!ticketLotExist) {
      throw new NotFoundException(`TicketLot with id ${id} not found`);
    }

    await this.ticketLotRepository.deleteTicketLot(id);

    return { message: 'TicketLot deleted successfully' };
  }
}
