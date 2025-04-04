import { Module, forwardRef } from '@nestjs/common';
import { CheckoutModule } from 'src/checkout/checkout.module';
import { PrismaService } from 'src/prisma/prisma.service';
import { TransactionController } from './transaction.controller';
import { TransactionRepository } from './transaction.repository';
import { TransactionService } from './transaction.service';

@Module({
  imports: [forwardRef(() => CheckoutModule)],
  controllers: [TransactionController],
  providers: [TransactionService, TransactionRepository, PrismaService],
})
export class TransactionModule {}
