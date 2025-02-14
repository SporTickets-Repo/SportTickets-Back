import { Injectable, NotFoundException } from '@nestjs/common';
import { BlobService } from 'src/blob/blob.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { EventRepository } from './event.repository';

@Injectable()
export class EventService {
  constructor(
    private readonly eventRepository: EventRepository,
    private readonly blobService: BlobService,
  ) {}

  async create(
    createEventDto: CreateEventDto,
    userId: string,
    file?: Express.Multer.File,
  ) {
    const startDate = new Date(createEventDto.startDate);
    const endDate = new Date(createEventDto.endDate);
    let bannerUrl: string | null = null;

    if (file) {
      try {
        const result = await this.blobService.uploadFile(
          file.originalname,
          file.buffer,
          'public',
          userId,
        );
        if (result) {
          bannerUrl = result.url;
        }
      } catch (error) {
        console.error('Error uploading event file', error);
        bannerUrl = null;
      }
    }

    return this.eventRepository.createEvent(
      {
        ...createEventDto,
        startDate,
        endDate,
        bannerUrl,
      },
      userId,
    );
  }

  async update(
    id: string,
    updateEventDto: UpdateEventDto,
    file?: Express.Multer.File,
  ) {
    const existingEvent = await this.eventRepository.findEventById(id);
    if (!existingEvent) {
      throw new NotFoundException('Event not found');
    }

    const startDate = updateEventDto.startDate
      ? new Date(updateEventDto.startDate)
      : undefined;
    const endDate = updateEventDto.endDate
      ? new Date(updateEventDto.endDate)
      : undefined;

    let bannerUrl = existingEvent.bannerUrl;

    if (file) {
      try {
        const result = bannerUrl
          ? await this.blobService.updateFile(
              bannerUrl,
              file.originalname,
              file.buffer,
              'public',
              existingEvent.id,
            )
          : await this.blobService.uploadFile(
              file.originalname,
              file.buffer,
              'public',
              existingEvent.id,
            );

        if (result) {
          bannerUrl = result.url;
        }
      } catch (error) {
        console.error('Error uploading event file', error);
      }
    }

    const updatedEvent = await this.eventRepository.updateEvent(id, {
      ...updateEventDto,
      ...(startDate && { startDate }),
      ...(endDate && { endDate }),
      bannerUrl,
    });

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

  async getById(id: string) {
    const event = await this.eventRepository.findEventById(id);
    if (!event) {
      throw new NotFoundException('Event not found');
    }
    return event;
  }

  async getAll(query: { skip?: number; take?: number }) {
    const { skip = 0, take = 10 } = query;
    return this.eventRepository.findAllEvents(Number(skip), Number(take));
  }

  async getUserEvents(userId: string) {
    return this.eventRepository.findUserEvents(userId);
  }
}
