import { Body, Controller, Post, Request, UseGuards } from '@nestjs/common';
import { User } from '@prisma/client';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { CheckoutService } from './checkout.service';
import { CreateCheckoutDto } from './dto/create-checkout.dto';
import { CreateFreeCheckoutDto } from './dto/create-free-checkout.dto';

@Controller('checkout')
@UseGuards(JwtAuthGuard)
export class CheckoutController {
  constructor(private readonly checkoutService: CheckoutService) {}

  @Post('/free')
  async createFreeCheckout(
    @Body() dto: CreateFreeCheckoutDto,
    @Request() req: { user: User },
  ) {
    const user = req.user;
    return this.checkoutService.createFreeOrder(dto, user);
  }

  @Post()
  async createCheckout(
    @Body() dto: CreateCheckoutDto,
    @Request() req: { user: User },
  ) {
    const user = req.user;
    return this.checkoutService.createOrder(dto, user);
  }
}
