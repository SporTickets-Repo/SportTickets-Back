import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { TransactionStatus } from '@prisma/client';
import { CheckoutService } from 'src/checkout/checkout.service';
import { MercadoPagoPaymentResponse } from 'src/checkout/dto/mercado-pago-payment-response';

@Controller('payment')
export class PaymentController {
  constructor(private readonly checkoutService: CheckoutService) {}

  @Post('webhook')
  @HttpCode(200)
  async handleWebhook(@Body() body: any) {
    console.log('Webhook recebido', body);

    const paymentId = body?.data?.id;
    const type = body?.type;

    if (type !== 'payment' || !paymentId) {
      console.warn('Webhook ignorado. Tipo inválido ou ID ausente.');
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
        throw new Error(`Erro ao consultar pagamento: ${response.statusText}`);
      }

      const paymentData: MercadoPagoPaymentResponse = await response.json();

      const updatedTransaction =
        await this.checkoutService.updatePaymentStatus(paymentData);

      if (updatedTransaction.status === TransactionStatus.APPROVED) {
        await this.checkoutService.handleApprovedTransaction(
          updatedTransaction,
        );
      }

      return { message: 'OK' };
    } catch (error) {
      console.error('Erro ao processar webhook do Mercado Pago:', error);
      return { message: 'Erro interno ao processar webhook' };
    }
  }
}
