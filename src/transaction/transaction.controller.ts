import { Controller, Get, Param, Request, UseGuards } from '@nestjs/common';
import { User } from '@prisma/client';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { TransactionService } from './transaction.service';

@Controller('transactions')
@UseGuards(JwtAuthGuard)
export class TransactionController {
  constructor(private readonly transactionService: TransactionService) {}

  @Get(':id')
  async getTransactionById(
    @Param('id') id: string,
    @Request() req: { user: User },
  ) {
    return this.transactionService.getTransactionById(id, req.user);
  }

  @Get('event/list')
  async getTransactionsByUserEvents(@Request() req) {
    return this.transactionService.getTransactionsByUserEvents(req.user.id);
  }
}
