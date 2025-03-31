import { Injectable } from '@nestjs/common';
import { CreateCheckoutDto } from 'src/checkout/dto/create-checkout.dto';
import { MercadoPagoGateway } from './gateway/mercado-pago-gateway.service';
import { PaymentGateway } from './payment-gateway.interface';

@Injectable()
export class PaymentService {
  constructor(private readonly mercadoPagoGateway: MercadoPagoGateway) {}

  async processPayment(
    checkoutResult: any,
    dto: CreateCheckoutDto,
  ): Promise<any> {
    let gateway: PaymentGateway;

    gateway = this.mercadoPagoGateway;

    return gateway.processPayment(checkoutResult, dto);
  }
}
