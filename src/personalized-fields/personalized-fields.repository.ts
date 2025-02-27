import { Injectable } from '@nestjs/common';
import { PersonalizedField, Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreatePersonalizedFieldDto } from './dto/create-personalized-fields.dto';

@Injectable()
export class PersonalizedFieldRepository {
  constructor(private readonly prisma: PrismaService) {}

  async createPersonalizedField(
    data: CreatePersonalizedFieldDto,
  ): Promise<PersonalizedField> {
    return this.prisma.personalizedField.create({ data });
  }

  async findPersonalizedFieldById(
    id: string,
  ): Promise<PersonalizedField | null> {
    return this.prisma.personalizedField.findUnique({
      where: { id },
    });
  }

  async findAllByTicketType(
    ticketTypeId: string,
  ): Promise<PersonalizedField[]> {
    return this.prisma.personalizedField.findMany({
      where: { ticketTypeId },
    });
  }

  async updatePersonalizedField(
    id: string,
    data: Prisma.PersonalizedFieldUpdateInput,
  ): Promise<PersonalizedField> {
    return this.prisma.personalizedField.update({
      where: { id },
      data,
    });
  }

  async deletePersonalizedField(id: string): Promise<PersonalizedField> {
    return this.prisma.personalizedField.delete({
      where: { id },
    });
  }
}
