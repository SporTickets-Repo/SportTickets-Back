import { BadRequestException, Injectable } from '@nestjs/common';
import { User } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateCheckoutDto } from './dto/create-checkout.dto';

@Injectable()
export class CheckoutRepository {
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

          const ticket = await tx.ticket.create({
            data: {
              userId: player.userId,
              transactionId: transaction.id,
              teamId: teamCreated.id,
              ticketLotId: lot.id,
              categoryId: player.categoryId,
              price: ticketPrice,
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

      await tx.transaction.update({
        where: { id: transaction.id },
        data: { totalValue },
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
}
