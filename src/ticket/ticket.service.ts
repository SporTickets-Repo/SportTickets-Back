import { Injectable } from '@nestjs/common';
import { TicketRepository } from './ticket.repository';

@Injectable()
export class TicketService {
  constructor(private readonly ticketRepository: TicketRepository) {}

  async getMyTickets(userId: string) {
    return this.ticketRepository.findTicketsByUser(userId);
  }
}
