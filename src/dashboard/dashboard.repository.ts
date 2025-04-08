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

  async addListAccess(userIds: string[], eventId: string) {
    const existingAccesses = await this.prisma.eventDashboardAccess.findMany({
      where: { eventId },
    });
    const existingUserIds = existingAccesses.map((acc) => acc.userId);

    const toDelete = existingUserIds.filter((id) => !userIds.includes(id));
    const toAdd = userIds.filter((id) => !existingUserIds.includes(id));

    const deleteOps = toDelete.map((userId) =>
      this.prisma.eventDashboardAccess.delete({
        where: {
          userId_eventId: {
            userId,
            eventId,
          },
        },
      }),
    );

    const validUsers = await this.prisma.user.findMany({
      where: {
        id: { in: toAdd },
      },
      select: { id: true },
    });

    const validUserIds = validUsers.map((user) => user.id);

    const addOps = validUserIds.map((userId) =>
      this.prisma.eventDashboardAccess.create({
        data: {
          userId,
          eventId,
        },
      }),
    );

    return this.prisma.$transaction([...deleteOps, ...addOps]);
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
