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
  ValidationPipe,
} from '@nestjs/common';
import { Role } from '@prisma/client';
import { Roles } from 'src/common/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { CreateTicketLotDto } from './dto/create-ticket-lot.dto';
import { PaginationQueryDto } from './dto/pagination-query.dto';
import { TicketLotIdParamDto } from './dto/ticket-lot-id-param.dto';
import { TicketTypeIdParamDto } from './dto/ticket-type-id-param.dto';
import { UpdateTicketLotDto } from './dto/update-ticket-lot.dto';
import { TicketLotService } from './ticket-lot.service';

@Controller('ticket-lot')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN, Role.PARTNER)
export class TicketLotController {
  constructor(private readonly ticketLotService: TicketLotService) {}

  @Post()
  createTicketLot(@Body() createDto: CreateTicketLotDto) {
    return this.ticketLotService.create(createDto);
  }

  @Get()
  getAll(@Query(ValidationPipe) query: PaginationQueryDto) {
    return this.ticketLotService.findAll(query);
  }

  @Get('by-ticket-type/:ticketTypeId')
  getAllByTicketType(@Param() params: TicketTypeIdParamDto) {
    return this.ticketLotService.findAllByTicketType(params.ticketTypeId);
  }

  @Get(':id')
  getOne(@Param(ValidationPipe) params: TicketLotIdParamDto) {
    return this.ticketLotService.findOne(params.id);
  }

  @Put(':id')
  updateTicketLot(
    @Param() params: TicketLotIdParamDto,
    @Body() updateDto: UpdateTicketLotDto,
  ) {
    return this.ticketLotService.update(params.id, updateDto);
  }

  @Delete(':id')
  deleteTicketLot(@Param(ValidationPipe) params: TicketLotIdParamDto) {
    return this.ticketLotService.delete(params.id);
  }
}
