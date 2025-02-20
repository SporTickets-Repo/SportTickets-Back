import { Module } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { DashboardController } from './dashboard.controller';
import { DashboardRepository } from './dashboard.repository';
import { DashboardService } from './dashboard.service';

@Module({
  controllers: [DashboardController],
  providers: [DashboardService, DashboardRepository, PrismaService],
})
export class DashboardModule {}
