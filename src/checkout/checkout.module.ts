import { Module } from '@nestjs/common';
import { PaymentModule } from 'src/payment/payment.module';
import { PrismaService } from 'src/prisma/prisma.service';
import { CheckoutController } from './checkout.controller';
import { CheckoutRepository } from './checkout.repository';
import { CheckoutService } from './checkout.service';

@Module({
  controllers: [CheckoutController],
  providers: [CheckoutService, PrismaService, CheckoutRepository],
  imports: [PaymentModule],
})
export class CheckoutModule {}
