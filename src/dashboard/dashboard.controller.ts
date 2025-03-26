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
import { DashboardService } from './dashboard.service';
import { AccessEventDto } from './dto/access-event.dto';
import { AccessListEventDto } from './dto/acess-list-event.dto';
import { EventIdParamDto } from './dto/event-id-param.dto';
import { UserIdParamDto } from './dto/user-id-param.dto';

@Controller('dashboard')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Post('event/assign')
  async assignAccess(@Body() data: AccessEventDto) {
    return this.dashboardService.assignDashboardAccess(
      data.userId,
      data.eventId,
    );
  }

  @Put('event/list/assign')
  async assignListAccess(@Body() data: AccessListEventDto) {
    return this.dashboardService.assignListDashboardAccess(
      data.userIds,
      data.eventId,
    );
  }

  @Delete('event/revoke')
  async revokeAccess(@Body() data: AccessEventDto) {
    return this.dashboardService.revokeDashboardAccess(
      data.userId,
      data.eventId,
    );
  }

  @Get('event/:eventId/users')
  async getUsersByEvent(@Param() params: EventIdParamDto) {
    return this.dashboardService.getUsersByEvent(params.eventId);
  }

  @Get('event/:userId/events')
  async getEventsByUser(@Param() params: UserIdParamDto) {
    return this.dashboardService.getEventsByUser(params.userId);
  }
}
