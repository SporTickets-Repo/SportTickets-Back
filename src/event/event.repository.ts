import { Injectable } from '@nestjs/common';
import { AddressEvent, Event, EventStatus, Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateEventDto } from './dto/create-event.dto';
import { FilterEventsDto } from './dto/filter-events.dto';

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

  async createEventAddress(addressData: AddressEvent) {
    return this.prisma.addressEvent.create({
      data: {
        ...addressData,
      },
    });
  }

  async findEventById(id: string): Promise<Event | null> {
    return this.prisma.event.findUnique({
      where: { id },
      include: {
        ticketTypes: true,
        coupons: {
          where: { deletedAt: null },
        },
        bracket: true,
        address: true,
        eventDashboardAccess: true,
        ranking: true,
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
        ranking: true,
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
      include: {
        ticketTypes: {
          include: {
            ticketLots: true,
            categories: true,
            personalizedFields: true,
          },
        },
        bracket: true,
        address: true,
      },
    });
  }

  async findFilteredEvents(filters: FilterEventsDto): Promise<Event[]> {
    const { name, startDate, minPrice, maxPrice, type } = filters;

    // Construção do objeto "where"
    const where: Prisma.EventWhereInput = {};

    // 1) Filtro por título (pesquisa parcial "contains", case insensitive)
    if (name) {
      where.name = {
        contains: name,
        mode: 'insensitive',
      };
    }

    // 2) Filtro de data (startDate)
    if (startDate) {
      const startOfDay = new Date(startDate);
      startOfDay.setHours(0, 0, 0, 0);

      const endOfDay = new Date(startDate);
      endOfDay.setHours(23, 59, 59, 999);

      where.startDate = {
        gte: startOfDay,
        lte: endOfDay,
      };
    }

    // 3) Filtro por faixa de preço (ticketTypes -> ticketLots)
    if (minPrice !== undefined || maxPrice !== undefined) {
      where.ticketTypes = {
        some: {
          ticketLots: {
            some: {
              price: {
                gte: minPrice ?? 0,
                lte: maxPrice ?? Number.MAX_SAFE_INTEGER,
              },
            },
          },
        },
      };
    }

    // 4) Filtro por tipo de evento
    if (type) {
      where.type = type;
    }

    return this.prisma.event.findMany({
      where,
      include: {
        ticketTypes: {
          include: {
            ticketLots: true,
          },
        },
        user: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findEmptyEventByUser(userId: string): Promise<Event | null> {
    return this.prisma.event.findFirst({
      where: {
        createdBy: userId,
        slug: null,
        name: null,
        place: null,
        description: null,
        startDate: null,
        endDate: null,
        regulation: null,
        additionalInfo: null,
        address: null,
        smallImageUrl: null,
        bannerUrl: null,
        coupons: { none: {} },
        bracket: { none: {} },
        ticketTypes: { none: {} },
        eventDashboardAccess: { none: {} },
      },
    });
  }

  async createEmptyEvent(userId: string): Promise<Event> {
    return this.prisma.event.create({
      data: {
        createdBy: userId,
        slug: null,
        name: null,
        place: null,
        description: null,
        regulation: null,
        additionalInfo: null,
        bannerUrl: null,
        smallImageUrl: null,
        startDate: null,
        endDate: null,
      },
    });
  }

  async userHasEventPermission(
    userId: string,
    eventId: string,
  ): Promise<boolean> {
    const event = await this.prisma.event.findFirst({
      where: {
        id: eventId,
        OR: [
          { createdBy: userId },
          {
            eventDashboardAccess: {
              some: { userId },
            },
          },
        ],
      },
    });

    return !!event;
  }

  async getEventStatus(eventId: string): Promise<EventStatus> {
    const event = await this.prisma.event.findUnique({
      where: { id: eventId },
      select: { status: true },
    });

    if (!event) {
      throw new Error(`Event with ID ${eventId} not found`);
    }

    return event.status;
  }

  async setStatus(eventId: string, status: EventStatus): Promise<Event> {
    return this.prisma.event.update({
      where: { id: eventId },
      data: { status },
    });
  }
}
