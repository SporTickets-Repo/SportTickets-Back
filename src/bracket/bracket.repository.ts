import { Injectable } from '@nestjs/common';
import { Bracket, Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateBracketDto } from './dto/create-bracket.dto';

@Injectable()
export class BracketRepository {
  constructor(private readonly prisma: PrismaService) { }

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

  async updateBracket(id: string, data: Prisma.BracketUpdateInput): Promise<Bracket> {
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
}