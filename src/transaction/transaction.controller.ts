import {
  BadRequestException,
  Controller,
  Get,
  Logger,
  Param,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { Role, User } from '@prisma/client';
import { isUUID } from 'class-validator';
import { Roles } from 'src/common/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { TransactionService } from './transaction.service';

@Controller('transactions')
@UseGuards(JwtAuthGuard, RolesGuard)
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

  @Roles(Role.MASTER)
  @Post(':id/refund')
  async refundFreeTransaction(
    @Param('id') id: string,
    @Request() req: { user: User },
  ) {
    if (!isUUID(id)) {
      throw new BadRequestException('Invalid transaction ID format');
    }

    this.logger.log(
      `Request to refund FREE transaction | Transaction ID: ${id} | User ID: ${req.user.id}`,
    );

    const result = await this.transactionService.refundFreeTransaction(
      id,
      req.user,
    );

    this.logger.log(
      `Refund processed successfully | Transaction ID: ${id} | User ID: ${req.user.id}`,
    );

    return result;
  }
}
