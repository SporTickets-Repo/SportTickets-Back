import {
  BadRequestException,
  Body,
  Controller,
  Post,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() body: RegisterDto) {
    if (body.password !== body.confirmPassword) {
      throw new BadRequestException('Passwords do not match');
    }

    return this.authService.register(body);
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
