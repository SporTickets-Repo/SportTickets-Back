import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
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
import { Role, Sex, User } from '@prisma/client';
import { Roles } from 'src/common/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { RegisterUserDto } from './dto/register-user.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
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
        sex: {
          type: 'string',
          enum: [Sex.FEMALE, Sex.MALE],
          example: Sex.MALE,
          default: Sex.MALE,
          nullable: false,
        },
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
  @UseInterceptors(FileInterceptor('imageFile'))
  @Patch('update')
  updateUser(
    @Request() req: { user: User },
    @Body() body: UpdateUserDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    if (file && !file.mimetype.startsWith('image')) {
      throw new BadRequestException('Invalid image file');
    }

    return this.userService.updateUser(req.user, body, file);
  }

  @Roles(Role.ADMIN)
  @Patch('update-role/:id')
  async updateUserRole(
    @Param('id') userId: string,
    @Body() updateRoleDto: UpdateRoleDto,
  ) {
    return this.userService.updateUserRole(userId, updateRoleDto);
  }

  @Roles(Role.ADMIN)
  @Get('all')
  async getUsers() {
    return this.userService.getUsers();
  }

  @Get('by-email/:email')
  @ApiOperation({ summary: 'Get user details by email' })
  @ApiOkResponse({ description: 'Returns user details' })
  async getUserByEmail(@Param('email') email: string) {
    return this.userService.getUserByEmail(email);
  }

  @Post('register')
  @ApiOperation({ summary: 'Register a new user without password' })
  @ApiOkResponse({ description: 'User successfully created.' })
  async register(@Body() body: RegisterUserDto) {
    return this.userService.registerUser(body);
  }
}
