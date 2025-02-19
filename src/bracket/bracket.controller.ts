import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { Role } from '@prisma/client';
import { Roles } from 'src/common/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { BracketService } from './bracket.service';
import { CreateBracketDto } from './dto/create-bracket.dto';
import { UpdateBracketDto } from './dto/update-bracket.dto';

@Controller('brackets')
export class BracketController {
  constructor(private readonly bracketService: BracketService) { }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.PARTNER)
  @Post()
  async createBracket(
    @Body() createBracketDto: CreateBracketDto[],
  ) {
    return this.bracketService.create(createBracketDto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.PARTNER)
  @Put(':id')
  async updateBracket(
    @Param('id') id: string,
    @Body() updateBracketDto: UpdateBracketDto,
  ) {
    return this.bracketService.update(id, updateBracketDto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.PARTNER)
  @Delete(':id')
  async deleteBracket(@Param('id') id: string) {
    return this.bracketService.delete(id);
  }

  @Get('event/:eventId')
  async getBracketsByEvent(@Param('eventId') eventId: string) {
    return this.bracketService.getByEvent(eventId);
  }

  @Get(':id')
  async getBracket(@Param('id') id: string) {
    return this.bracketService.getOne(id);
  }
}