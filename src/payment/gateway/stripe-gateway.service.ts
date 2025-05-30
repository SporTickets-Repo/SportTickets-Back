// payment/gateway/stripe-gateway.service.ts
import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateCheckoutDto } from 'src/checkout/dto/create-checkout.dto';
import { AppConfigService } from 'src/config/config.service';
import Stripe from 'stripe';
import { PaymentGateway } from '../payment-gateway.interface';

@Injectable()
export class StripeGateway implements PaymentGateway {
  private stripe: Stripe;

  constructor(private readonly configService: AppConfigService) {
    const key = this.configService.stripeToken;
    if (!key) {
      throw new BadRequestException('STRIPE_SECRET_KEY não configurada');
    }
    this.stripe = new Stripe(key, {
      apiVersion: '2025-05-28.basil',
    });
  }

  async processPayment(checkoutResult: any, dto: CreateCheckoutDto) {
    const YOUR_DOMAIN = this.configService.frontendUrl;
    const metadata = { transactionId: checkoutResult.id };

    const line_items = checkoutResult.tickets.map((t: any) => ({
      price_data: {
        currency: dto.paymentData.currency || 'usd',
        product_data: { name: t.ticketLot.name },
        unit_amount: Math.round(Number(t.price) * 100),
      },
      quantity: 1,
    }));

    const session = await this.stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items,
      metadata,
      mode: 'payment',
      success_url: `${YOUR_DOMAIN}/pagamento/${checkoutResult.id}?success=true`,
      cancel_url: `${YOUR_DOMAIN}/pagamento/${checkoutResult.id}?canceled=true`,
    });

    return { url: session.url };
  }
}
