import { HttpService } from '@nestjs/axios';
import { BadRequestException, Injectable } from '@nestjs/common';
import { lastValueFrom } from 'rxjs';
import { PaymentData, PaymentGateway } from '../payment-gateway.interface';

@Injectable()
export class MercadoPagoGateway implements PaymentGateway {
  constructor(private readonly httpService: HttpService) {}

  async processPayment(
    paymentData: PaymentData,
    totalValue: number,
    transactionId: string,
  ): Promise<any> {
    if (paymentData.paymentMethodId === 'credit_card') {
      const cardTokenResponse = await lastValueFrom(
        this.httpService.post('https://api.mercadopago.com/v1/card_tokens', {
          card_number: paymentData.cardNumber,
          security_code: paymentData.securityCode,
          expiration_month: paymentData.expirationMonth,
          expiration_year: paymentData.expirationYear,
          cardholder: paymentData.cardHolder,
        }),
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
        application_fee: paymentData.application_fee,
      };

      const paymentResponse = await lastValueFrom(
        this.httpService.post(
          'https://api.mercadopago.com/v1/payments',
          paymentPayload,
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
        application_fee: paymentData.application_fee,
      };

      const paymentResponse = await lastValueFrom(
        this.httpService.post(
          'https://api.mercadopago.com/v1/payments',
          paymentPayload,
        ),
      );

      return paymentResponse.data;
    } else {
      throw new BadRequestException('Unsupported payment method');
    }
  }
}
