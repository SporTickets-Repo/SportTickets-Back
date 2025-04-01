import { BadRequestException, Injectable } from '@nestjs/common';
import { TransactionStatus, User } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';
import { PrismaService } from 'src/prisma/prisma.service';
import { generateQrCodeBase64, generateRandomCode } from 'src/utils/generate';
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
          let codeBase64: string | undefined;
          let isUnique = false;

          while (!isUnique) {
            const generated = generateRandomCode();

            const existing = await tx.ticket.findUnique({
              where: { code: generated },
            });

            if (!existing) {
              code = generated;
              codeBase64 = await generateQrCodeBase64(generated);
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
              codeBase64: codeBase64!,
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

  async updateCheckoutTransaction(transactionId: string, data: any) {
    return this.prisma.transaction.update({
      where: { id: transactionId },
      data: {
        externalPaymentId: data?.id.toString(),
        externalStatus: data?.status,
        status: mapStatus(data?.status),
        pixQRCode:
          data?.point_of_interaction?.transaction_data?.qr_code || null,
        pixQRCodeBase64:
          data?.point_of_interaction?.transaction_data?.qr_code_base64 || null,
        response: data,
      },
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
