import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class TransactionRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string) {
    return this.prisma.transaction.findUnique({
      where: { id },
      include: {
        tickets: true,
      },
    });
  }

  async findByUserEvents(userId: string) {
    return this.prisma.transaction.findMany({
      where: {
        tickets: {
          some: {
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
          },
        },
      },
      include: {
        tickets: {
          include: {
            ticketLot: {
              include: {
                ticketType: true,
              },
            },
          },
        },
      },
    });
  }
}
