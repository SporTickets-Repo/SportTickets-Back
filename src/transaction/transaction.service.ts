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

    if (
      (tx.status === TransactionStatus.REFUNDED && tx.refundedAt === null) ||
      (tx.status === TransactionStatus.CHARGED_BACK && tx.refundedAt === null)
    ) {
      await this.handleTransactionByStatus(tx.id, tx.status);
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

  private async handleTransactionByStatus(
    transactionId: string,
    status: TransactionStatus,
  ) {
    switch (status) {
      case TransactionStatus.AUTHORIZED:
      case TransactionStatus.APPROVED:
        this.logger.log(
          `Handling approved transaction | Transaction ID: ${transactionId}`,
        );
        await this.checkoutService.handleApprovedTransaction(transactionId);
        break;

      case TransactionStatus.CHARGED_BACK:
      case TransactionStatus.REFUNDED:
        this.logger.log(
          `Handling refunded transaction | Transaction ID: ${transactionId}`,
        );
        await this.checkoutService.handleRefundedTransaction(transactionId);
        break;

      default:
        this.logger.warn(
          `Unhandled transaction status | Transaction ID: ${transactionId} | Status: ${status}`,
        );
        break;
    }
  }

  async refundFreeTransaction(transactionId: string, user: User) {
    this.logger.log(
      `Refund request received | Transaction ID: ${transactionId} | User ID: ${user.id}`,
    );

    const tx = await this.transactionRepository.findById(transactionId);

    if (!tx) {
      this.logger.warn(
        `Transaction not found | Transaction ID: ${transactionId}`,
      );
      throw new NotFoundException('Transaction not found.');
    }

    if (tx.paymentMethod !== 'FREE' || tx.totalValue.gt(0)) {
      this.logger.warn(
        `Refund not allowed: Payment method is not FREE | Transaction ID: ${transactionId}`,
      );
      throw new BadRequestException(
        'Refund not allowed for this payment method.',
      );
    }

    this.logger.log(
      `Processing refund for FREE transaction | Transaction ID: ${transactionId}`,
    );

    await this.checkoutService.handleRefundedTransaction(transactionId);

    this.logger.log(
      `Refund completed for FREE transaction | Transaction ID: ${transactionId}`,
    );

    return {
      message: 'Free transaction refunded successfully.',
    };
  }
}
