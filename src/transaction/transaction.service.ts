import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { TransactionStatus } from '@prisma/client';
import { CheckoutService } from 'src/checkout/checkout.service';
import { TransactionRepository } from './transaction.repository';

@Injectable()
export class TransactionService {
  constructor(
    private readonly transactionRepository: TransactionRepository,
    private readonly checkoutService: CheckoutService,
  ) {}

  async getTransactionById(id: string, userId: string) {
    const tx = await this.transactionRepository.findById(id);

    if (!tx) throw new NotFoundException('Transaction not found');
    if (tx.createdById !== userId)
      throw new ForbiddenException('Access denied');

    if (tx.status === TransactionStatus.APPROVED) {
      const undeliveredTickets = tx.tickets.some(
        (ticket) => ticket.deliveredAt === null,
      );

      if (undeliveredTickets) {
        this.checkoutService.handleApprovedTransaction(tx.id);
      }
    }

    return tx;
  }

  async getTransactionsByUserEvents(userId: string) {
    return this.transactionRepository.findByUserEvents(userId);
  }
}
