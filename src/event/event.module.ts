import { Module } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { EventController } from './event.controller';
import { EventRepository } from './event.repository';
import { EventService } from './event.service';

@Module({
  controllers: [EventController],
  providers: [EventService, EventRepository, PrismaService],
})
export class EventModule {}
