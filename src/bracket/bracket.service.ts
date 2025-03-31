import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { BracketRepository } from './bracket.repository';
import { CreateBracketDto } from './dto/create-bracket.dto';
import { UpdateBracketListDto } from './dto/update-bracket-list.dto';
import { UpdateBracketDto } from './dto/update-bracket.dto';

@Injectable()
export class BracketService {
  constructor(private readonly bracketRepository: BracketRepository) {}

  async create(createBracketDto: CreateBracketDto[]) {
    return this.bracketRepository.createBracket(createBracketDto);
  }

  async getOne(id: string) {
    const bracket = await this.bracketRepository.findBracketById(id);
    if (!bracket) {
      throw new NotFoundException('Bracket not found');
    }
    return bracket;
  }

  async getByEvent(eventId: string) {
    return this.bracketRepository.findBracketsByEvent(eventId);
  }

  async update(id: string, updateBracketDto: UpdateBracketDto) {
    const updatedBracket = await this.bracketRepository.updateBracket(
      id,
      updateBracketDto,
    );
    if (!updatedBracket) {
      throw new NotFoundException('Bracket not found');
    }
    return updatedBracket;
  }

  async delete(id: string) {
    const deletedBracket = await this.bracketRepository.deleteBracket(id);
    if (!deletedBracket) {
      throw new NotFoundException('Bracket not found');
    }
    return { message: 'Bracket deleted successfully' };
  }

  async updateBracketList(eventId: string, brackets: UpdateBracketListDto[]) {
    const names = brackets.map((b) => b.name);
    const uniqueNames = new Set(names);
    if (names.length !== uniqueNames.size) {
      throw new ConflictException('Duplicate bracket names are not allowed');
    }

    for (const bracket of brackets) {
      const existing = await this.bracketRepository.findByNameAndEvent(
        bracket.name,
        eventId,
      );
      if (existing && existing.id !== bracket.id) {
        throw new ConflictException(
          `Bracket name "${bracket.name}" already exists for this event`,
        );
      }
    }

    return this.bracketRepository.updateBracketList(eventId, brackets);
  }
}
