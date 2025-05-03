import {
  BadRequestException,
  Body,
  Controller,
  HttpCode,
  InternalServerErrorException,
  Logger,
  NotFoundException,
  Post,
} from '@nestjs/common';
import { TransactionStatus } from '@prisma/client';
import { CheckoutService } from 'src/checkout/checkout.service';
import { PaymentService } from 'src/payment/payment.service';

@Controller('payment')
export class PaymentController {
  private readonly logger = new Logger(PaymentController.name);

  constructor(
    private readonly checkoutService: CheckoutService,
    private readonly paymentService: PaymentService,
  ) {}

  @Post('webhook/mercado-pago')
  @HttpCode(200)
  async handleWebhook(@Body() body: any) {
    const paymentId = body?.data?.id;
    const type = body?.type;

    if (!paymentId || type !== 'payment') {
      this.logger.warn(`Invalid webhook | type=${type} id=${paymentId}`);
      throw new BadRequestException('Invalid webhook payload.');
    }

    this.logger.log(`Webhook received | id=${paymentId}`);

    try {
      const paymentData =
        await this.paymentService.fetchMercadoPagoPayment(paymentId);
      if (!paymentData) {
        this.logger.error(`Payment not found | id=${paymentId}`);
        throw new NotFoundException('Payment data not found.');
      }

      const updatedTransaction =
        await this.checkoutService.updatePaymentStatus(paymentData);

      if (!updatedTransaction) {
        this.logger.error(`Tx update failed | payment=${paymentData.id}`);
        throw new InternalServerErrorException('Failed to update transaction.');
      }

      await this.handleTransactionByStatus(
        updatedTransaction.id,
        updatedTransaction.status,
      );

      return { message: 'Webhook processed.' };
    } catch (error) {
      this.logger.error(`Webhook error | ${error.message}`, error.stack);
      if (
        error instanceof BadRequestException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Unexpected error processing webhook.',
      );
    }
  }

  private async handleTransactionByStatus(
    transactionId: string,
    status: TransactionStatus,
  ) {
    switch (status) {
      case TransactionStatus.AUTHORIZED:
      case TransactionStatus.APPROVED:
        await this.checkoutService.handleApprovedTransaction(transactionId);
        break;
      case TransactionStatus.CHARGED_BACK:
      case TransactionStatus.REFUNDED:
        await this.checkoutService.handleRefundedTransaction(transactionId);
        break;
      default:
        this.logger.warn(`Unhandled status | Tx ${transactionId} | ${status}`);
    }
  }
}
