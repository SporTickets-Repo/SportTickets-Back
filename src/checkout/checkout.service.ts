import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { User } from '@prisma/client';
import { EmailService } from 'src/email/email.service';
import { PaymentService } from '../payment/payment.service';
import { CheckoutRepository } from './checkout.repository';
import { CreateCheckoutDto } from './dto/create-checkout.dto';
import { MercadoPagoPaymentResponse } from './dto/mercado-pago-payment-response';
import { TicketWithRelations } from './dto/ticket-with-relations.dto';

@Injectable()
export class CheckoutService {
  constructor(
    private readonly checkoutRepository: CheckoutRepository,
    private readonly paymentService: PaymentService,
    private readonly emailService: EmailService,
  ) {}

  async createOrder(dto: CreateCheckoutDto, user: User) {
    const ticketTypeCounts = new Map<string, number>();
    const categoryCounts = new Map<string, number>();
    let couponCount = dto.couponId ? 0 : null;

    for (const team of dto.teams) {
      const playerCount = team.player.length;

      ticketTypeCounts.set(
        team.ticketTypeId,
        (ticketTypeCounts.get(team.ticketTypeId) || 0) + playerCount,
      );

      for (const player of team.player) {
        categoryCounts.set(
          player.categoryId,
          (categoryCounts.get(player.categoryId) || 0) + 1,
        );
      }

      if (dto.couponId) {
        couponCount! += playerCount;
      }
    }

    const lots = await this.checkoutRepository.findLotsByTicketTypeIds([
      ...ticketTypeCounts.keys(),
    ]);

    for (const lot of lots) {
      const requested = ticketTypeCounts.get(lot.ticketTypeId)!;
      const available = lot.quantity - lot.soldQuantity;

      if (requested > available) {
        throw new InternalServerErrorException(
          `The lot "${lot.name}" does not have enough tickets available.`,
        );
      }
    }

    const categories = await this.checkoutRepository.findCategoriesByIds([
      ...categoryCounts.keys(),
    ]);

    for (const category of categories) {
      const requested = categoryCounts.get(category.id)!;
      const available = category.quantity - category.soldQuantity;

      if (requested > available) {
        throw new InternalServerErrorException(
          `The category "${category.title}" does not have enough tickets available.`,
        );
      }
    }

    if (dto.couponId) {
      const coupon = await this.checkoutRepository.findCouponById(dto.couponId);

      if (!coupon || coupon.deletedAt || !coupon.isActive) {
        throw new InternalServerErrorException(`Invalid or inactive coupon.`);
      }

      const available = coupon.quantity - coupon.soldQuantity;

      if (couponCount! > available) {
        throw new InternalServerErrorException(
          `The coupon "${coupon.name}" has already been used up to the allowed limit.`,
        );
      }
    }

    const checkoutResult = await this.checkoutRepository.performCheckout(
      dto,
      user,
    );

    if (!checkoutResult) {
      throw new InternalServerErrorException(
        'Error creating the checkout transaction.',
      );
    }

    const paymentResult = await this.paymentService.processPayment(
      checkoutResult,
      dto,
    );

    if (!paymentResult) {
      throw new InternalServerErrorException('Error processing the payment.');
    }

    return {
      transactionId: checkoutResult.id,
      message: 'Transaction created successfully.',
    };
  }

  async handleApprovedTransaction(transactionId: string) {
    const transaction =
      await this.checkoutRepository.getTransactionWithTicketsByPaymentId(
        transactionId,
      );

    if (!transaction) {
      throw new Error('Transaction not found.');
    }

    for (const ticket of transaction.tickets as TicketWithRelations[]) {
      if (!ticket.deliveredAt) {
        await this.emailService.sendTicketConfirmation(ticket);
        await this.checkoutRepository.markTicketAsDeliveredAndUpdateSoldQuantity(
          ticket.id,
        );
      }
    }
  }

  async updatePaymentStatus(gatewayResponse: MercadoPagoPaymentResponse) {
    return await this.checkoutRepository.updateCheckoutTransaction(
      gatewayResponse,
    );
  }
}
