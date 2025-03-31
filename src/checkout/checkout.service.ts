import { BadRequestException, Injectable } from '@nestjs/common';
import { Decimal } from '@prisma/client/runtime/library';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateCheckoutDto } from './dto/create-checkout.dto';

@Injectable()
export class CheckoutService {
  constructor(private readonly prisma: PrismaService) {}

  async createOrder(dto: CreateCheckoutDto) {
    const { teams, couponId, paymentData } = dto;

    let totalValue = new Decimal(0);

    // Cria transação base
    const transaction = await this.prisma.transaction.create({
      data: {
        status: 'PENDING',
        totalValue: totalValue,
      },
    });

    for (const team of teams) {
      const teamCreated = await this.prisma.team.create({
        data: {},
      });

      for (const player of team.player) {
        const lot = await this.findActiveLot(team.ticketTypeId);
        let ticketPrice = new Decimal(lot.price);

        // Aplicação de cupom (se houver)
        if (couponId) {
          const coupon = await this.prisma.coupon.findUnique({
            where: { id: couponId },
          });

          if (coupon && coupon.isActive) {
            const discount = ticketPrice.mul(coupon.percentage);
            ticketPrice = ticketPrice.minus(discount);
          }
        }

        // Cria ticket
        await this.prisma.ticket.create({
          data: {
            userId: player.userId,
            transactionId: transaction.id,
            teamId: teamCreated.id,
            ticketLotId: lot.id,
            categoryId: player.categoryId,
            couponId: couponId,
            price: ticketPrice,
            personalizedFieldAnswers: {
              create: player.personalFields.map((field) => ({
                personalizedFieldId: field.personalizedFieldId,
                answer: field.answer,
              })),
            },
          },
        });

        totalValue = totalValue.add(ticketPrice);
      }
    }

    // Atualiza valor total na transação
    await this.prisma.transaction.update({
      where: { id: transaction.id },
      data: { totalValue },
    });

    // Aqui você pode chamar um serviço de pagamento se desejar

    return { transactionId: transaction.id, total: totalValue.toFixed(2) };
  }

  private async findActiveLot(ticketTypeId: string) {
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

    if (!lot) {
      throw new BadRequestException(
        'Nenhum lote ativo disponível para este tipo de ingresso.',
      );
    }

    return lot;
  }
}
