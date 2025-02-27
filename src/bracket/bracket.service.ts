import { Injectable, NotFoundException } from '@nestjs/common';
import { UpdateBracketDto } from './dto/update-bracket.dto';
import { BracketRepository } from './bracket.repository';
import { CreateBracketDto } from './dto/create-bracket.dto';

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
}
