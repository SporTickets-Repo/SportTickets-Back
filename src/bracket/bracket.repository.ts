import { Injectable } from '@nestjs/common';
import { Bracket, Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateBracketDto } from './dto/create-bracket.dto';
import { UpdateBracketListDto } from './dto/update-bracket-list.dto';

@Injectable()
export class BracketRepository {
  constructor(private readonly prisma: PrismaService) {}

  async createBracket(data: CreateBracketDto[]): Promise<Bracket[]> {
    const brackets = data.map(async (bracket) => {
      return this.prisma.bracket.create({
        data: {
          ...bracket,
          isActive: bracket.isActive ?? true,
        },
      });
    });
    return Promise.all(brackets);
  }

  async findBracketById(id: string): Promise<Bracket | null> {
    return this.prisma.bracket.findUnique({
      where: { id },
    });
  }

  async findBracketsByEvent(eventId: string): Promise<Bracket[]> {
    return this.prisma.bracket.findMany({
      where: { eventId },
    });
  }

  async updateBracket(
    id: string,
    data: Prisma.BracketUpdateInput,
  ): Promise<Bracket> {
    return this.prisma.bracket.update({
      where: { id },
      data,
    });
  }

  async deleteBracket(id: string): Promise<Bracket> {
    return this.prisma.bracket.delete({
      where: { id },
    });
  }

  async findByNameAndEvent(name: string, eventId: string) {
    return this.prisma.bracket.findFirst({
      where: { name, eventId },
    });
  }

  async updateBracketList(eventId: string, brackets: UpdateBracketListDto[]) {
    const existing = await this.findBracketsByEvent(eventId);
    const existingIds = existing.map((b) => b.id);
    const incomingIds = brackets.filter((b) => b.id).map((b) => b.id!);

    const toDelete = existing.filter((b) => !incomingIds.includes(b.id));

    return this.prisma.$transaction([
      ...toDelete.map((b) =>
        this.prisma.bracket.delete({ where: { id: b.id } }),
      ),
      ...brackets.map((b) => {
        if (b.id && existingIds.includes(b.id)) {
          return this.prisma.bracket.update({
            where: { id: b.id },
            data: {
              name: b.name,
              url: b.url,
              isActive: b.isActive,
            },
          });
        } else {
          return this.prisma.bracket.create({
            data: {
              name: b.name,
              url: b.url,
              isActive: b.isActive,
              eventId,
            },
          });
        }
      }),
    ]);
  }
}
