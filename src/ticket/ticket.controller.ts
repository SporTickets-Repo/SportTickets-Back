import { Controller, Get, Request, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { TicketService } from './ticket.service';

@Controller('tickets')
@UseGuards(JwtAuthGuard)
export class TicketController {
  constructor(private readonly ticketService: TicketService) {}

  @Get('my-tickets')
  async getMyTickets(@Request() req) {
    return this.ticketService.getMyTickets(req.user.id);
  }
}
