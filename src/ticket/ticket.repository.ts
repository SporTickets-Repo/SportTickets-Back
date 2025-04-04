import { Injectable } from '@nestjs/common';
import { TransactionStatus } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class TicketRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findTicketsByUser(userId: string) {
    return this.prisma.ticket.findMany({
      where: {
        userId,
        transaction: {
          status: {
            in: [TransactionStatus.APPROVED],
          },
        },
      },
      select: {
        id: true,
        price: true,
        code: true,
        createdAt: true,
        updatedAt: true,
        transaction: {
          select: {
            id: true,
            status: true,
            createdAt: true,
          },
        },
        ticketLot: {
          include: {
            ticketType: {
              include: {
                event: {
                  select: {
                    id: true,
                    name: true,
                    startDate: true,
                    endDate: true,
                    slug: true,
                    description: true,
                    place: true,
                    bannerUrl: true,
                    smallImageUrl: true,
                    type: true,
                    status: true,
                  },
                },
              },
            },
          },
        },
        category: true,
        personalizedFieldAnswers: {
          select: {
            id: true,
            personalizedFieldId: true,
            answer: true,
            personalizedField: {
              select: {
                id: true,
                requestTitle: true,
              },
            },
          },
        },
        coupon: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            sex: true,
            phone: true,
            profileImageUrl: true,
            documentType: true,
            document: true,
            bornAt: true,
          },
        },
      },
    });
  }

  async findAllTickets(userId: string) {
    return this.prisma.ticket.findMany({
      where: {
        ticketLot: {
          ticketType: {
            event: {
              OR: [
                { createdBy: userId },
                {
                  eventDashboardAccess: {
                    some: { userId },
                  },
                },
              ],
            },
          },
        },
        transaction: {
          status: {
            in: [TransactionStatus.APPROVED],
          },
        },
      },
      select: {
        id: true,
        price: true,
        code: true,
        createdAt: true,
        updatedAt: true,
        transaction: {
          select: {
            id: true,
            status: true,
            createdAt: true,
          },
        },
        ticketLot: {
          include: {
            ticketType: {
              include: {
                event: {
                  select: {
                    id: true,
                    name: true,
                    startDate: true,
                    endDate: true,
                    slug: true,
                    place: true,
                    type: true,
                    status: true,
                  },
                },
              },
            },
          },
        },
        category: true,
        personalizedFieldAnswers: {
          select: {
            id: true,
            personalizedFieldId: true,
            answer: true,
            personalizedField: {
              select: {
                id: true,
                requestTitle: true,
              },
            },
          },
        },
        coupon: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            sex: true,
            phone: true,
            profileImageUrl: true,
            documentType: true,
            document: true,
            bornAt: true,
          },
        },
        team: {
          include: {
            tickets: {
              select: {
                user: {
                  select: {
                    id: true,
                    name: true,
                    email: true,
                    document: true,
                  },
                },
              },
            },
          },
        },
      },
    });
  }
}
