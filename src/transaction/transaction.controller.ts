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
    this.logger.log(`GET /transactions/${id} | User ${req.user.id}`);

    return this.transactionService.getTransactionById(id, req.user);
  }

  @Get('event/list')
  async getTransactionsByUserEvents(@Request() req) {
    return this.transactionService.getTransactionsByUserEvents(req.user.id);
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

    this.logger.log(`Refund request (FREE) | Tx ${id} | User ${req.user.id}`);

    return this.transactionService.refundFreeTransaction(id, req.user);
  }
}
