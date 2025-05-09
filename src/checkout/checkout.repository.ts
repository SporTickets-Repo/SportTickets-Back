import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { Prisma, TransactionStatus, User } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';
import { PrismaService } from 'src/prisma/prisma.service';
import { generateRandomCode } from 'src/utils/generate';
import { CreateCheckoutDto } from './dto/create-checkout.dto';
import { TeamDto } from './dto/create-free-checkout.dto';
import { MercadoPagoPaymentResponse } from './dto/mercado-pago-payment-response';

@Injectable()
export class CheckoutRepository {
  private readonly logger = new Logger(CheckoutRepository.name);
  constructor(private readonly prisma: PrismaService) {}

  async performCheckout(dto: CreateCheckoutDto, user: User) {
    const { teams, couponId } = dto;
    const now = new Date();

    return this.prisma.$transaction(async (tx) => {
      let totalValue = new Decimal(0);

      const transaction = await tx.transaction.create({
        data: {
          status: 'PENDING',
          totalValue: totalValue,
          createdById: user.id,
          paymentMethod: dto.paymentData.paymentMethod,
        },
      });

      for (const team of teams) {
        const teamCreated = await tx.team.create({ data: {} });

        for (const player of team.player) {
          const lot = await tx.ticketLot.findFirst({
            where: {
              ticketTypeId: team.ticketTypeId,
              isActive: true,
              startDate: { lte: now },
              endDate: { gte: now },
              deletedAt: null,
            },
            orderBy: { startDate: 'asc' },
          });

          if (!lot) {
            throw new BadRequestException(
              'Nenhum lote ativo disponível para este tipo de ingresso.',
            );
          }

          let ticketPrice = new Decimal(lot.price);

          if (couponId) {
            const coupon = await tx.coupon.findUnique({
              where: { id: couponId },
            });

            if (coupon && coupon.isActive) {
              const discount = ticketPrice.mul(coupon.percentage);
              ticketPrice = ticketPrice.minus(discount);
            }
          }

          let code: string | undefined;
          let isUnique = false;

          while (!isUnique) {
            const generated = generateRandomCode();

            const existing = await tx.ticket.findUnique({
              where: { code: generated },
            });

            if (!existing) {
              code = generated;
              isUnique = true;
            }
          }

          const ticket = await tx.ticket.create({
            data: {
              userId: player.userId,
              transactionId: transaction.id,
              teamId: teamCreated.id,
              ticketLotId: lot.id,
              categoryId: player.categoryId,
              price: ticketPrice,
              code: code!,
              ...(couponId && { couponId }),
            },
          });

          await tx.personalizedFieldAnswer.createMany({
            data: player.personalFields.map((field) => ({
              ticketId: ticket.id,
              personalizedFieldId: field.personalizedFieldId,
              answer: field.answer,
            })),
          });

          totalValue = totalValue.add(ticketPrice);
        }
      }

      let eventFeePercentage = new Decimal(0);
      if (teams.length > 0) {
        const ticketType = await tx.ticketType.findUnique({
          where: { id: teams[0].ticketTypeId },
          include: { event: true },
        });
        if (ticketType && ticketType.event && ticketType.event.eventFee) {
          eventFeePercentage = new Decimal(ticketType.event.eventFee);
        }
      }

      const feeValue = totalValue.mul(eventFeePercentage);
      const finalTotal = totalValue.add(feeValue);

      await tx.transaction.update({
        where: { id: transaction.id },
        data: { totalValue: finalTotal },
      });

      const createdTransaction = await tx.transaction.findUnique({
        where: { id: transaction.id },
        include: {
          createdBy: true,
          tickets: {
            include: {
              ticketLot: {
                include: {
                  ticketType: true,
                },
              },
              personalizedFieldAnswers: {
                include: {
                  personalizedField: true,
                },
              },
              user: true,
              category: true,
              coupon: true,
            },
          },
        },
      });

      return createdTransaction;
    });
  }

  async performFreeCheckout(team: TeamDto, user: User) {
    const now = new Date();

    return this.prisma.$transaction(async (tx) => {
      const transaction = await tx.transaction.create({
        data: {
          status: TransactionStatus.APPROVED,
          totalValue: new Decimal(0),
          createdById: user.id,
          paymentMethod: 'FREE',
          externalStatus: 'free',
        },
      });

      const teamCreated = await tx.team.create({ data: {} });

      for (const player of team.player) {
        const lot = await tx.ticketLot.findFirst({
          where: {
            ticketTypeId: team.ticketTypeId,
            isActive: true,
            startDate: { lte: now },
            endDate: { gte: now },
            deletedAt: null,
          },
          orderBy: { startDate: 'asc' },
        });

        if (!lot) {
          throw new BadRequestException(
            'Nenhum lote ativo disponível para este tipo de ingresso.',
          );
        }

        /* gera código único */
        let code: string;
        do {
          code = generateRandomCode();
        } while (await tx.ticket.findUnique({ where: { code } }));

        const ticket = await tx.ticket.create({
          data: {
            userId: player.userId,
            transactionId: transaction.id,
            teamId: teamCreated.id,
            ticketLotId: lot.id,
            categoryId: player.categoryId,
            price: new Decimal(0),
            code,
          },
        });

        await tx.personalizedFieldAnswer.createMany({
          data: player.personalFields.map((f) => ({
            ticketId: ticket.id,
            personalizedFieldId: f.personalizedFieldId,
            answer: f.answer,
          })),
        });
      }

      return transaction;
    });
  }

  async updateCheckoutTransaction(gateway: MercadoPagoPaymentResponse) {
    const refundedAmount = gateway.transaction_amount_refunded || 0;

    let status = mapStatus(gateway.status);

    if (refundedAmount > 0) {
      status = TransactionStatus.REFUNDED;
    }

    const data: Prisma.TransactionUpdateInput = {
      externalPaymentId: gateway.id.toString(),
      externalStatus: gateway.status,
      status,
      pixQRCode:
        gateway.point_of_interaction?.transaction_data?.qr_code ?? null,
      response: JSON.parse(JSON.stringify(gateway)),
    };

    if (
      status === TransactionStatus.APPROVED ||
      status === TransactionStatus.AUTHORIZED
    ) {
      data.paidAt = data.paidAt ?? new Date();
    }

    if (status === TransactionStatus.CANCELLED) {
      data.cancelledAt = data.cancelledAt ?? new Date();
    }

    return this.prisma.transaction.update({
      where: { id: gateway.external_reference },
      data,
    });
  }

  async getTransactionWithTicketsByPaymentId(transactionId: string) {
    return this.prisma.transaction.findUnique({
      where: { id: transactionId },
      include: {
        tickets: {
          include: {
            user: true,
            ticketLot: {
              include: {
                ticketType: {
                  include: {
                    event: {
                      include: {
                        address: true,
                      },
                    },
                    personalizedFields: true,
                  },
                },
              },
            },
            category: true,
            team: {
              include: {
                tickets: {
                  include: {
                    user: true,
                  },
                },
              },
            },
            coupon: true,
            personalizedFieldAnswers: {
              include: { personalizedField: true },
            },
          },
        },
      },
    });
  }

  async markTicketAsDeliveredAndUpdateSoldQuantity(ticketId: string) {
    const ticket = await this.prisma.ticket.findUnique({
      where: { id: ticketId },
      select: {
        id: true,
        ticketLotId: true,
        categoryId: true,
        couponId: true,
      },
    });

    if (!ticket) {
      this.logger.warn(
        `Ticket not found for delivery | Ticket ID: ${ticketId}`,
      );
      throw new BadRequestException('Ticket not found.');
    }

    await this.prisma.$transaction([
      this.prisma.ticket.update({
        where: { id: ticket.id },
        data: { deliveredAt: new Date() },
      }),
      this.prisma.ticketLot.update({
        where: { id: ticket.ticketLotId },
        data: { soldQuantity: { increment: 1 } },
      }),
      this.prisma.category.update({
        where: { id: ticket.categoryId },
        data: { soldQuantity: { increment: 1 } },
      }),
      ...(ticket.couponId
        ? [
            this.prisma.coupon.update({
              where: { id: ticket.couponId },
              data: { soldQuantity: { increment: 1 } },
            }),
          ]
        : []),
    ]);

    const [lotAfter, categoryAfter, couponAfter] = await Promise.all([
      this.prisma.ticketLot.findUnique({
        where: { id: ticket.ticketLotId },
        select: { soldQuantity: true, id: true },
      }),
      this.prisma.category.findUnique({
        where: { id: ticket.categoryId },
        select: { soldQuantity: true, id: true },
      }),
      ticket.couponId
        ? this.prisma.coupon.findUnique({
            where: { id: ticket.couponId },
            select: { soldQuantity: true, id: true },
          })
        : null,
    ]);

    this.logger.log(
      `Ticket entregue com sucesso | Ticket ID: ${ticket.id} | Lote: ${lotAfter?.id} (${lotAfter?.soldQuantity}) | Categoria: ${categoryAfter?.id} (${categoryAfter?.soldQuantity})${
        ticket.couponId
          ? ` | Cupom: ${couponAfter?.id} (${couponAfter?.soldQuantity})`
          : ''
      }`,
    );
  }

  async decreaseSoldQuantity(ticketId: string) {
    const ticket = await this.prisma.ticket.findUnique({
      where: { id: ticketId },
      select: {
        id: true,
        ticketLotId: true,
        categoryId: true,
        couponId: true,
      },
    });

    if (!ticket) {
      this.logger.warn(`Ticket not found for refund | Ticket ID: ${ticketId}`);
      throw new BadRequestException('Ticket not found.');
    }

    await this.prisma.$transaction([
      this.prisma.ticketLot.updateMany({
        where: { id: ticket.ticketLotId, soldQuantity: { gt: 0 } },
        data: { soldQuantity: { increment: -1 } },
      }),
      this.prisma.category.updateMany({
        where: { id: ticket.categoryId, soldQuantity: { gt: 0 } },
        data: { soldQuantity: { increment: -1 } },
      }),
      ...(ticket.couponId
        ? [
            this.prisma.coupon.updateMany({
              where: { id: ticket.couponId, soldQuantity: { gt: 0 } },
              data: { soldQuantity: { increment: -1 } },
            }),
          ]
        : []),
    ]);

    const [lotAfter, categoryAfter, couponAfter] = await Promise.all([
      this.prisma.ticketLot.findUnique({
        where: { id: ticket.ticketLotId },
        select: { soldQuantity: true, id: true },
      }),
      this.prisma.category.findUnique({
        where: { id: ticket.categoryId },
        select: { soldQuantity: true, id: true },
      }),
      ticket.couponId
        ? this.prisma.coupon.findUnique({
            where: { id: ticket.couponId },
            select: { soldQuantity: true, id: true },
          })
        : null,
    ]);

    this.logger.log(
      `Ticket reembolsado com sucesso | Ticket ID: ${ticket.id} | Lote: ${lotAfter?.id} (${lotAfter?.soldQuantity}) | Categoria: ${categoryAfter?.id} (${categoryAfter?.soldQuantity})${
        ticket.couponId
          ? ` | Cupom: ${couponAfter?.id} (${couponAfter?.soldQuantity})`
          : ''
      }`,
    );
  }

  findLotsByTicketTypeIds(ids: string[]) {
    return this.prisma.ticketLot.findMany({
      where: {
        ticketTypeId: { in: ids },
        deletedAt: null,
      },
      select: {
        id: true,
        name: true,
        ticketTypeId: true,
        quantity: true,
        soldQuantity: true,
      },
    });
  }

  findCategoriesByIds(ids: string[]) {
    return this.prisma.category.findMany({
      where: { id: { in: ids }, deletedAt: null },
      select: {
        id: true,
        title: true,
        quantity: true,
        soldQuantity: true,
      },
    });
  }

  findCouponById(id: string) {
    return this.prisma.coupon.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        quantity: true,
        soldQuantity: true,
        isActive: true,
        deletedAt: true,
      },
    });
  }

  async updateRefundedStatus(transactionId: string, status: TransactionStatus) {
    return this.prisma.transaction.update({
      where: { id: transactionId },
      data: { status, refundedAt: new Date() },
    });
  }
}

function mapStatus(externalStatus: string): TransactionStatus {
  switch (externalStatus) {
    case 'pending':
      return TransactionStatus.PENDING;
    case 'approved':
      return TransactionStatus.APPROVED;
    case 'authorized':
      return TransactionStatus.AUTHORIZED;
    case 'in_process':
      return TransactionStatus.IN_PROCESS;
    case 'in_mediation':
      return TransactionStatus.IN_MEDIATION;
    case 'rejected':
      return TransactionStatus.REJECTED;
    case 'cancelled':
      return TransactionStatus.CANCELLED;
    case 'refunded':
      return TransactionStatus.REFUNDED;
    case 'charged_back':
      return TransactionStatus.CHARGED_BACK;
    default:
      return TransactionStatus.PENDING;
  }
}
