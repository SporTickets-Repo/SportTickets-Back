import { Injectable } from '@nestjs/common';
import { User } from '@prisma/client';
import { PaymentService } from '../payment/payment.service';
import { CheckoutRepository } from './checkout.repository';
import { CreateCheckoutDto } from './dto/create-checkout.dto';

@Injectable()
export class CheckoutService {
  constructor(
    private readonly checkoutRepository: CheckoutRepository,
    private readonly paymentService: PaymentService,
  ) {}

  async createOrder(dto: CreateCheckoutDto, user: User) {
    const checkoutResult = await this.checkoutRepository.performCheckout(
      dto,
      user,
    );

    const paymentResult = await this.paymentService.processPayment(
      checkoutResult,
      dto,
    );

    await this.checkoutRepository.updateCheckoutTransaction(
      checkoutResult?.id as string,
      paymentResult,
    );

    return paymentResult;
  }
}
