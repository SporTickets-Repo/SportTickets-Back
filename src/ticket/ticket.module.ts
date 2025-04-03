import { Module } from '@nestjs/common';
import { TicketController } from './ticket.controller';
import { TicketService } from './ticket.service';

import { PrismaService } from 'src/prisma/prisma.service';
import { TicketRepository } from './ticket.repository';

@Module({
  controllers: [TicketController],
  providers: [TicketService, TicketRepository, PrismaService],
})
export class TicketModule {}
