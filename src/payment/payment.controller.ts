// src/payment/payment.controller.ts

import {
  BadRequestException,
  Body,
  Controller,
  Headers,
  HttpCode,
  InternalServerErrorException,
  Logger,
  NotFoundException,
  Post,
  Req,
  Res,
} from '@nestjs/common';
import { TransactionStatus } from '@prisma/client';
import { Request, Response } from 'express';
import { CheckoutService } from 'src/checkout/checkout.service';
import { AppConfigService } from 'src/config/config.service';
import { PaymentService } from 'src/payment/payment.service';
import Stripe from 'stripe';

@Controller('payment')
export class PaymentController {
  private readonly logger = new Logger(PaymentController.name);
  private readonly stripeClient: Stripe;

  constructor(
    private readonly checkoutService: CheckoutService,
    private readonly paymentService: PaymentService,
    private readonly configService: AppConfigService,
  ) {
    const key = this.configService.stripeToken;
    if (!key) {
      throw new Error('STRIPE_SECRET_KEY must be set in environment');
    }
    this.stripeClient = new Stripe(key, {
      apiVersion: '2025-05-28.basil',
    });
  }

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

  @Post('webhook/stripe')
  @HttpCode(200)
  async handleStripeWebhook(
    @Req() req: Request,
    @Res() res: Response,
    @Headers('stripe-signature') signature: string,
  ) {
    const webhookSecret = this.configService.stripeWebhookSecret;
    let event: Stripe.Event;

    try {
      event = this.stripeClient.webhooks.constructEvent(
        (req as any).rawBody,
        signature,
        webhookSecret,
      );
    } catch (err) {
      this.logger.error('Invalid Stripe webhook', (err as Error).message);
      return res.status(400).send(`Webhook Error: ${(err as Error).message}`);
    }

    this.logger.log(`Stripe webhook received: ${event.type}`);

    try {
      if (event.type === 'payment_intent.succeeded') {
        const intent = event.data.object as Stripe.PaymentIntent;
        const txId = intent.metadata.transactionId!;
        await this.checkoutService.updateStripePaymentStatus(
          txId,
          intent.id,
          intent.status,
        );
        await this.checkoutService.handleApprovedTransaction(txId);
      } else if (event.type === 'payment_intent.payment_failed') {
        const intent = event.data.object as Stripe.PaymentIntent;
        this.logger.warn(
          `Stripe payment failed: ${intent.id} – ${intent.last_payment_error?.message}`,
        );
        // opcional: você pode marcar a transação como rejeitada
      }
      // outros eventos: payment_intent.canceled, charge.refunded, etc.
    } catch (err) {
      this.logger.error(
        `Error handling Stripe event ${event.type}`,
        (err as Error).stack,
      );
    }
    return res.send();
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
