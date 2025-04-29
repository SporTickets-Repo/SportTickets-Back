import { Controller, Get, Param, Request, UseGuards } from '@nestjs/common';
import { Role, User } from '@prisma/client';
import { Roles } from 'src/common/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { TicketService } from './ticket.service';

@Controller('tickets')
@UseGuards(JwtAuthGuard, RolesGuard)
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

  @Roles(Role.MASTER)
  @Get('by-code/:code')
  async getTicketByCode(@Param('code') code: string) {
    if (!code) {
      throw new Error('Code is required');
    }

    return this.ticketService.getTicketByCode(code);
  }
}
