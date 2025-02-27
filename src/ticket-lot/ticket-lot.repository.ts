import { Injectable } from '@nestjs/common';
import { Prisma, TicketLot } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateTicketLotDto } from './dto/create-ticket-lot.dto';
import { PaginationQueryDto } from './dto/pagination-query.dto';

@Injectable()
export class TicketLotRepository {
  constructor(private readonly prisma: PrismaService) {}

  async createTicketLot(data: CreateTicketLotDto): Promise<TicketLot> {
    const { ticketTypeId, ...rest } = data;
    return this.prisma.ticketLot.create({
      data: {
        ...rest,
        ticketType: { connect: { id: ticketTypeId } },
      },
    });
  }

  async findTicketLotById(id: string): Promise<TicketLot | null> {
    return this.prisma.ticketLot.findUnique({
      where: { id },
    });
  }

  async findAllTicketLots({
    skip,
    take,
  }: PaginationQueryDto): Promise<TicketLot[]> {
    return this.prisma.ticketLot.findMany({
      skip,
      take,
    });
  }

  async findTicketLotsByTicketType(ticketTypeId: string): Promise<TicketLot[]> {
    return this.prisma.ticketLot.findMany({
      where: { ticketTypeId },
    });
  }

  async updateTicketLot(
    id: string,
    data: Prisma.TicketLotUpdateInput,
  ): Promise<TicketLot> {
    return this.prisma.ticketLot.update({
      where: { id },
      data,
    });
  }

  async deleteTicketLot(id: string): Promise<TicketLot> {
    return this.prisma.ticketLot.delete({
      where: { id },
    });
  }
}
