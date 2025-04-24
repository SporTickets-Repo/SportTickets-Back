import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Role, TransactionStatus, User } from '@prisma/client';
import { CheckoutService } from 'src/checkout/checkout.service';
import { TransactionRepository } from './transaction.repository';

@Injectable()
export class TransactionService {
  constructor(
    private readonly transactionRepository: TransactionRepository,
    private readonly checkoutService: CheckoutService,
  ) {}

  async getTransactionById(id: string, user: User) {
    const tx = await this.transactionRepository.findById(id);

    if (!tx) throw new NotFoundException('Transaction not found');
    if (tx.createdById !== user.id || user.role !== Role.MASTER) {
      throw new ForbiddenException('Access denied');
    }

    if (tx.status === TransactionStatus.APPROVED) {
      const undelivered = tx.tickets?.some((t) => !t.deliveredAt);
      if (undelivered) {
        await this.checkoutService.handleApprovedTransaction(tx.id);
      }
    }

    return tx;
  }

  async getTransactionsByUserEvents(userId: string) {
    return this.transactionRepository.findByUserEvents(userId);
  }
}
