import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateRankingDto } from './dto/create-ranking.dto';
import { UpdateRankingListDto } from './dto/update-ranking-list.dto';

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
  async findByNameAndEvent(name: string, eventId: string) {
    return this.prisma.ranking.findFirst({
      where: { name, eventId },
    });
  }

  async updateRankingList(eventId: string, rankings: UpdateRankingListDto[]) {
    const existingRankings = await this.findByEvent(eventId);
    const existingIds = existingRankings.map((r) => r.id);
    const incomingIds = rankings.filter((r) => r.id).map((r) => r.id!);

    const toDelete = existingRankings.filter(
      (r) => !incomingIds.includes(r.id),
    );

    return this.prisma.$transaction([
      ...toDelete.map((r) =>
        this.prisma.ranking.delete({ where: { id: r.id } }),
      ),
      ...rankings.map((r) => {
        if (r.id && existingIds.includes(r.id)) {
          return this.prisma.ranking.update({
            where: { id: r.id },
            data: {
              name: r.name,
              url: r.url,
              isActive: r.isActive,
            },
          });
        } else {
          return this.prisma.ranking.create({
            data: {
              name: r.name,
              url: r.url,
              isActive: r.isActive,
              eventId,
            },
          });
        }
      }),
    ]);
  }
}
