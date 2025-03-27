import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateRankingDto } from './dto/create-ranking.dto';
import { UpdateRankingDto } from './dto/update-ranking.dto';
import { RankingRepository } from './ranking.repository';

@Injectable()
export class RankingService {
  constructor(private readonly rankingRepository: RankingRepository) {}

  async create(dto: CreateRankingDto[]) {
    return this.rankingRepository.createMany(dto);
  }

  async getOne(id: string) {
    const ranking = await this.rankingRepository.findById(id);
    if (!ranking) throw new NotFoundException('Ranking not found');
    return ranking;
  }

  async getByEvent(eventId: string) {
    return this.rankingRepository.findByEvent(eventId);
  }

  async update(id: string, dto: UpdateRankingDto) {
    const updated = await this.rankingRepository.update(id, dto);
    if (!updated) throw new NotFoundException('Ranking not found');
    return updated;
  }

  async delete(id: string) {
    const deleted = await this.rankingRepository.delete(id);
    if (!deleted) throw new NotFoundException('Ranking not found');
    return { message: 'Ranking deleted successfully' };
  }
}
