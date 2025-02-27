import { Injectable } from '@nestjs/common';
import { Prisma, TicketType } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class TicketTypeRepository {
  constructor(private readonly prisma: PrismaService) {}

  async createTicketType(
    data: Prisma.TicketTypeCreateInput,
  ): Promise<TicketType> {
    return this.prisma.ticketType.create({ data });
  }

  async findTicketTypeById(id: string): Promise<TicketType | null> {
    return this.prisma.ticketType.findUnique({
      where: { id },
    });
  }

  async findAllTicketTypes(skip: number, take: number): Promise<TicketType[]> {
    return this.prisma.ticketType.findMany({
      skip,
      take,
    });
  }

  async findAllTicketTypesByEvent(eventId: string): Promise<TicketType[]> {
    return this.prisma.ticketType.findMany({
      where: { eventId },
    });
  }

  async updateTicketType(
    id: string,
    data: Prisma.TicketTypeUpdateInput,
  ): Promise<TicketType> {
    return this.prisma.ticketType.update({
      where: { id },
      data,
    });
  }

  async deleteTicketType(id: string): Promise<TicketType> {
    return this.prisma.ticketType.delete({
      where: { id },
    });
  }
}
