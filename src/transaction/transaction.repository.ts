import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class TransactionRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string) {
    return this.prisma.transaction.findUnique({
      where: { id },
      select: {
        id: true,
        createdAt: true,
        updatedAt: true,
        status: true,
        createdById: true,
        paymentMethod: true,
        externalPaymentId: true,
        externalStatus: true,
        pixQRCode: true,
        response: false,
        totalValue: true,
        paymentProvider: true,
        paidAt: true,
        refundedAt: true,
        cancelledAt: true,
        tickets: {
          include: {
            ticketLot: {
              include: {
                ticketType: true,
              },
            },
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
        },
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
      select: {
        id: true,
        createdAt: true,
        updatedAt: true,
        status: true,
        createdById: true,
        paymentMethod: true,
        externalPaymentId: true,
        externalStatus: true,
        pixQRCode: true,
        response: false,
        totalValue: true,
        paymentProvider: true,
        paidAt: true,
        tickets: {
          include: {
            ticketLot: {
              include: {
                ticketType: true,
              },
            },
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
        },
      },
    });
  }
}
