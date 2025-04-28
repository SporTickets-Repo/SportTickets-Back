import {
  Controller,
  Get,
  Logger,
  Param,
  Request,
  UseGuards,
} from '@nestjs/common';
import { User } from '@prisma/client';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { TransactionService } from './transaction.service';

@Controller('transactions')
@UseGuards(JwtAuthGuard)
export class TransactionController {
  private readonly logger = new Logger(TransactionController.name);

  constructor(private readonly transactionService: TransactionService) {}

  @Get(':id')
  async getTransactionById(
    @Param('id') id: string,
    @Request() req: { user: User },
  ) {
    this.logger.log(
      `Request to get transaction by ID | Transaction ID: ${id} | User ID: ${req.user.id}`,
    );
    const transaction = await this.transactionService.getTransactionById(
      id,
      req.user,
    );
    this.logger.log(
      `Transaction retrieved successfully | Transaction ID: ${id} | User ID: ${req.user.id}`,
    );
    return transaction;
  }

  @Get('event/list')
  async getTransactionsByUserEvents(@Request() req) {
    this.logger.log(
      `Request to list transactions for user events | User ID: ${req.user.id}`,
    );
    const transactions =
      await this.transactionService.getTransactionsByUserEvents(req.user.id);
    this.logger.log(
      `Transactions for user events retrieved successfully | User ID: ${req.user.id} | Total: ${transactions.length}`,
    );
    return transactions;
  }
}
