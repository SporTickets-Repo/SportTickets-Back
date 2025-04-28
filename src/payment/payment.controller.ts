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
      this.logger.warn(
        `Ignored invalid webhook | Type: ${type}, Payment ID: ${paymentId}`,
      );
      throw new BadRequestException('Invalid webhook payload.');
    }

    this.logger.log(
      `Processing webhook | Payment ID: ${paymentId} | Type: ${type}`,
    );

    try {
      const paymentData =
        await this.paymentService.fetchMercadoPagoPayment(paymentId);

      if (!paymentData) {
        this.logger.error(`Payment data not found | Payment ID: ${paymentId}`);
        throw new NotFoundException('Payment data not found.');
      }

      this.logger.log(
        `Payment fetched | Payment ID: ${paymentData.id} | Status: ${paymentData.status}`,
      );

      const updatedTransaction =
        await this.checkoutService.updatePaymentStatus(paymentData);

      if (!updatedTransaction) {
        this.logger.error(
          `Failed to update transaction | Payment ID: ${paymentData.id}`,
        );
        throw new InternalServerErrorException('Failed to update transaction.');
      }

      this.logger.log(
        `Transaction updated | Transaction ID: ${updatedTransaction.id} | New Status: ${updatedTransaction.status}`,
      );

      await this.handleTransactionByStatus(
        updatedTransaction.id,
        updatedTransaction.status,
      );

      return { message: 'Webhook processed successfully.' };
    } catch (error) {
      this.logger.error(
        `Error processing webhook | Message: ${error.message}`,
        error.stack,
      );

      if (
        error instanceof BadRequestException ||
        error instanceof NotFoundException ||
        error instanceof InternalServerErrorException
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
      case TransactionStatus.APPROVED:
      case TransactionStatus.AUTHORIZED:
        this.logger.log(
          `Handling approved transaction | Transaction ID: ${transactionId}`,
        );
        await this.checkoutService.handleApprovedTransaction(transactionId);
        break;

      case TransactionStatus.REFUNDED:
        this.logger.log(
          `Handling refunded transaction | Transaction ID: ${transactionId}`,
        );
        await this.checkoutService.handleRefundedTransaction(transactionId);
        break;

      default:
        this.logger.warn(
          `Unhandled transaction status | Transaction ID: ${transactionId} | Status: ${status}`,
        );
        break;
    }
  }
}
