import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';

import { Role } from '@prisma/client';
import { Roles } from 'src/common/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { CreateTicketTypeDto } from './dto/create-ticket-type.dto';
import { UpdateTicketTypeDto } from './dto/update-ticket-type.dto';
import { UpsertTicketTypeDto } from './dto/upsert-ticket.dto';
import { TicketTypeService } from './ticket-types.service';

@Controller('ticket-types')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN, Role.PARTNER)
export class TicketTypeController {
  constructor(private readonly ticketTypeService: TicketTypeService) {}

  @Post()
  createTicketType(@Body() createDto: CreateTicketTypeDto) {
    return this.ticketTypeService.create(createDto);
  }

  @Put('upsert/:eventId')
  upsertTickets(
    @Param('eventId') eventId: string,
    @Body() dtos: UpsertTicketTypeDto[],
  ) {
    return this.ticketTypeService.bulkUpsert(dtos, eventId);
  }

  @Get()
  getAll(@Query() query: { skip?: number; take?: number }) {
    return this.ticketTypeService.findAll(query);
  }

  @Get('by-event/:eventId')
  getAllByEvent(@Param('eventId') eventId: string) {
    return this.ticketTypeService.findAllByEvent(eventId);
  }

  @Get(':id')
  getOne(@Param('id') id: string) {
    return this.ticketTypeService.findOne(id);
  }

  @Put(':id')
  updateTicketType(
    @Param('id') id: string,
    @Body() updateDto: UpdateTicketTypeDto,
  ) {
    return this.ticketTypeService.update(id, updateDto);
  }

  @Delete(':id')
  deleteTicketType(@Param('id') id: string) {
    return this.ticketTypeService.delete(id);
  }
}
