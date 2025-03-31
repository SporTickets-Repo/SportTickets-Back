import { Injectable } from '@nestjs/common';
import { MercadoPagoGateway } from './gateway/mercado-pago-gateway.service';
import { PaymentData, PaymentGateway } from './payment-gateway.interface';

@Injectable()
export class PaymentService {
  constructor(private readonly mercadoPagoGateway: MercadoPagoGateway) {}

  async processPayment(checkoutResult: any) {
    let gateway: PaymentGateway;

    gateway = this.mercadoPagoGateway;

    return gateway.processPayment(checkoutResult);
  }
}
