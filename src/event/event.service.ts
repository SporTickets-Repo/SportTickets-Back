import {
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { EventStatus, Prisma } from '@prisma/client';
import { BlobService } from 'src/blob/blob.service';
import { FilterEventsDto } from './dto/filter-events.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { EventRepository } from './event.repository';

@Injectable()
export class EventService {
  private readonly logger = new Logger(EventService.name);

  constructor(
    private readonly eventRepository: EventRepository,
    private readonly blobService: BlobService,
  ) {}

  async update(
    id: string,
    updateEventDto: UpdateEventDto,
    files?: { banner?: Express.Multer.File[]; small?: Express.Multer.File[] },
  ) {
    const existingEvent = await this.eventRepository.findEventById(id);
    if (!existingEvent) {
      throw new NotFoundException('Event not found');
    }

    const existingSlug = await this.eventRepository.findEventBySlug(
      updateEventDto.slug,
    );

    if (existingSlug && existingSlug.id !== id) {
      throw new ConflictException('Slug already in use by another event');
    }

    const startDate = updateEventDto.startDate
      ? new Date(updateEventDto.startDate)
      : undefined;
    const endDate = updateEventDto.endDate
      ? new Date(updateEventDto.endDate)
      : undefined;

    let bannerUrl = existingEvent.bannerUrl;
    let smallImageUrl = existingEvent.smallImageUrl;

    if (files) {
      if (files.banner && files.banner.length > 0) {
        const bannerFile = files.banner[0];
        try {
          const result = bannerUrl
            ? await this.blobService.updateFile(
                bannerUrl,
                bannerFile.originalname,
                bannerFile.buffer,
                'public',
                existingEvent.id,
              )
            : await this.blobService.uploadFile(
                bannerFile.originalname,
                bannerFile.buffer,
                'public',
                existingEvent.id,
              );
          if (result) {
            bannerUrl = result.url;
          }
        } catch (error) {
          this.logger.error(`Error uploading event file for banner`, error);
        }
      }

      if (files.small && files.small.length > 0) {
        const smallFile = files.small[0];
        try {
          const result = smallImageUrl
            ? await this.blobService.updateFile(
                smallImageUrl,
                smallFile.originalname,
                smallFile.buffer,
                'public',
                existingEvent.id,
              )
            : await this.blobService.uploadFile(
                smallFile.originalname,
                smallFile.buffer,
                'public',
                existingEvent.id,
              );
          if (result) {
            smallImageUrl = result.url;
          }
        } catch (error) {
          this.logger.error(`Error uploading event file for small`, error);
        }
      }
    }

    const { address, ...rest } = updateEventDto;

    const paymentMethods =
      updateEventDto.paymentMethods &&
      !Array.isArray(updateEventDto.paymentMethods)
        ? [updateEventDto.paymentMethods]
        : updateEventDto.paymentMethods;

    const data: Prisma.EventUpdateInput = {
      ...rest,
      ...(startDate && { startDate }),
      ...(endDate && { endDate }),
      paymentMethods: paymentMethods ?? [],
      bannerUrl,
      smallImageUrl,
      ...(address
        ? {
            address: {
              upsert: {
                update: { ...address },
                create: {
                  zipCode: address.zipCode as string,
                  street: address.street ?? '',
                  complement: address.complement ?? '',
                  number: address.number ?? '',
                  neighborhood: address.neighborhood ?? '',
                  city: address.city ?? '',
                  state: address.state ?? '',
                },
              },
            },
          }
        : {}),
    };

    const updatedEvent = await this.eventRepository.updateEvent(id, data);
    if (!updatedEvent) {
      throw new NotFoundException('Event not found');
    }
    return updatedEvent;
  }

  async delete(id: string) {
    const deletedEvent = await this.eventRepository.deleteEvent(id);
    if (!deletedEvent) {
      throw new NotFoundException('Event not found');
    }
    return { message: 'Event deleted successfully' };
  }

  async getOne(id: string) {
    const event = await this.eventRepository.findEventById(id);
    if (!event) {
      throw new NotFoundException('Event not found');
    }
    return event;
  }

  async getAll(query: {
    page: number;
    limit: number;
    filter?: string;
    sort?: string;
  }) {
    const { page, limit, filter, sort } = query;
    const skip = (page - 1) * limit;
    return this.eventRepository.findAllEvents(skip, limit, filter, sort);
  }

  async getUserEvents(userId: string) {
    return this.eventRepository.findUserEvents(userId);
  }

  async getEventBySlug(slug: string) {
    const event = await this.eventRepository.findEventBySlug(slug);
    if (!event) {
      throw new NotFoundException('Event not found');
    }
    return event;
  }

  async getFilteredEvents(filters: FilterEventsDto) {
    return this.eventRepository.findFilteredEvents(filters);
  }

  async initEvent(userId: string) {
    const existingEmptyEvent =
      await this.eventRepository.findEmptyEventByUser(userId);

    if (existingEmptyEvent) {
      if (existingEmptyEvent.status === EventStatus.CANCELLED) {
        await this.eventRepository.setStatus(
          existingEmptyEvent.id,
          EventStatus.DRAFT,
        );
      }
      return {
        message: 'Event already initialized',
        eventId: existingEmptyEvent.id,
      };
    }

    const newEvent = await this.eventRepository.createEmptyEvent(userId);

    return { message: 'Event initialized successfully', eventId: newEvent.id };
  }

  async userHasEventPermission(userId: string, eventId: string) {
    return this.eventRepository.userHasEventPermission(userId, eventId);
  }

  async setStatus(eventId: string, status: EventStatus) {
    const currentStatus = await this.eventRepository.getEventStatus(eventId);

    return this.eventRepository.setStatus(eventId, status);
  }
}
