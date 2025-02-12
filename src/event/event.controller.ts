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
import { Role, User } from '@prisma/client';
import { Roles } from 'src/common/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { EventService } from './event.service';

@Controller('events')
export class EventController {
  constructor(private readonly eventService: EventService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.PARTNER)
  @Post()
  async createEvent(
    @Body() createEventDto: CreateEventDto,
    @Request() req: { user: User },
  ) {
    return this.eventService.create(createEventDto, req.user.id);
  }

  @Roles(Role.ADMIN, Role.PARTNER)
  @Put(':id')
  async updateEvent(
    @Param('id') id: string,
    @Body() updateEventDto: UpdateEventDto,
  ) {
    return this.eventService.update(id, updateEventDto);
  }

  @Roles(Role.ADMIN, Role.PARTNER)
  @Delete(':id')
  async deleteEvent(@Param('id') id: string) {
    return this.eventService.delete(id);
  }

  @Get()
  async getAllEvents(@Query() query) {
    return this.eventService.getAll(query);
  }

  @UseGuards(JwtAuthGuard)
  @Roles(Role.ADMIN, Role.PARTNER)
  @Get('my-events')
  async getMyEvents(@Request() req: { user: User }) {
    return this.eventService.getUserEvents(req.user.id);
  }

  @Roles(Role.ADMIN, Role.PARTNER)
  @Get(':id')
  async getEvent(@Param('id') id: string) {
    return this.eventService.getOne(id);
  }
}
