import { Module } from '@nestjs/common';
import { AppConfigModule } from 'src/config/config.module';
import { EmailModule } from 'src/email/email.module';
import { PaymentModule } from 'src/payment/payment.module';
import { PrismaService } from 'src/prisma/prisma.service';
import { CheckoutController } from './checkout.controller';
import { CheckoutRepository } from './checkout.repository';
import { CheckoutService } from './checkout.service';

import { forwardRef } from '@nestjs/common';

@Module({
  imports: [forwardRef(() => PaymentModule), AppConfigModule, EmailModule],
  controllers: [CheckoutController],
  providers: [CheckoutService, PrismaService, CheckoutRepository],
  exports: [CheckoutService],
})
export class CheckoutModule {}
