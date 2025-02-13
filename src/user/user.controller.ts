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
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOkResponse,
  ApiOperation,
} from '@nestjs/swagger';
import { Sex, User } from '@prisma/client';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserService } from './user.service';

@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('me')
  @ApiOperation({ summary: 'Get authenticated user data' })
  @ApiOkResponse({
    description: 'Returns the authenticated user',
  })
  getMe(@Request() req: { user: User }) {
    return req.user;
  }

  @Patch('update')
  @UseInterceptors(FileInterceptor('imageFile'))
  @ApiOperation({ summary: 'Update user information' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description:
      'User update fields, including an optional image file, all fields are optional',
    required: false,
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string', example: 'Lucas Rosa' },
        document: { type: 'string', example: '0584303139' },
        email: { type: 'string', format: 'email', example: 'lucass@gmail.com' },
        bornAt: { type: 'string', format: 'date', example: '1990-01-01' },
        cep: { type: 'string', example: '12345-678' },
        sex: { type: 'string', enum: [Sex], example: 'MALE' },
        phone: { type: 'string', example: '61995585555' },
        imageFile: {
          type: 'string',
          format: 'binary',
          description: 'Image file for update',
        },
      },
    },
  })
  @ApiOkResponse({ description: 'User successfully updated.' })
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
