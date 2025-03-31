import { Injectable } from '@nestjs/common';
import { CheckoutRepository } from './checkout.repository';
import { CreateCheckoutDto } from './dto/create-checkout.dto';

@Injectable()
export class CheckoutService {
  constructor(private readonly checkoutRepository: CheckoutRepository) {}

  async createOrder(dto: CreateCheckoutDto) {
    return this.checkoutRepository.performCheckout(dto);
  }
}
