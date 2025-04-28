import { Injectable, Logger } from '@nestjs/common';
import { CreateCheckoutDto } from 'src/checkout/dto/create-checkout.dto';
import { MercadoPagoPaymentResponse } from 'src/checkout/dto/mercado-pago-payment-response';
import { MercadoPagoGateway } from './gateway/mercado-pago-gateway.service';
import { PaymentGateway } from './payment-gateway.interface';

@Injectable()
export class PaymentService {
  private readonly logger = new Logger(PaymentService.name);
  constructor(private readonly mercadoPagoGateway: MercadoPagoGateway) {}

  async processPayment(
    checkoutResult: any,
    dto: CreateCheckoutDto,
  ): Promise<any> {
    let gateway: PaymentGateway;

    gateway = this.mercadoPagoGateway;

    return gateway.processPayment(checkoutResult, dto);
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
        this.logger.error(
          `Error fetching payment | Payment ID: ${paymentId} | Status: ${response.status}`,
        );
        return null;
      }

      const paymentData = await response.json();
      return paymentData;
    } catch (error) {
      this.logger.error(
        `Exception fetching payment | Payment ID: ${paymentId} | Message: ${error.message}`,
        error.stack,
      );
      return null;
    }
  }
}
