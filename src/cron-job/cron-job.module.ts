import { Module } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { EventStatusCronService } from './event-status.cron.service';

@Module({
  providers: [EventStatusCronService, PrismaService],
})
export class CronJobsModule {}
