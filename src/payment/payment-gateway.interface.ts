import { CreateCheckoutDto } from 'src/checkout/dto/create-checkout.dto';

export interface PaymentGateway {
  processPayment(
    checkoutResult: any,
    createCheckoutDto: CreateCheckoutDto,
  ): Promise<any>;
}
export interface PaymentData {
  paymentMethodId: 'pix' | 'credit_card';
  email: string;
  cardNumber?: string;
  securityCode?: string;
  expirationMonth?: number;
  expirationYear?: number;
  cardHolder?: {
    name: string;
    identification: {
      type: string;
      number: string;
    };
  };
  payer: {
    email: string;
    first_name: string;
    last_name: string;
    identification: {
      type: string;
      number: string;
    };
  };
  installments?: number;
  additional_info: {
    items: [
      {
        id: string;
        title: string;
        description: string;
        category_id: string;
        quantity: number;
        unit_price: number;
        type: string;
        event_date: string;
        warranty: boolean;
      },
    ];
  };
  application_fee: number;
  external_reference: string;
}
