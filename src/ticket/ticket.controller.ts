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

  @Roles(Role.MASTER)
  @Get('my-tickets-master/:userId')
  async getMyTicketsMaster(@Param('userId') userId: string) {
    return this.ticketService.getMyTicketsMaster(userId);
  }

  @Get('all')
  async getAllTickets(@Request() req: { user: User }) {
    return this.ticketService.getAllTickets(req.user.id);
  }

  @Roles(Role.MASTER)
  @Get('all-master/:userId')
  async getAllTicketsMaster(@Param('userId') userId: string) {
    return this.ticketService.getAllTicketsMaster(userId);
  }
}
