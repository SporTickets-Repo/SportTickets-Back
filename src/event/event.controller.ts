import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Query,
  Request,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
  ValidationPipe,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { EventLevel, EventType, Role, User } from '@prisma/client';
import { isUUID } from 'class-validator';
import { Roles } from 'src/common/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { FilterEventsDto } from './dto/filter-events.dto';
import { GetAllEventsDto } from './dto/get-all-events.dto';
import { GetEventByIdDto } from './dto/get-event-by-id.dto';
import { GetEventBySlugDto } from './dto/get-event-by-slug.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { EventService } from './event.service';

@ApiBearerAuth()
@ApiTags('events')
@Controller('events')
export class EventController {
  constructor(private readonly eventService: EventService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.PARTNER)
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'banner', maxCount: 1 },
      { name: 'small', maxCount: 1 },
    ]),
  )
  @ApiConsumes('multipart/form-data')
  @Put(':id')
  async updateEvent(
    @Param('id') id: string,
    @Body() updateEventDto: UpdateEventDto,
    @UploadedFiles()
    files?: { banner?: Express.Multer.File[]; small?: Express.Multer.File[] },
  ) {
    if (files) {
      for (const field in files) {
        const fileArray = files[field];
        if (fileArray) {
          for (const file of fileArray) {
            if (file && !file.mimetype.startsWith('image')) {
              throw new BadRequestException(
                `Invalid image file for ${file.fieldname}`,
              );
            }
          }
        }
      }
    }

    if (!isUUID(id)) {
      throw new BadRequestException('Invalid event ID');
    }

    return this.eventService.update(id, updateEventDto, files);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.PARTNER)
  @Get('my-events')
  async getMyEvents(@Request() req: { user: User }) {
    return this.eventService.getUserEvents(req.user.id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.PARTNER)
  @Post('init')
  async initEvent(@Request() req: { user: User }) {
    return this.eventService.initEvent(req.user.id);
  }

  @Get('all')
  async getAllEvents(@Query(ValidationPipe) query: GetAllEventsDto) {
    const { page, limit, filter, sort } = query;
    return this.eventService.getAll({ page, limit, filter, sort });
  }

  @Get('filter')
  async getFilteredEvents(@Query(ValidationPipe) filters: FilterEventsDto) {
    return this.eventService.getFilteredEvents(filters);
  }

  @Get('types')
  getEventTypes() {
    return Object.values(EventType);
  }

  @Get('levels')
  getEventLevels() {
    return Object.values(EventLevel);
  }

  @Get('slug/:slug')
  async getEventBySlug(@Param(ValidationPipe) payload: GetEventBySlugDto) {
    return this.eventService.getEventBySlug(payload.slug);
  }

  @Get(':id')
  async getEvent(@Param(ValidationPipe) payload: GetEventByIdDto) {
    return this.eventService.getOne(payload.id);
  }
}
