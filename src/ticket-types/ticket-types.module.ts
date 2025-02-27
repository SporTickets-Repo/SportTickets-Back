import { Module } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { TicketTypeController } from './ticket-types.controller';
import { TicketTypeRepository } from './ticket-types.repository';
import { TicketTypeService } from './ticket-types.service';

@Module({
  controllers: [TicketTypeController],
  providers: [TicketTypeService, TicketTypeRepository, PrismaService],
  exports: [TicketTypeService],
})
export class TicketTypeModule {}
