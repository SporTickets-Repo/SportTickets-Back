import { Module } from '@nestjs/common';
import { BlobService } from 'src/blob/blob.service';
import { AppConfigModule } from 'src/config/config.module';
import { PrismaService } from 'src/prisma/prisma.service';
import { EventController } from './event.controller';
import { EventRepository } from './event.repository';
import { EventService } from './event.service';

@Module({
  imports: [AppConfigModule],
  controllers: [EventController],
  providers: [EventService, EventRepository, PrismaService, BlobService],
  exports: [EventService, EventRepository],
})
export class EventModule {}
