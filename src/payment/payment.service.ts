import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { PaymentMethod } from '@prisma/client';
import { CreateCheckoutDto } from 'src/checkout/dto/create-checkout.dto';
import { MercadoPagoPaymentResponse } from 'src/checkout/dto/mercado-pago-payment-response';
import { MercadoPagoGateway } from './gateway/mercado-pago-gateway.service';
import { StripeGateway } from './gateway/stripe-gateway.service';

@Injectable()
export class PaymentService {
  private readonly logger = new Logger(PaymentService.name);
  constructor(
    private readonly mercadoPagoGateway: MercadoPagoGateway,
    private stripeGateway: StripeGateway,
  ) {}

  async processPayment(
    checkoutResult: any,
    dto: CreateCheckoutDto,
  ): Promise<any> {
    switch (dto.paymentData.paymentMethod) {
      case PaymentMethod.PIX:
      case PaymentMethod.CREDIT_CARD:
      case PaymentMethod.BOLETO:
        return this.mercadoPagoGateway.processPayment(checkoutResult, dto);
      case PaymentMethod.STRIPE:
        return this.stripeGateway.processPayment(checkoutResult, dto);
      default:
        throw new BadRequestException('Gateway não suportado.');
    }
  }

  async fetchMercadoPagoPayment(
    paymentId: string,
  ): Promise<MercadoPagoPaymentResponse | null> {
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
        this.logger.error(`MP fetch failed | id=${paymentId}`);
        return null;
      }

      return response.json();
    } catch (error) {
      this.logger.error(`MP fetch exception | id=${paymentId}`, error.stack);
      return null;
    }
  }
}
