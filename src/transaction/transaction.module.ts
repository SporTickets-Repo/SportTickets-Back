import { Module } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { TransactionController } from './transaction.controller';
import { TransactionRepository } from './transaction.repository';
import { TransactionService } from './transaction.service';

@Module({
  controllers: [TransactionController],
  providers: [TransactionService, TransactionRepository, PrismaService],
})
export class TransactionModule {}
