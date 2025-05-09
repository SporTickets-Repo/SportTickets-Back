import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { TransactionStatus, User } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';
import { EmailService } from 'src/email/email.service';
import { PaymentService } from '../payment/payment.service';
import { CheckoutRepository } from './checkout.repository';
import { CreateCheckoutDto } from './dto/create-checkout.dto';
import { CreateFreeCheckoutDto } from './dto/create-free-checkout.dto';
import { MercadoPagoPaymentResponse } from './dto/mercado-pago-payment-response';
import { TicketWithRelations } from './dto/ticket-with-relations.dto';

@Injectable()
export class CheckoutService {
  private readonly logger = new Logger(CheckoutService.name);

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
        if (player.categoryId) {
          categoryCounts.set(
            player.categoryId,
            (categoryCounts.get(player.categoryId) || 0) + 1,
          );
        }
      }

      if (dto.couponId) {
        couponCount! += playerCount;
      }
    }

    await this.validateLotsAndCategories(
      ticketTypeCounts,
      categoryCounts,
      couponCount,
      dto.couponId,
    );

    const checkoutResult = await this.checkoutRepository.performCheckout(
      dto,
      user,
    );
    if (!checkoutResult) {
      this.logger.error('Checkout creation failed');
      throw new InternalServerErrorException(
        'Error creating the checkout transaction.',
      );
    }

    if ((checkoutResult.totalValue as Decimal).equals(0)) {
      await this.checkoutRepository.markTransactionAsFree(checkoutResult.id);
      await this.handleApprovedTransaction(checkoutResult.id);

      this.logger.log(`FREE checkout (100%) | Tx ${checkoutResult.id}`);
      return {
        transactionId: checkoutResult.id,
        message: 'Checkout completed successfully.',
      };
    }

    const paymentResult = await this.paymentService.processPayment(
      checkoutResult,
      dto,
    );
    if (!paymentResult) {
      this.logger.error('Payment processing failed');
      throw new InternalServerErrorException('Error processing the payment.');
    }

    return {
      transactionId: checkoutResult.id,
      message: 'Transaction created successfully.',
    };
  }

  async createFreeOrder(dto: CreateFreeCheckoutDto, user: User) {
    const { team } = dto;
    const playerCount = team.player.length;
    const categoryCounts = new Map<string, number>();

    for (const player of team.player) {
      if (player.categoryId) {
        categoryCounts.set(
          player.categoryId,
          (categoryCounts.get(player.categoryId) || 0) + 1,
        );
      }
    }

    const [lot] = await this.checkoutRepository.findLotsByTicketTypeIds([
      team.ticketTypeId,
    ]);
    if (!lot || playerCount > lot.quantity - lot.soldQuantity) {
      this.logger.warn(
        `Not enough tickets available in lot "${lot?.name ?? ''}"`,
      );
      throw new BadRequestException(
        `The lot "${lot?.name ?? ''}" does not have enough tickets available.`,
      );
    }

    if (categoryCounts.size > 0) {
      await this.validateCategories(categoryCounts);
    }

    const checkout = await this.checkoutRepository.performFreeCheckout(
      team,
      user,
    );
    if (!checkout) {
      this.logger.error('Free checkout failed');
      throw new InternalServerErrorException(
        'Error creating the free checkout transaction.',
      );
    }

    await this.handleApprovedTransaction(checkout.id);
    this.logger.log(`FREE checkout completed | Tx ${checkout.id}`);

    return {
      transactionId: checkout.id,
      message: 'Free checkout completed successfully.',
    };
  }

  async handleApprovedTransaction(transactionId: string) {
    const transaction =
      await this.checkoutRepository.getTransactionWithTicketsByPaymentId(
        transactionId,
      );

    if (!transaction) {
      this.logger.warn(`Tx not found (approve) | ${transactionId}`);
      throw new NotFoundException('Transaction not found.');
    }

    for (const ticket of transaction.tickets as TicketWithRelations[]) {
      if (!ticket.deliveredAt) {
        await this.emailService.sendTicketConfirmation(ticket);
        await this.checkoutRepository.markTicketAsDeliveredAndUpdateSoldQuantity(
          ticket.id,
        );
      }
    }

    this.logger.log(`Tickets delivered | Tx ${transactionId}`);
  }

  async handleRefundedTransaction(transactionId: string) {
    const transaction =
      await this.checkoutRepository.getTransactionWithTicketsByPaymentId(
        transactionId,
      );

    if (!transaction) {
      this.logger.warn(`Tx not found (refund) | ${transactionId}`);
      throw new NotFoundException('Transaction not found.');
    }

    if (transaction.refundedAt) {
      this.logger.warn(`Already refunded | Tx ${transactionId}`);
      throw new BadRequestException('Transaction already refunded.');
    }

    await this.checkoutRepository.updateRefundedStatus(
      transactionId,
      TransactionStatus.REFUNDED,
    );

    for (const ticket of transaction.tickets as TicketWithRelations[]) {
      await this.checkoutRepository.decreaseSoldQuantity(ticket.id);
      await this.emailService.sendTicketRefund(ticket);
    }

    this.logger.log(`Refund processed | Tx ${transactionId}`);
  }

  async updatePaymentStatus(gatewayResponse: MercadoPagoPaymentResponse) {
    return this.checkoutRepository.updateCheckoutTransaction(gatewayResponse);
  }

  private async validateLotsAndCategories(
    ticketTypeCounts: Map<string, number>,
    categoryCounts: Map<string, number>,
    couponCount: number | null,
    couponId?: string,
  ) {
    const lots = await this.checkoutRepository.findLotsByTicketTypeIds([
      ...ticketTypeCounts.keys(),
    ]);

    for (const lot of lots) {
      const requested = ticketTypeCounts.get(lot.ticketTypeId)!;
      const available = lot.quantity - lot.soldQuantity;

      if (requested > available) {
        this.logger.warn(`Not enough tickets in lot "${lot.name}"`);
        throw new BadRequestException(
          `The lot "${lot.name}" does not have enough tickets available.`,
        );
      }
    }

    if (categoryCounts.size > 0) {
      await this.validateCategories(categoryCounts);
    }

    if (couponId) {
      const coupon = await this.checkoutRepository.findCouponById(couponId);
      if (!coupon || coupon.deletedAt || !coupon.isActive) {
        this.logger.warn(
          `Invalid or inactive coupon used | Coupon ID: ${couponId}`,
        );
        throw new BadRequestException('Invalid or inactive coupon.');
      }
      const available = coupon.quantity - coupon.soldQuantity;
      if (couponCount! > available) {
        this.logger.warn(`Coupon limit exceeded | Coupon: ${coupon.name}`);
        throw new BadRequestException(
          `The coupon "${coupon.name}" has already been used up to the allowed limit.`,
        );
      }
    }
  }

  private async validateCategories(categoryCounts: Map<string, number>) {
    if (categoryCounts.size === 0) return;

    const categories = await this.checkoutRepository.findCategoriesByIds([
      ...categoryCounts.keys(),
    ]);

    for (const category of categories) {
      const requested = categoryCounts.get(category.id)!;
      const available = category.quantity - category.soldQuantity;

      if (requested > available) {
        this.logger.warn(
          `Not enough tickets available in category "${category.title}"`,
        );
        throw new BadRequestException(
          `The category "${category.title}" does not have enough tickets available.`,
        );
      }
    }
  }
}
