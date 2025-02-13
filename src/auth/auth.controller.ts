import {
  BadRequestException,
  Body,
  Controller,
  Post,
  UnauthorizedException,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @UseInterceptors(FileInterceptor('imageFile'))
  @Post('register')
  async register(
    @UploadedFile() file: Express.Multer.File,
    @Body() body: RegisterDto,
  ) {
    if (body.password !== body.confirmPassword) {
      throw new BadRequestException('Passwords do not match');
    }

    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    return this.authService.register(body, file);
  }

  @Post('login')
  async login(@Body() body: LoginDto) {
    const user = await this.authService.validateUserByIdentifier(
      body.identifier,
      body.password,
    );
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    return this.authService.login(user);
  }
}
