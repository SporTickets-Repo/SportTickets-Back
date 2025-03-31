import { Module } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { RankingController } from './ranking.controller';
import { RankingRepository } from './ranking.repository';
import { RankingService } from './ranking.service';

@Module({
  controllers: [RankingController],
  providers: [RankingService, RankingRepository, PrismaService],
})
export class RankingModule {}
