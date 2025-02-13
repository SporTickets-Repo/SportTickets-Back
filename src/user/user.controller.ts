import {
  Body,
  Controller,
  Get,
  Patch,
  Request,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { User } from '@prisma/client';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserService } from './user.service';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('me')
  getMe(@Request() req: { user: User }) {
    return req.user;
  }

  @UseInterceptors(FileInterceptor('imageFile'))
  @Patch('update')
  updateUser(
    @Request() req: { user: User },
    @Body() body: UpdateUserDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    if (file && !file.mimetype.startsWith('image')) {
      throw new Error('Invalid image file');
    }

    return this.userService.updateUser(req.user, body, file);
  }
}
