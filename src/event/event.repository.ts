import { Injectable } from '@nestjs/common';
import { Event, Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateEventDto } from './dto/create-event.dto';

@Injectable()
export class EventRepository {
  constructor(private readonly prisma: PrismaService) {}

  async createEvent(data: CreateEventDto, userId: string): Promise<Event> {
    return this.prisma.event.create({
      data: {
        ...data,
        createdBy: userId,
      },
    });
  }

  async findEventById(id: string): Promise<Event | null> {
    return this.prisma.event.findUnique({
      where: { id },
      include: {
        ticketTypes: true,
        coupons: true,
        bracket: true,
      },
    });
  }

  async findAllEvents(
    skip: number,
    take: number,
    filter?: string,
    sort?: string,
  ): Promise<Event[]> {
    return this.prisma.event.findMany({
      skip,
      take,
      where: filter ? { name: { contains: filter, mode: 'insensitive' } } : {},
      orderBy: sort ? { [sort]: 'asc' } : {},
    });
  }

  async findUserEvents(userId: string): Promise<Event[]> {
    return this.prisma.event.findMany({
      where: { createdBy: userId },
      include: {
        ticketTypes: true,
        coupons: true,
        bracket: true,
      },
    });
  }

  async updateEvent(id: string, data: Prisma.EventUpdateInput): Promise<Event> {
    return this.prisma.event.update({
      where: { id },
      data,
    });
  }

  async deleteEvent(id: string): Promise<Event> {
    return this.prisma.event.delete({
      where: { id },
    });
  }

  async findEventBySlug(slug: string): Promise<Event | null> {
    return this.prisma.event.findUnique({
      where: { slug },
    });
  }
}
