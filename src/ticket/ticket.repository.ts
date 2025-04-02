import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class TicketRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findTicketsByUser(userId: string) {
    return this.prisma.ticket.findMany({
      where: { userId },
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
      },
    });
  }
}
