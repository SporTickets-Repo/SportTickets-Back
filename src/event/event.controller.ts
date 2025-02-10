import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { Role } from '@prisma/client';
import { Roles } from 'src/common/decorators/roles.decorator';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { EventService } from './event.service';

@Controller('events')
export class EventController {
  constructor(private readonly eventService: EventService) {}

  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.PARTNER, Role.MASTER)
  @Post()
  async createEvent(@Body() createEventDto: CreateEventDto, @Request() req) {
    return this.eventService.create(createEventDto);
  }

  @Get(':id')
  async getEvent(@Param('id') id: string) {
    return this.eventService.getOne(id);
  }

  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.PARTNER, Role.MASTER)
  @Put(':id')
  async updateEvent(
    @Param('id') id: string,
    @Body() updateEventDto: UpdateEventDto,
  ) {
    return this.eventService.update(id, updateEventDto);
  }

  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.MASTER)
  @Delete(':id')
  async deleteEvent(@Param('id') id: string) {
    return this.eventService.delete(id);
  }

  @Get()
  async getAllEvents(@Query() query) {
    return this.eventService.getAll(query);
  }

  @Get('my-events')
  async getMyEvents(@Query('userId') userId: string) {
    return this.eventService.getUserEvents(userId);
  }
}
