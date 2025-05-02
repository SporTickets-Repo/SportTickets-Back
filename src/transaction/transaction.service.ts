import {
  BadRequestException,
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
    const tx = await this.transactionRepository.findById(id);

    if (!tx) {
      this.logger.warn(`Tx not found | ${id}`);
      throw new NotFoundException('Transaction not found');
    }

    if (tx.createdById !== user.id && user.role !== Role.MASTER) {
      this.logger.warn(`Forbidden access | Tx ${id} by ${user.id}`);
      throw new ForbiddenException('Access denied');
    }

    if (
      (tx.status === TransactionStatus.REFUNDED && !tx.refundedAt) ||
      (tx.status === TransactionStatus.CHARGED_BACK && !tx.refundedAt) ||
      tx.status === TransactionStatus.APPROVED
    ) {
      await this.handleTransactionByStatus(tx.id, tx.status);
      this.logger.log(`Business handled | Tx ${id} | Status ${tx.status}`);
    }

    return tx;
  }

  async getTransactionsByUserEvents(userId: string) {
    return this.transactionRepository.findByUserEvents(userId);
  }

  private async handleTransactionByStatus(
    transactionId: string,
    status: TransactionStatus,
  ) {
    switch (status) {
      case TransactionStatus.AUTHORIZED:
      case TransactionStatus.APPROVED:
        await this.checkoutService.handleApprovedTransaction(transactionId);
        break;
      case TransactionStatus.CHARGED_BACK:
      case TransactionStatus.REFUNDED:
        await this.checkoutService.handleRefundedTransaction(transactionId);
        break;
      default:
        this.logger.warn(`Unhandled status | Tx ${transactionId} | ${status}`);
    }
  }

  async refundFreeTransaction(transactionId: string, user: User) {
    const tx = await this.transactionRepository.findById(transactionId);

    if (!tx) {
      this.logger.warn(`Tx not found | ${transactionId}`);
      throw new NotFoundException('Transaction not found.');
    }

    if (tx.paymentMethod !== 'FREE' || tx.totalValue.gt(0)) {
      this.logger.warn(`Not FREE | Tx ${transactionId}`);
      throw new BadRequestException(
        'Refund not allowed for this payment method.',
      );
    }

    await this.checkoutService.handleRefundedTransaction(transactionId);
    this.logger.log(`FREE refund completed | Tx ${transactionId}`);

    return { message: 'Free transaction refunded successfully.' };
  }
}
