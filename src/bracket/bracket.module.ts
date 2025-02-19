import { Module } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { BracketController } from './bracket.controller';
import { BracketService } from './bracket.service';
import { BracketRepository } from './bracket.repository';

@Module({
  controllers: [BracketController],
  providers: [BracketService, BracketRepository, PrismaService],
})
export class BracketModule { }