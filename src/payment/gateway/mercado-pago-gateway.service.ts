import { HttpService } from '@nestjs/axios';
import { BadRequestException, Injectable } from '@nestjs/common';
import { lastValueFrom } from 'rxjs';
import { CreateCheckoutDto } from 'src/checkout/dto/create-checkout.dto';
import { AppConfigService } from 'src/config/config.service';
import { PaymentData, PaymentGateway } from '../payment-gateway.interface';

@Injectable()
export class MercadoPagoGateway implements PaymentGateway {
  constructor(
    private readonly httpService: HttpService,
    private readonly configService: AppConfigService,
  ) {}

  async processPayment(
    checkoutResult: any,
    createCheckoutDto: CreateCheckoutDto,
  ): Promise<any> {
    const paymentData = this.transformCheckoutResultToPaymentData(
      checkoutResult,
      createCheckoutDto,
    );
    const transactionId = checkoutResult.id;
    const totalValue = Number(checkoutResult.totalValue);

    if (paymentData.paymentMethodId === 'credit_card') {
      let cardTokenResponse;
      try {
        cardTokenResponse = await lastValueFrom(
          this.httpService.post(
            'https://api.mercadopago.com/v1/card_tokens',
            {
              card_number: paymentData.cardNumber,
              security_code: paymentData.securityCode,
              expiration_month: paymentData.expirationMonth,
              expiration_year: (paymentData.expirationYear as number) + 2000,
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
      } catch (error: any) {
        throw new BadRequestException(
          `Erro ao criar token do cartão: ${error.response?.data?.message || error.message}`,
        );
      }

      const cardToken = cardTokenResponse.data.id;
      if (!cardToken) {
        throw new BadRequestException('Unable to create card token.');
      }

      const paymentPayload = {
        transaction_amount: totalValue,
        token: cardToken,
        installments: paymentData.installments,
        payer: paymentData.payer,
        additional_info: paymentData.additional_info,
        description: `Payment for transaction ${transactionId}`,
        // application_fee: 10,
        notification_url:
          'https://343d-2804-1b2-1140-4a6a-d982-a140-e977-54ba.ngrok-free.app/checkout/webhook',
      };

      let paymentResponse;
      try {
        paymentResponse = await lastValueFrom(
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
      } catch (error: any) {
        throw new BadRequestException(
          `Erro ao processar pagamento com cartão: ${error.response?.data?.message || error.message}`,
        );
      }
      return paymentResponse.data;
    } else if (paymentData.paymentMethodId === 'pix') {
      const paymentPayload = {
        transaction_amount: totalValue,
        payment_method_id: paymentData.paymentMethodId,
        payer: paymentData.payer,
        additional_info: paymentData.additional_info,
        description: `Payment for transaction ${transactionId}`,
        // application_fee: 10,
        notification_url:
          'https://343d-2804-1b2-1140-4a6a-d982-a140-e977-54ba.ngrok-free.app/checkout/webhook',
      };

      let paymentResponse;
      try {
        paymentResponse = await lastValueFrom(
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
      } catch (error: any) {
        throw new BadRequestException(
          `Erro ao processar pagamento com PIX: ${error.response?.data?.message || error.message}`,
        );
      }
      return paymentResponse.data;
    } else {
      throw new BadRequestException('Unsupported payment method');
    }
  }

  private transformCheckoutResultToPaymentData(
    checkoutResult: any,
    createCheckoutDto: CreateCheckoutDto,
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
      paymentMethodId: paymentMethod.toLowerCase(),
      email: createdBy.email,
      payer: {
        email: createdBy.email,
        id: null,
        entity_type: 'individual',
        type: 'customer',
        identification: {
          type: createdBy.documentType,
          number: createdBy.document,
        },
      },
      additional_info: {
        items: items,
      },
      // application_fee: 10,
    };

    if (paymentData.paymentMethodId === 'credit_card') {
      console.log('carddata', createCheckoutDto.paymentData.cardData);

      paymentData.cardNumber =
        createCheckoutDto.paymentData.cardData?.cardNumber;
      paymentData.securityCode =
        createCheckoutDto.paymentData.cardData?.securityCode;
      paymentData.expirationMonth =
        createCheckoutDto.paymentData.cardData?.expirationMonth;
      paymentData.expirationYear =
        createCheckoutDto.paymentData.cardData?.expirationYear;
      paymentData.cardHolder = {
        name: createCheckoutDto.paymentData.cardData?.cardHolder.name as string,
        identification: {
          type: createdBy.documentType,
          number: createdBy.document,
        },
      };
      paymentData.installments = 1;
    }

    return paymentData;
  }
}
