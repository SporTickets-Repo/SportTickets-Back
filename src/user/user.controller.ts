import { Controller, UseGuards, Get, Request, Patch, Body } from '@nestjs/common';
import { User } from '@prisma/client';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { UserService } from './user.service';
import { UpdateUserDto } from './dto/update-user.dto';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) { }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('me')
  getMe(@Request() req: { user: User }) {
    return req.user;
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Patch('update')
  updateUser(@Request() req: { user: User }, @Body() body: UpdateUserDto) {
    const userId = req.user.id;
    return this.userService.updateUser(userId, body);
  }

}
