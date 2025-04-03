import { HttpService } from '@nestjs/axios';
import { BadRequestException, Injectable } from '@nestjs/common';
import { lastValueFrom } from 'rxjs';
import { CreateCheckoutDto } from 'src/checkout/dto/create-checkout.dto';
import { AppConfigService } from 'src/config/config.service';
import { PaymentData, PaymentGateway } from '../payment-gateway.interface';

@Injectable()
export class MercadoPagoGateway implements PaymentGateway {
  private readonly baseUrl = 'https://api.mercadopago.com/v1';

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
    const notificationUrl = `${this.configService.backendUrl}/payment/webhook`;

    switch (paymentData.paymentMethodId) {
      case 'credit_card':
        return this.processCreditCardPayment(
          paymentData,
          transactionId,
          totalValue,
          notificationUrl,
        );
      case 'pix':
        return this.processPixPayment(
          paymentData,
          transactionId,
          totalValue,
          notificationUrl,
        );
      default:
        throw new BadRequestException('Método de pagamento não suportado.');
    }
  }

  private getHeaders(transactionId: string): Record<string, string> {
    return {
      'X-Idempotency-Key': transactionId,
      Authorization: `Bearer ${this.configService.mercadoPagoToken}`,
    };
  }

  private async createCardToken(
    paymentData: PaymentData,
    transactionId: string,
  ): Promise<string> {
    try {
      const response = await lastValueFrom(
        this.httpService.post(
          `${this.baseUrl}/card_tokens`,
          {
            card_number: paymentData.cardNumber,
            security_code: paymentData.securityCode,
            expiration_month: paymentData.expirationMonth,
            expiration_year: (paymentData.expirationYear as number) + 2000,
            cardholder: paymentData.cardHolder,
          },
          { headers: this.getHeaders(transactionId) },
        ),
      );
      const cardToken = response.data.id;
      if (!cardToken) {
        throw new BadRequestException(
          'Não foi possível criar o token do cartão.',
        );
      }
      return cardToken;
    } catch (error: any) {
      throw new BadRequestException(
        `Erro ao criar token do cartão: ${
          error.response?.data?.message || error.message
        }`,
      );
    }
  }

  private async processCreditCardPayment(
    paymentData: PaymentData,
    transactionId: string,
    totalValue: number,
    notificationUrl: string,
  ): Promise<any> {
    const cardToken = await this.createCardToken(paymentData, transactionId);

    const payload = {
      transaction_amount: totalValue,
      token: cardToken,
      installments: paymentData.installments,
      payer: paymentData.payer,
      additional_info: paymentData.additional_info,
      description: 'Pagamento do Evento Sportickets',
      external_reference: paymentData.external_reference,
      notification_url: notificationUrl,
    };

    try {
      const response = await lastValueFrom(
        this.httpService.post(`${this.baseUrl}/payments`, payload, {
          headers: this.getHeaders(transactionId),
        }),
      );
      return response.data;
    } catch (error: any) {
      throw new BadRequestException(
        `Erro ao processar pagamento com cartão: ${
          error.response?.data?.message || error.message
        }`,
      );
    }
  }

  private async processPixPayment(
    paymentData: PaymentData,
    transactionId: string,
    totalValue: number,
    notificationUrl: string,
  ): Promise<any> {
    const payload = {
      transaction_amount: totalValue,
      payment_method_id: paymentData.paymentMethodId,
      payer: paymentData.payer,
      additional_info: paymentData.additional_info,
      description: 'Pagamento do Evento Sportickets',
      external_reference: transactionId,
      statement_descriptor: 'Sportickets',
      notification_url: notificationUrl,
    };

    try {
      const response = await lastValueFrom(
        this.httpService.post(`${this.baseUrl}/payments`, payload, {
          headers: this.getHeaders(transactionId),
        }),
      );
      return response.data;
    } catch (error: any) {
      throw new BadRequestException(
        `Erro ao processar pagamento com PIX: ${
          error.response?.data?.message || error.message
        }`,
      );
    }
  }

  private transformCheckoutResultToPaymentData(
    checkoutResult: any,
    createCheckoutDto: CreateCheckoutDto,
  ): PaymentData {
    const { createdBy, paymentMethod, tickets } = checkoutResult;

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

    const ticketTotal = tickets.reduce(
      (acc: number, ticket: any) => acc + Number(ticket.price),
      0,
    );

    const eventFee = tickets[0]?.ticketLot?.ticketType?.event?.eventFee;
    if (eventFee && Number(eventFee) > 0) {
      const feeValue = ticketTotal * Number(eventFee);
      items.push({
        id: 'eventFee',
        title: `Taxa do Evento ${tickets[0]?.ticketLot?.ticketType?.event?.name}`,
        description: `Taxa de manutenção da plataforma e para o evento`,
        category_id: 'event-fee',
        quantity: 1,
        unit_price: feeValue,
        type: 'fee',
        event_date: null,
        warranty: false,
      });
    }

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
      additional_info: { items },
    };

    if (paymentData.paymentMethodId === 'credit_card') {
      const cardData = createCheckoutDto.paymentData.cardData;
      paymentData.cardNumber = cardData?.cardNumber;
      paymentData.securityCode = cardData?.securityCode;
      paymentData.expirationMonth = cardData?.expirationMonth;
      paymentData.expirationYear = cardData?.expirationYear;
      paymentData.cardHolder = {
        name: cardData?.cardHolder.name as string,
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
