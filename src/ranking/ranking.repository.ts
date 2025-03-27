import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateRankingDto } from './dto/create-ranking.dto';

@Injectable()
export class RankingRepository {
  constructor(private readonly prisma: PrismaService) {}

  async createMany(data: CreateRankingDto[]) {
    return Promise.all(
      data.map((ranking) =>
        this.prisma.ranking.create({
          data: {
            ...ranking,
            isActive: ranking.isActive ?? true,
          },
        }),
      ),
    );
  }

  async findById(id: string) {
    return this.prisma.ranking.findUnique({ where: { id } });
  }

  async findByEvent(eventId: string) {
    return this.prisma.ranking.findMany({ where: { eventId } });
  }

  async update(id: string, data: Prisma.RankingUpdateInput) {
    return this.prisma.ranking.update({ where: { id }, data });
  }

  async delete(id: string) {
    return this.prisma.ranking.delete({ where: { id } });
  }
}
