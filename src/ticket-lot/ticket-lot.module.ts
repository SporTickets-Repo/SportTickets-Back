import { Module } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { TicketTypeRepository } from 'src/ticket-types/ticket-types.repository';
import { TicketLotController } from './ticket-lot.controller';
import { TicketLotRepository } from './ticket-lot.repository';
import { TicketLotService } from './ticket-lot.service';

@Module({
  controllers: [TicketLotController],
  providers: [
    TicketLotService,
    TicketLotRepository,
    PrismaService,
    TicketTypeRepository,
  ],
  exports: [TicketLotService],
})
export class TicketLotModule {}
