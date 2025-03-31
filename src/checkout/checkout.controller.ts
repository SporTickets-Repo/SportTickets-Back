import {
  Body,
  Controller,
  HttpCode,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { User } from '@prisma/client';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { CheckoutService } from './checkout.service';
import { CreateCheckoutDto } from './dto/create-checkout.dto';

// importe 'fetch' se estiver usando Node 18 ou anterior
// import fetch from 'node-fetch'; // se necessário

@Controller('checkout')
export class CheckoutController {
  constructor(private readonly checkoutService: CheckoutService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async createCheckout(
    @Body() dto: CreateCheckoutDto,
    @Request() req: { user: User },
  ) {
    const user = req.user;
    return this.checkoutService.createOrder(dto, user);
  }

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

      const paymentData = await response.json();
      console.log('Dados do pagamento:', paymentData);

      // // Exemplo de tratamento: pagamento aprovado
      // if (paymentData.status === 'approved') {
      //   await this.checkoutService.handleApprovedTransaction(
      //     paymentId,
      //     paymentData,
      //   );
      // } else {
      //   await this.checkoutService.updatePaymentStatus(paymentId, paymentData);
      // }

      return { message: 'OK' };
    } catch (error) {
      console.error('Erro ao processar webhook do Mercado Pago:', error);
      return { message: 'Erro interno ao processar webhook' };
    }
  }
}
