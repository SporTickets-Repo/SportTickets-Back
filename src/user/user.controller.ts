import { Controller, UseGuards, Get, Request } from '@nestjs/common';
import { User } from '@prisma/client';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';

@Controller('user')
export class UserController {



  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('me')
  getMe(@Request() req: { user: User }) {
    return req.user;
  }


}
