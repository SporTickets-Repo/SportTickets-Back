import { HttpService } from '@nestjs/axios';
import { BadRequestException, Injectable } from '@nestjs/common';
import { lastValueFrom } from 'rxjs';
import { AppConfigService } from 'src/config/config.service';
import { PaymentData, PaymentGateway } from '../payment-gateway.interface';

@Injectable()
export class MercadoPagoGateway implements PaymentGateway {
  constructor(
    private readonly httpService: HttpService,
    private readonly configService: AppConfigService,
  ) {}

  async processPayment(checkoutResult: any): Promise<any> {
    const paymentData =
      this.transformCheckoutResultToPaymentData(checkoutResult);
    const transactionId = checkoutResult.id;
    const totalValue = Number(checkoutResult.totalValue);

    if (paymentData.paymentMethodId === 'credit_card') {
      const cardTokenResponse = await lastValueFrom(
        this.httpService.post(
          'https://api.mercadopago.com/v1/card_tokens',
          {
            card_number: paymentData.cardNumber,
            security_code: paymentData.securityCode,
            expiration_month: paymentData.expirationMonth,
            expiration_year: paymentData.expirationYear,
            cardholder: paymentData.cardHolder,
          },
          {
            headers: {
              'X-Idempotency-Key': transactionId,
              Authorization: `Bearer ${this.configService.mercadoPagoToken}`,
            },
          },
        ),
      );

      const cardToken = cardTokenResponse.data.id;
      if (!cardToken) {
        throw new BadRequestException('Unable to create card token.');
      }

      const paymentPayload = {
        transaction_amount: totalValue,
        token: cardToken,
        installments: paymentData.installments,
        payment_method_id: paymentData.paymentMethodId,
        payer: paymentData.payer,
        additional_info: paymentData.additional_info,
        description: `Payment for transaction ${transactionId}`,
        application_fee: 10,
      };

      const paymentResponse = await lastValueFrom(
        this.httpService.post(
          'https://api.mercadopago.com/v1/payments',
          paymentPayload,
          {
            headers: {
              'X-Idempotency-Key': transactionId,
              Authorization: `Bearer ${this.configService.mercadoPagoToken}`,
            },
          },
        ),
      );

      return paymentResponse.data;
    } else if (paymentData.paymentMethodId === 'pix') {
      const paymentPayload = {
        transaction_amount: totalValue,
        payment_method_id: paymentData.paymentMethodId,
        payer: paymentData.payer,
        additional_info: paymentData.additional_info,
        description: `Payment for transaction ${transactionId}`,
        application_fee: 10,
      };

      const paymentResponse = await lastValueFrom(
        this.httpService.post(
          'https://api.mercadopago.com/v1/payments',
          paymentPayload,
          {
            headers: {
              'X-Idempotency-Key': transactionId,
              Authorization: `Bearer ${this.configService.mercadoPagoToken}`,
            },
          },
        ),
      );

      console.log('Payment response:', paymentResponse.data);

      return paymentResponse.data;
    } else {
      throw new BadRequestException('Unsupported payment method');
    }
  }

  private transformCheckoutResultToPaymentData(
    checkoutResult: any,
  ): PaymentData {
    const { createdBy, paymentMethod, tickets } = checkoutResult;
    const nameParts = createdBy.name.split(' ');
    const firstName = nameParts[0];
    const lastName = nameParts.slice(1).join(' ');

    const items = tickets.map((ticket: any) => ({
      id: ticket.id,
      title: ticket.ticketLot.name,
      description: ticket.category.title,
      category_id: ticket.category.id,
      quantity: 1,
      unit_price: Number(ticket.price),
      type: 'ticket',
      event_date: ticket.ticketLot.startDate,
      warranty: false,
    }));

    const paymentData: PaymentData = {
      external_reference: checkoutResult.id,
      paymentMethodId: paymentMethod || 'pix',
      email: createdBy.email,
      payer: {
        email: createdBy.email,
        first_name: firstName,
        last_name: lastName,
        identification: {
          type: createdBy.documentType,
          number: createdBy.document,
        },
      },
      additional_info: {
        items: items,
      },
      application_fee: 10,
    };

    if (paymentData.paymentMethodId === 'credit_card') {
      paymentData.cardNumber = '';
      paymentData.securityCode = '';
      paymentData.expirationMonth = 0;
      paymentData.expirationYear = 0;
      paymentData.cardHolder = {
        name: createdBy.name,
      };
      paymentData.installments = 1;
    }

    return paymentData;
  }
}
