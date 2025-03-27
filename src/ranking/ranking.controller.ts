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
import { CreateRankingDto } from './dto/create-ranking.dto';
import { UpdateRankingListDto } from './dto/update-ranking-list.dto';
import { UpdateRankingDto } from './dto/update-ranking.dto';
import { RankingService } from './ranking.service';

@Controller('rankings')
export class RankingController {
  constructor(private readonly rankingService: RankingService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.PARTNER)
  @Post()
  async create(@Body() createRankingDto: CreateRankingDto[]) {
    return this.rankingService.create(createRankingDto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.PARTNER)
  @Put(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateRankingDto) {
    return this.rankingService.update(id, dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.PARTNER)
  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.rankingService.delete(id);
  }

  @Get('event/:eventId')
  async getByEvent(@Param('eventId') eventId: string) {
    return this.rankingService.getByEvent(eventId);
  }

  @Get(':id')
  async getOne(@Param('id') id: string) {
    return this.rankingService.getOne(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.PARTNER)
  @Put('list/:id')
  async updateRankingList(
    @Param('id') eventId: string,
    @Body() payload: UpdateRankingListDto[],
  ) {
    return this.rankingService.updateRankingList(eventId, payload);
  }
}
