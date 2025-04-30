import { Injectable } from '@nestjs/common';
import { TicketRepository } from './ticket.repository';

@Injectable()
export class TicketService {
  constructor(private readonly ticketRepository: TicketRepository) {}

  async getMyTickets(userId: string) {
    return this.ticketRepository.findTicketsByUser(userId);
  }

  async getMyTicketsMaster(userId: string) {
    return this.ticketRepository.findTicketsByUser(userId);
  }

  async getAllTickets(userId: string) {
    return this.ticketRepository.findAllTickets(userId);
  }

  async getTicketByCode(code: string) {
    return this.ticketRepository.findTicketByCode(code);
  }

  async getAllTicketsMaster(userId: string) {
    return this.ticketRepository.findAllTickets(userId);
  }
}
