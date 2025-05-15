import { Module } from '@nestjs/common';
import { BlobService } from 'src/blob/blob.service';
import { AppConfigModule } from 'src/config/config.module';
import { PrismaService } from 'src/prisma/prisma.service';
import { EventTermsController } from './event-terms.controller';
import { EventTermsRepository } from './event-terms.repository';
import { EventTermsService } from './event-terms.service';

@Module({
  imports: [AppConfigModule],
  controllers: [EventTermsController],
  providers: [
    EventTermsService,
    EventTermsRepository,
    PrismaService,
    BlobService,
  ],
  exports: [EventTermsService, EventTermsRepository],
})
export class EventTermsModule {}
