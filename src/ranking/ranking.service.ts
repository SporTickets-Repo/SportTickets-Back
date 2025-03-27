import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateRankingDto } from './dto/create-ranking.dto';
import { UpdateRankingListDto } from './dto/update-ranking-list.dto';
import { UpdateRankingDto } from './dto/update-ranking.dto';
import { RankingRepository } from './ranking.repository';

@Injectable()
export class RankingService {
  eventRepository: any;
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

  async updateRankingList(eventId: string, rankings: UpdateRankingListDto[]) {
    const rankingNames = rankings.map((r) => r.name);
    const uniqueNames = new Set(rankingNames);
    if (rankingNames.length !== uniqueNames.size) {
      throw new ConflictException('Duplicate ranking names are not allowed');
    }

    for (const ranking of rankings) {
      const existingRanking = await this.rankingRepository.findByNameAndEvent(
        ranking.name,
        eventId,
      );
      if (existingRanking && existingRanking.id !== ranking.id) {
        throw new ConflictException(
          `Ranking name "${ranking.name}" already exists for this event`,
        );
      }
    }

    return this.rankingRepository.updateRankingList(eventId, rankings);
  }
}
