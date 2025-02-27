import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { Role } from '@prisma/client';
import { Roles } from 'src/common/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';

import { PersonalizedFieldsIdParamDto } from './dto/create-personalized-fields-id.dto';
import { CreatePersonalizedFieldDto } from './dto/create-personalized-fields.dto';
import { TicketTypeIdParamDto } from './dto/ticket-type-id-param.dto';
import { UpdatePersonalizedFieldDto } from './dto/update-personalized-fields.dto';
import { PersonalizedFieldService } from './personalized-fields.service';

@Controller('personalized-fields')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN, Role.PARTNER)
export class PersonalizedFieldController {
  constructor(private readonly service: PersonalizedFieldService) {}

  @Post()
  create(@Body() createDto: CreatePersonalizedFieldDto) {
    return this.service.create(createDto);
  }

  @Get('by-ticket-type/:ticketTypeId')
  findAllByTicketType(@Param(ValidationPipe) params: TicketTypeIdParamDto) {
    return this.service.findAllByTicketType(params.ticketTypeId);
  }

  @Put(':id')
  update(
    @Param(ValidationPipe) params: PersonalizedFieldsIdParamDto,
    @Body() updateDto: UpdatePersonalizedFieldDto,
  ) {
    return this.service.update(params.id, updateDto);
  }

  @Delete(':id')
  delete(@Param(ValidationPipe) params: PersonalizedFieldsIdParamDto) {
    return this.service.delete(params.id);
  }
}
