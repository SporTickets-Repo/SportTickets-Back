import { Body, Controller, HttpCode, Logger, Post } from '@nestjs/common';
import { TransactionStatus } from '@prisma/client';
import { CheckoutService } from 'src/checkout/checkout.service';
import { MercadoPagoPaymentResponse } from 'src/checkout/dto/mercado-pago-payment-response';

@Controller('payment')
export class PaymentController {
  private readonly logger = new Logger(PaymentController.name);
  constructor(private readonly checkoutService: CheckoutService) {}

  @Post('webhook')
  @HttpCode(200)
  async handleWebhook(@Body() body: any) {
    this.logger.log('Webhook received from Mercado Pago', body);

    const paymentId = body?.data?.id;
    const type = body?.type;

    if (type !== 'payment' || !paymentId) {
      this.logger.warn(
        `Webhook received with invalid type or without payment ID: ${type} ${paymentId}`,
      );
      return { message: 'Ignored' };
    }

    try {
      const response = await fetch(
        `https://api.mercadopago.com/v1/payments/${paymentId}`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${process.env.MP_ACCESS_TOKEN}`,
            'Content-Type': 'application/json',
          },
        },
      );

      if (!response.ok) {
        this.logger.error(
          `Error fetching payment from Mercado Pago: ${response.status} ${response.statusText}`,
        );
        return { message: 'Error fetching payment' };
      }

      const paymentData: MercadoPagoPaymentResponse = await response.json();

      const updatedTransaction =
        await this.checkoutService.updatePaymentStatus(paymentData);

      if (updatedTransaction.status === TransactionStatus.APPROVED) {
        await this.checkoutService.handleApprovedTransaction(
          updatedTransaction.id,
        );
      }

      return { message: 'OK' };
    } catch (error) {
      this.logger.error(
        `Error processing webhook: ${error.message}`,
        error.stack,
      );
      return { message: 'Internal error processing webhook' };
    }
  }
}
