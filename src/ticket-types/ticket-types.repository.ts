import { Injectable } from '@nestjs/common';
import {
  Category,
  PersonalizedField,
  Prisma,
  Restriction,
  TicketLot,
  TicketType,
} from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateTicketTypeDto } from './dto/create-ticket-type.dto';
import { UpsertTicketTypeDto } from './dto/upsert-ticket.dto';

@Injectable()
export class TicketTypeRepository {
  constructor(private readonly prisma: PrismaService) {}

  async createTicketType(data: CreateTicketTypeDto): Promise<TicketType> {
    return this.prisma.ticketType.create({ data });
  }

  async findTicketTypeById(id: string): Promise<TicketType | null> {
    return this.prisma.ticketType.findUnique({
      where: { id },
    });
  }

  async findAllTicketTypes(skip: number, take: number): Promise<TicketType[]> {
    return this.prisma.ticketType.findMany({
      skip,
      take,
    });
  }

  async findAllTicketTypesByEvent(eventId: string) {
    return this.prisma.ticketType.findMany({
      where: { eventId, deletedAt: null },
      include: {
        categories: true,
        personalizedFields: true,
        ticketLots: true,
      },
    });
  }

  async updateTicketType(
    id: string,
    data: Prisma.TicketTypeUpdateInput,
  ): Promise<TicketType> {
    return this.prisma.ticketType.update({
      where: { id },
      data,
    });
  }

  async deleteTicketType(id: string): Promise<TicketType> {
    return this.prisma.ticketType.delete({
      where: { id },
    });
  }

  async bulkUpsertTicket(dtos: UpsertTicketTypeDto[], eventId: string) {
    return this.prisma.$transaction(async (tx) => {
      const results: (TicketType & {
        categories: Category[];
        personalizedFields: PersonalizedField[];
        ticketLots: TicketLot[];
      })[] = [];

      const existingTicketTypes = await tx.ticketType.findMany({
        where: {
          eventId,
          deletedAt: null,
        },
        include: {
          categories: {
            where: { deletedAt: null },
          },
          personalizedFields: {
            where: { deletedAt: null },
          },
          ticketLots: {
            where: { deletedAt: null },
          },
        },
      });

      const existingIds = existingTicketTypes.map((t) => t.id);

      const incomingIds = dtos.filter((dto) => dto.id).map((dto) => dto.id!);

      const toSoftDelete = existingTicketTypes.filter(
        (et) => !incomingIds.includes(et.id),
      );

      for (const t of toSoftDelete) {
        await tx.ticketType.update({
          where: { id: t.id },
          data: { deletedAt: new Date() },
        });
      }

      for (const dto of dtos) {
        let ticketType: TicketType | null = null;

        if (dto.id) {
          ticketType = await tx.ticketType.findUnique({
            where: { id: dto.id },
          });
        } else {
          ticketType = await tx.ticketType.findFirst({
            where: {
              eventId,
              name: dto.name,
            },
          });
        }

        if (ticketType) {
          ticketType = await tx.ticketType.update({
            where: { id: ticketType.id },
            data: {
              name: dto.name,
              description: dto.description ?? '',
              userType: dto.userType,
              teamSize: dto.teamSize,
              deletedAt: null,
            },
          });
        } else {
          ticketType = await tx.ticketType.create({
            data: {
              eventId,
              name: dto.name,
              description: dto.description ?? '',
              userType: dto.userType,
              teamSize: dto.teamSize,
            },
          });
        }

        const ticketTypeId = ticketType.id;

        if (dto.categories) {
          const existingCategories = await tx.category.findMany({
            where: { ticketTypeId, deletedAt: null },
          });
          const existingCatIds = existingCategories.map((c) => c.id);

          const incomingCatIds = dto.categories
            .filter((c) => c.id)
            .map((c) => c.id as string);

          const catToSoftDelete = existingCategories.filter(
            (ec) => !incomingCatIds.includes(ec.id),
          );
          for (const cat of catToSoftDelete) {
            await tx.category.update({
              where: { id: cat.id },
              data: { deletedAt: new Date() },
            });
          }

          for (const cat of dto.categories) {
            if (cat.id && existingCatIds.includes(cat.id)) {
              await tx.category.update({
                where: { id: cat.id },
                data: {
                  title: cat.title,
                  quantity: cat.quantity,
                  restriction: cat.restriction ?? Restriction.NONE,
                  deletedAt: null,
                },
              });
            } else {
              await tx.category.create({
                data: {
                  ticketTypeId,
                  title: cat.title,
                  quantity: cat.quantity,
                  restriction: cat.restriction ?? Restriction.NONE,
                },
              });
            }
          }
        }

        if (dto.personalizedFields) {
          const existingFields = await tx.personalizedField.findMany({
            where: { ticketTypeId, deletedAt: null },
          });
          const existingPFIds = existingFields.map((f) => f.id);

          const incomingPFIds = dto.personalizedFields
            .filter((f) => f.id)
            .map((f) => f.id!);

          const pfToSoftDelete = existingFields.filter(
            (ef) => !incomingPFIds.includes(ef.id),
          );
          for (const f of pfToSoftDelete) {
            await tx.personalizedField.update({
              where: { id: f.id },
              data: { deletedAt: new Date() },
            });
          }

          for (const pf of dto.personalizedFields) {
            if (pf.id && existingPFIds.includes(pf.id)) {
              await tx.personalizedField.update({
                where: { id: pf.id },
                data: {
                  requestTitle: pf.question,
                  type: pf.type,
                  optionsList: pf.optionsList ?? [],
                  deletedAt: null,
                },
              });
            } else {
              await tx.personalizedField.create({
                data: {
                  ticketTypeId,
                  requestTitle: pf.question,
                  type: pf.type,
                  optionsList: pf.optionsList ?? [],
                },
              });
            }
          }
        }

        if (dto.ticketLots) {
          const existingLots = await tx.ticketLot.findMany({
            where: { ticketTypeId, deletedAt: null },
          });
          const existingLotIds = existingLots.map((l) => l.id);

          const incomingLotIds = dto.ticketLots
            .filter((l) => l.id)
            .map((l) => l.id!);

          const lotToSoftDelete = existingLots.filter(
            (el) => !incomingLotIds.includes(el.id),
          );
          for (const lot of lotToSoftDelete) {
            await tx.ticketLot.update({
              where: { id: lot.id },
              data: { deletedAt: new Date() },
            });
          }

          for (const lot of dto.ticketLots) {
            if (lot.id && existingLotIds.includes(lot.id)) {
              await tx.ticketLot.update({
                where: { id: lot.id },
                data: {
                  name: lot.name,
                  price: lot.price,
                  quantity: lot.quantity,
                  startDate: new Date(lot.startDate),
                  endDate: new Date(lot.endDate),
                  isActive: lot.isActive,
                  deletedAt: null,
                },
              });
            } else {
              await tx.ticketLot.create({
                data: {
                  ticketTypeId,
                  name: lot.name,
                  price: lot.price,
                  quantity: lot.quantity,
                  startDate: new Date(lot.startDate),
                  endDate: new Date(lot.endDate),
                  isActive: lot.isActive,
                },
              });
            }
          }
        }

        const finalTicketType = await tx.ticketType.findUnique({
          where: { id: ticketTypeId },
          include: {
            categories: {
              where: { deletedAt: null },
            },
            personalizedFields: {
              where: { deletedAt: null },
            },
            ticketLots: {
              where: { deletedAt: null },
            },
          },
        });

        if (finalTicketType) {
          results.push(finalTicketType);
        }
      }

      return results;
    });
  }
}
