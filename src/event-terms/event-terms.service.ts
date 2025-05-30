import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Prisma, Role, User } from '@prisma/client';
import { BlobService } from 'src/blob/blob.service';
import { SyncEventTermsDto } from './dto/upsert-term.dto';
import { EventTermsRepository } from './event-terms.repository';

@Injectable()
export class EventTermsService {
  constructor(
    private readonly repo: EventTermsRepository,
    private readonly blob: BlobService,
  ) {}

  async syncEventTerms(
    eventId: string,
    user: User,
    { terms }: SyncEventTermsDto,
    files: Express.Multer.File[],
    fileIndices: number[] = [],
  ) {
    const event = await this.repo.getEventWithAccess(eventId);

    const hasAccess =
      user.role === Role.MASTER ||
      event?.createdBy === user.id ||
      event?.eventDashboardAccess.some((access) => access.userId === user.id);

    if (!hasAccess) {
      throw new ForbiddenException(
        'Você não tem permissão para editar os termos deste evento.',
      );
    }

    const existingTerms = await this.repo.findByEvent(eventId);
    const receivedIds = terms.filter((t) => t.id).map((t) => t.id as string);
    const deleteIds = existingTerms
      .filter((t) => !receivedIds.includes(t.id))
      .map((t) => t.id);

    const fileMap = new Map<number, Express.Multer.File>();
    fileIndices.forEach((termIndex, i) => {
      if (terms[termIndex] && files[i]) {
        fileMap.set(termIndex, files[i]);
      }
    });

    const createPayload: Omit<Prisma.TermCreateInput, 'event'>[] = [];
    const updatePayload: {
      id: string;
      title: string;
      isObligatory: boolean;
    }[] = [];
    const additionalDeleteIds: string[] = [];

    for (let i = 0; i < terms.length; i++) {
      const term = terms[i];
      const file = fileMap.get(i);

      if (term.id && file) {
        const { url } = await this.blob.uploadFile(
          file.originalname,
          file.buffer,
          'public',
          user.id,
        );
        createPayload.push({
          title: term.title,
          isObligatory: term.isObligatory,
          fileUrl: url,
        });
        additionalDeleteIds.push(term.id);
      } else if (term.id && !file) {
        updatePayload.push({
          id: term.id,
          title: term.title,
          isObligatory: term.isObligatory,
        });
      } else if (!term.id) {
        if (!file) {
          throw new BadRequestException(
            `File not provided for new term at index ${i}`,
          );
        }
        const { url } = await this.blob.uploadFile(
          file.originalname,
          file.buffer,
          'public',
          user.id,
        );
        createPayload.push({
          title: term.title,
          isObligatory: term.isObligatory,
          fileUrl: url,
        });
      }
    }

    await this.repo.syncTerms(eventId, createPayload, updatePayload, [
      ...deleteIds,
      ...additionalDeleteIds,
    ]);

    return this.repo.findByEvent(eventId);
  }
}
