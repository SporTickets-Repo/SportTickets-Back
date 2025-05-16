import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, PrismaPromise } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class EventTermsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async assertEventExists(eventId: string) {
    const exists = await this.prisma.event.count({ where: { id: eventId } });
    if (!exists) throw new NotFoundException('Event not found');
  }

  findByEvent(eventId: string) {
    return this.prisma.term.findMany({
      where: { eventId, deletedAt: null },
      orderBy: { createdAt: 'asc' },
    });
  }

  private createManyTx(
    tx: Prisma.TransactionClient,
    eventId: string,
    data: Omit<Prisma.TermCreateInput, 'event'>[],
  ): PrismaPromise<any>[] {
    return data.map((d) =>
      tx.term.create({ data: { ...d, event: { connect: { id: eventId } } } }),
    );
  }

  private softDeleteManyTx(
    tx: Prisma.TransactionClient,
    termIds: string[],
  ): PrismaPromise<any>[] {
    if (!termIds.length) return [];
    return [
      tx.term.updateMany({
        where: { id: { in: termIds } },
        data: { deletedAt: new Date() },
      }),
    ];
  }

  private updateManyTx(
    tx: Prisma.TransactionClient,
    termsToUpdate: { id: string; title: string; isObligatory: boolean }[],
  ): PrismaPromise<any>[] {
    return termsToUpdate.map((t) =>
      tx.term.update({
        where: { id: t.id },
        data: {
          title: t.title,
          isObligatory: t.isObligatory,
        },
      }),
    );
  }

  async syncTerms(
    eventId: string,
    createPayload: Omit<Prisma.TermCreateInput, 'event'>[],
    updatePayload: { id: string; title: string; isObligatory: boolean }[],
    deleteIds: string[],
  ) {
    return this.prisma.$transaction(async (tx) => {
      await Promise.all([
        ...this.createManyTx(tx, eventId, createPayload),
        ...this.updateManyTx(tx, updatePayload),
        ...this.softDeleteManyTx(tx, deleteIds),
      ]);
    });
  }

  getEventWithAccess(eventId: string) {
    return this.prisma.event.findUnique({
      where: { id: eventId },
      include: {
        user: true,
        eventDashboardAccess: true,
      },
    });
  }
}
