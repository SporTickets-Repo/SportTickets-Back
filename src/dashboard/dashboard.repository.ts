import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class DashboardRepository {
  constructor(private readonly prisma: PrismaService) {}

  async addAccess(userId: string, eventId: string) {
    return this.prisma.eventDashboardAccess.create({
      data: {
        userId,
        eventId,
      },
    });
  }

  async removeAccess(userId: string, eventId: string) {
    return this.prisma.eventDashboardAccess.deleteMany({
      where: {
        userId,
        eventId,
      },
    });
  }

  async findUsersByEvent(eventId: string) {
    const dashboardAccessList = await this.prisma.eventDashboardAccess.findMany(
      {
        where: { eventId },
        include: {
          user: true,
        },
      },
    );

    return dashboardAccessList.map((access) => access.user);
  }

  async findEventsByUser(userId: string) {
    const dashboardAccessList = await this.prisma.eventDashboardAccess.findMany(
      {
        where: { userId },
        include: {
          event: true,
        },
      },
    );

    return dashboardAccessList.map((access) => access.event);
  }
}
