import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { EventRepository } from './event.repository';

@Injectable()
export class EventService {
  constructor(private readonly eventRepository: EventRepository) {}

  async create(createEventDto: CreateEventDto) {
    return this.eventRepository.createEvent(createEventDto);
  }

  async getOne(id: string) {
    const event = await this.eventRepository.findEventById(id);
    if (!event) {
      throw new NotFoundException('Event not found');
    }
    return event;
  }

  async getAll(query) {
    const { skip = 0, take = 10 } = query;
    return this.eventRepository.findAllEvents(Number(skip), Number(take));
  }

  async getUserEvents(userId: string) {
    return this.eventRepository.findUserEvents(userId);
  }

  async update(id: string, updateEventDto: UpdateEventDto) {
    const updatedEvent = await this.eventRepository.updateEvent(
      id,
      updateEventDto,
    );
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
}
