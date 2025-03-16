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
  UploadedFile,
  UseGuards,
  UseInterceptors,
  ValidationPipe,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { Role, User } from '@prisma/client';
import { isUUID } from 'class-validator';
import { Roles } from 'src/common/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { CreateEventDto } from './dto/create-event.dto';
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
  @Post()
  @UseInterceptors(FileInterceptor('imageFile'))
  @ApiOperation({ summary: 'Cria um novo evento' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Dados para criação do evento + arquivo de banner (opcional)',
    required: true,
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string', example: 'Sportickets event' },
        slug: { type: 'string', example: 'event-name' },
        place: { type: 'string', example: 'Event place' },
        title: { type: 'string', example: 'Volleyball event' },
        description: { type: 'string', example: 'Event of the year' },
        regulation: { type: 'string', example: 'Event regulation' },
        additionalInfo: { type: 'string', example: 'Event additional info' },
        startDate: {
          type: 'string',
          format: 'date-time',
          example: '2025-12-01T10:00:00.000Z',
        },
        endDate: {
          type: 'string',
          format: 'date-time',
          example: '2025-12-01T18:00:00.000Z',
        },
        imageFile: {
          type: 'string',
          format: 'binary',
          description: 'Banner do evento (arquivo de imagem)',
        },
      },
    },
  })
  async createEvent(
    @Body() createEventDto: CreateEventDto,
    @Request() req: { user: User },
    @UploadedFile() file?: Express.Multer.File,
  ) {
    if (file && !file.mimetype.startsWith('image')) {
      throw new BadRequestException('Invalid image file');
    }

    return this.eventService.create(createEventDto, req.user.id, file);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.PARTNER)
  @Put(':id')
  @UseInterceptors(FileInterceptor('imageFile'))
  @ApiOperation({ summary: 'Atualiza um evento existente' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description:
      'Dados para atualização do evento + arquivo de banner (opcional)',
    required: false,
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string', example: 'Novo nome do evento' },
        slug: { type: 'string', example: 'novo-event-name' },
        place: { type: 'string', example: 'Novo local do evento' },
        cep: { type: 'string', example: '72509000' },
        title: { type: 'string', example: 'Novo título' },
        description: { type: 'string', example: 'Nova descrição...' },
        regulation: { type: 'string', example: 'Regras atualizadas...' },
        additionalInfo: {
          type: 'string',
          example: 'Novas informações adicionais...',
        },
        startDate: {
          type: 'string',
          format: 'date-time',
          example: '2025-12-02T10:00:00.000Z',
        },
        endDate: {
          type: 'string',
          format: 'date-time',
          example: '2025-12-02T18:00:00.000Z',
        },
        imageFile: {
          type: 'string',
          format: 'binary',
          description: 'Novo banner do evento (arquivo de imagem)',
        },
      },
    },
  })
  async updateEvent(
    @Param('id') id: string,
    @Body() updateEventDto: UpdateEventDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    if (file && !file.mimetype.startsWith('image')) {
      throw new BadRequestException('Invalid image file');
    }

    if (!isUUID(id)) {
      throw new BadRequestException('Invalid event ID');
    }

    return this.eventService.update(id, updateEventDto, file);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.PARTNER)
  @Get('my-events')
  async getMyEvents(@Request() req: { user: User }) {
    return this.eventService.getUserEvents(req.user.id);
  }

  @Get('all')
  async getAllEvents(@Query(ValidationPipe) query: GetAllEventsDto) {
    const { page, limit, filter, sort } = query;
    return this.eventService.getAll({ page, limit, filter, sort });
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
