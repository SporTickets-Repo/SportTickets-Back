import { Controller, Get, Request, UseGuards } from '@nestjs/common';
import { User } from '@prisma/client';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { TicketService } from './ticket.service';

@Controller('tickets')
@UseGuards(JwtAuthGuard)
export class TicketController {
  constructor(private readonly ticketService: TicketService) {}

  @Get('my-tickets')
  async getMyTickets(@Request() req: { user: User }) {
    return this.ticketService.getMyTickets(req.user.id);
  }

  @Get('all')
  async getAllTickets(@Request() req: { user: User }) {
    return this.ticketService.getAllTickets(req.user.id);
  }
}
