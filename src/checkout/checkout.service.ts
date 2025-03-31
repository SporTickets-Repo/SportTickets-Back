import { Injectable } from '@nestjs/common';
import { PaymentService } from '../payment/payment.service';
import { CheckoutRepository } from './checkout.repository';
import { CreateCheckoutDto } from './dto/create-checkout.dto';

@Injectable()
export class CheckoutService {
  constructor(
    private readonly checkoutRepository: CheckoutRepository,
    private readonly paymentService: PaymentService,
  ) {}

  async createOrder(dto: CreateCheckoutDto) {
    const checkoutResult = await this.checkoutRepository.performCheckout(dto);
    console.log('Checkout Result:', checkoutResult);

    return checkoutResult;
    // const paymentResult = await this.paymentService.processPayment(
    //   checkoutResult,
    //   Number(total),
    //   transactionId,
    // );

    // Return both the order and payment details
    //return { ...checkoutResult, payment: paymentResult };
  }
}
