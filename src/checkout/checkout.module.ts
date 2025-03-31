import { Module } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CheckoutController } from './checkout.controller';
import { CheckoutService } from './checkout.service';

@Module({
  controllers: [CheckoutController],
  providers: [CheckoutService, PrismaService],
})
export class CheckoutModule {}
