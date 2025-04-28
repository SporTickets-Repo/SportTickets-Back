import {
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { Role, TransactionStatus, User } from '@prisma/client';
import { CheckoutService } from 'src/checkout/checkout.service';
import { TransactionRepository } from './transaction.repository';

@Injectable()
export class TransactionService {
  private readonly logger = new Logger(TransactionService.name);

  constructor(
    private readonly transactionRepository: TransactionRepository,
    private readonly checkoutService: CheckoutService,
  ) {}

  async getTransactionById(id: string, user: User) {
    this.logger.log(
      `Fetching transaction | Transaction ID: ${id} | Requester User ID: ${user.id}`,
    );

    const tx = await this.transactionRepository.findById(id);

    if (!tx) {
      this.logger.warn(`Transaction not found | Transaction ID: ${id}`);
      throw new NotFoundException('Transaction not found');
    }

    if (tx.createdById !== user.id && user.role !== Role.MASTER) {
      this.logger.warn(
        `Access denied to transaction | Transaction ID: ${id} | Requester User ID: ${user.id}`,
      );
      throw new ForbiddenException('Access denied');
    }

    if (tx.status === TransactionStatus.APPROVED) {
      const undelivered = tx.tickets?.some((t) => !t.deliveredAt);
      if (undelivered) {
        this.logger.log(
          `Found undelivered tickets, reprocessing confirmation | Transaction ID: ${id}`,
        );
        await this.checkoutService.handleApprovedTransaction(tx.id);
      }
    }

    this.logger.log(`Transaction fetched successfully | Transaction ID: ${id}`);
    return tx;
  }

  async getTransactionsByUserEvents(userId: string) {
    this.logger.log(
      `Fetching transactions by user events | User ID: ${userId}`,
    );
    const transactions =
      await this.transactionRepository.findByUserEvents(userId);
    this.logger.log(
      `Fetched ${transactions.length} transactions linked to user events | User ID: ${userId}`,
    );
    return transactions;
  }
}
