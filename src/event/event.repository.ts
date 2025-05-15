import { Injectable } from '@nestjs/common';
import { AddressEvent, Event, EventStatus, Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateEventDto } from './dto/create-event.dto';
import { EventWithRelations } from './dto/event-with-relations.dto';
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
        ticketTypes: {
          where: { deletedAt: null },
          include: {
            ticketLots: {
              where: { deletedAt: null },
            },
            categories: {
              where: { deletedAt: null },
            },
            personalizedFields: {
              where: { deletedAt: null },
            },
          },
        },
        coupons: {
          where: { deletedAt: null },
        },
        bracket: true,
        address: true,
        ranking: true,
        terms: {
          where: { deletedAt: null },
          orderBy: { createdAt: 'asc' },
        },
        eventDashboardAccess: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                role: true,
                profileImageUrl: true,
              },
            },
          },
        },
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
      where: {
        OR: [
          { createdBy: userId },
          {
            eventDashboardAccess: {
              some: { userId },
            },
          },
        ],

        status: { not: EventStatus.CANCELLED },
      },
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

  async findEventBySlug(slug: string): Promise<EventWithRelations | null> {
    const now = new Date();

    const event = await this.prisma.event.findUnique({
      where: { slug },
      include: {
        ticketTypes: {
          where: { deletedAt: null },
          include: {
            ticketLots: {
              where: {
                deletedAt: null,
                isActive: true,
                startDate: { lte: now },
                endDate: { gte: now },
              },
            },
            categories: {
              where: { deletedAt: null },
            },
            personalizedFields: {
              where: { deletedAt: null },
            },
          },
        },
        bracket: true,
        address: true,
        ranking: true,
      },
    });

    if (!event) return null;

    const filteredTicketTypes = event.ticketTypes.map((tt) => ({
      ...tt,
      ticketLots: tt.ticketLots.filter(
        (lot) => lot.soldQuantity < lot.quantity,
      ),
      categories: tt.categories.filter(
        (cat) => cat.soldQuantity < cat.quantity,
      ),
    }));

    return {
      ...event,
      ticketTypes: filteredTicketTypes,
    };
  }

  async findFilteredEvents(filters: FilterEventsDto): Promise<Event[]> {
    const { name, startDate, minPrice, maxPrice, type } = filters;

    const where: Prisma.EventWhereInput = {};
    where.status = {
      in: [
        EventStatus.REGISTRATION,
        EventStatus.PROGRESS,
        EventStatus.FINISHED,
      ],
    };

    if (name) {
      where.name = {
        contains: name,
        mode: 'insensitive',
      };
    }

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
        eventFee: 0.1,
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

  async findActiveLot(ticketTypeId: string) {
    const now = new Date();

    const lot = await this.prisma.ticketLot.findFirst({
      where: {
        ticketTypeId,
        isActive: true,
        startDate: { lte: now },
        endDate: { gte: now },
      },
      orderBy: {
        startDate: 'asc',
      },
    });

    return lot;
  }
}
