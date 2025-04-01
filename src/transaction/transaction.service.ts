import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { TransactionRepository } from './transaction.repository';

@Injectable()
export class TransactionService {
  constructor(private readonly transactionRepository: TransactionRepository) {}

  async getTransactionById(id: string, userId: string) {
    const tx = await this.transactionRepository.findById(id);
    if (!tx) throw new NotFoundException('Transaction not found');
    if (tx.createdById !== userId)
      throw new ForbiddenException('Access denied');
    return tx;
  }

  async getTransactionsByUserEvents(userId: string) {
    return this.transactionRepository.findByUserEvents(userId);
  }
}
